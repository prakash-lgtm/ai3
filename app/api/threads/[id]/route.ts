import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = params.id;
    const thread = await prisma.thread.findUnique({
      where: { id: threadId, userId: session.userId as string },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json({ thread });
  } catch (error: any) {
    console.error("Thread Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const threadId = params.id;
    // Prisma delete will cascade delete messages due to onDelete: Cascade
    await prisma.thread.delete({
      where: { id: threadId, userId: session.userId as string },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Thread Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
