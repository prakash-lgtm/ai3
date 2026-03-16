import { groq } from "@ai-sdk/groq";
import { ollama } from "ollama-ai-provider-v2";
import { fireworks } from "@ai-sdk/fireworks";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, generateText } from "ai";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// Strip image parts for text-only models
function stripImageParts(messages: unknown[]): unknown[] {
  return (messages as Array<{ role: string; content: unknown }>).map((msg) => {
    if (!Array.isArray(msg.content)) return msg;
    return {
      ...msg,
      content: (msg.content as Array<{ type?: string }>).filter(
        (p) => p?.type !== "image"
      ),
    };
  });
}

export async function GET() {
  return NextResponse.json({ 
    status: "Chat API is alive", 
    time: new Date().toISOString(),
    groq_key_found: !!process.env.GROQ_API_KEY
  });
}

export async function POST(req: Request) {
  let selectedModel = "groq";
  console.log("Chat API POST called");
  
  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await req.json();
    const { messages, system, tools, threadId } = body;
    selectedModel = body.selectedModel || "groq";
    const textMessages = stripImageParts(messages);

    const session = await getSession();
    const userId = session?.userId as string | undefined;

    // Ensure thread exists and save the latest user message
    const lastUserMessage = messages[messages.length - 1];
    if (prisma && threadId && lastUserMessage?.role === "user") {
      try {
        await prisma.thread.upsert({
          where: { id: threadId },
          update: {
            model: selectedModel,
            userId: userId,
            messages: {
              create: {
                role: "user",
                content: typeof lastUserMessage.content === "string" 
                  ? lastUserMessage.content 
                  : JSON.stringify(lastUserMessage.content),
              },
            },
          },
          create: {
            id: threadId,
            model: selectedModel,
            userId: userId,
            messages: {
              create: {
                role: "user",
                content: typeof lastUserMessage.content === "string" 
                  ? lastUserMessage.content 
                  : JSON.stringify(lastUserMessage.content),
              },
            },
          },
        });
      } catch (dbError) {
        console.error("Prisma error (non-fatal):", dbError);
      }
    }

    // Route to the correct provider based on selectedModel
    let aiModel;
    if (selectedModel === "ollama") {
      aiModel = ollama("llama3");
    } else if (selectedModel === "fireworks") {
      aiModel = fireworks("accounts/fireworks/models/llama-v3p3-70b-instruct");
    } else {
      aiModel = groq("llama-3.3-70b-versatile");
    }

    const { text } = await generateText({
      model: aiModel,
      system,
      messages: await convertToModelMessages(
        textMessages as Parameters<typeof convertToModelMessages>[0]
      ),
      ...(tools ? { tools: frontendTools(tools) } : {}),
    });

    if (prisma && threadId) {
      try {
        await prisma.message.create({
          data: {
            role: "assistant",
            content: text,
            threadId: threadId,
          },
        });
      } catch (dbError) {
        console.error("Prisma error (non-fatal assistant msg):", dbError);
      }
    }

    return NextResponse.json({
      reply: text,
    });
  } catch (error: any) {
    console.error("CRITICAL Chat error:", error);
    const message = error?.message ?? "";

    let errorMessage = "Unknown error. Please try again.";
    let status = 500;

    if (message.includes("rate_limit") || message.includes("quota") || error?.status === 429) {
      errorMessage = "⚡ Rate limited. Please wait a moment or switch to another provider.";
      status = 429;
    } else if (message.includes("ECONNREFUSED") || message.includes("localhost:11434")) {
      errorMessage = "🖥️ Ollama is not running. Start it with: ollama serve";
      status = 503;
    } else if (message.includes("API key") || error?.status === 401) {
      errorMessage = `🔑 Invalid API key for ${selectedModel || "provider"}. Check .env.local.`;
      status = 401;
    } else {
      errorMessage = `Error: ${message || "Internal Server Error"}`;
    }

    return NextResponse.json({ error: errorMessage }, { status });
  }
}