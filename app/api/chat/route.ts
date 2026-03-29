import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { fireworks } from "@ai-sdk/fireworks";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// REMOVED edge runtime because Prisma/SQLite needs Node.js
// export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.userId as string | undefined;

    const body = await req.json();
    const { messages, selectedModel, threadId: existingThreadId } = body;
    
    let threadId = existingThreadId;

    console.log("Chat Request Body:", JSON.stringify(body, null, 2));

    // 1. Handle Clipdrop Image Generation (Special Case)
    if (selectedModel === "clipdrop") {
      const lastMessage = messages[messages.length - 1];
      let prompt = "";
      if (lastMessage?.content) {
         prompt = Array.isArray(lastMessage.content) 
            ? lastMessage.content.map((c: any) => c.text || c.content || "").join(" ") 
            : lastMessage.content;
      }
      if (!prompt) prompt = "a beautiful futuristic city";
      
      console.log("Calling Clipdrop for image generation with prompt:", prompt);
      const form = new FormData();
      form.append("prompt", prompt);
      
      const res = await fetch("https://clipdrop-api.co/text-to-image/v1", {
        method: "POST",
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY || "" },
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error("Clipdrop API Error: " + text);
      }

      const arrayBuffer = await res.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      const markdown = `![Generated Image](data:image/jpeg;base64,${base64})`;

      // Create a Vercel AI Data Stream formatted response
      const stream = new ReadableStream({
        start(controller) {
          const textChunk = JSON.stringify(markdown);
          controller.enqueue(new TextEncoder().encode(`0:${textChunk}\n`));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Vercel-AI-Data-Stream": "v1"
        }
      });
    }

    // 2. Normal Chat Logic
    let modelProvider;
    if (selectedModel === "groq") {
      modelProvider = groq("llama-3.3-70b-versatile");
    } else if (selectedModel === "fireworks") {
      modelProvider = fireworks("accounts/fireworks/models/llama-v3p3-70b-instruct");
    } else {
      modelProvider = google("gemini-1.5-flash-latest");
    }

    // Normalize messages to CoreMessage[] format
    const normalizedMessages = messages.map((m: any) => {
      let content = "";
      const messageContent = m.parts || m.content;
      
      if (Array.isArray(messageContent)) {
        content = messageContent
          .map((part: any) => {
            if (typeof part === "string") return part;
            if (part && typeof part === "object") {
              if ("text" in part) return part.text;
              if ("content" in part) return part.content;
            }
            return "";
          })
          .join("");
      } else if (typeof messageContent === "string") {
        content = messageContent;
      }

      return {
        role: m.role === "user" ? "user" : "assistant",
        content: content || " ",
      };
    });

    // 3. Persist User Message and Thread
    const lastUserMessage = normalizedMessages[normalizedMessages.length - 1];
    if (userId && lastUserMessage.role === "user") {
      if (!threadId) {
        // Create new thread
        const newThread = await prisma.thread.create({
          data: {
            userId,
            model: selectedModel,
            title: lastUserMessage.content.slice(0, 40) + (lastUserMessage.content.length > 40 ? "..." : ""),
          },
        });
        threadId = newThread.id;
      }

      await prisma.message.create({
        data: {
          threadId,
          role: "user",
          content: lastUserMessage.content,
        },
      });
    }

    const result = streamText({
      model: modelProvider,
      messages: normalizedMessages,
      onFinish: async ({ text }) => {
        if (userId && threadId) {
          try {
            await prisma.message.create({
              data: {
                threadId,
                role: "assistant",
                content: text,
              },
            });
            // Update thread timestamp
            await prisma.thread.update({
              where: { id: threadId },
              data: { updatedAt: new Date() },
            });
          } catch (e) {
            console.error("Error saving assistant message:", e);
          }
        }
      },
    });

    const response = result.toUIMessageStreamResponse();
    
    // Add threadId to response headers so client can track it
    if (threadId) {
      response.headers.set("x-thread-id", threadId);
    }

    return response;
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}