import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ threads: [] });
    }

    const threads = await prisma.thread.findMany({
      where: { userId: session.userId as string },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ threads });
  } catch (error: any) {
    console.error("Threads Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { model, title } = await req.json();

    const thread = await prisma.thread.create({
      data: {
        userId: session.userId as string,
        model: model || "groq",
        title: title || "New Chat",
      },
    });

    return NextResponse.json({ thread });
  } catch (error: any) {
    console.error("Thread Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
