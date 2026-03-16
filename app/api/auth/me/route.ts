import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    // Try to get prisma, but handle failure
    let client;
    try {
      client = prisma;
      if (!client) throw new Error("Prisma client not initialized");
    } catch (e: any) {
      console.error("Me API database error:", e);
      return NextResponse.json({ user: session, error: "Database not available" });
    }

    const user = await client.user.findUnique({
      where: { id: session.userId as string },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Me API error:", error);
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
}
