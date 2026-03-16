import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  return NextResponse.json({ status: "Registration API is active" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { email, password, username } = body;

    // Try to get prisma, but handle failure
    let client;
    try {
      client = prisma;
      if (!client) throw new Error("Prisma client not initialized");
    } catch (e: any) {
      return NextResponse.json({ success: false, error: "Database initialization failed: " + e.message }, { status: 503 });
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await client.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    // Create user
    const hashed = await hashPassword(password);
    const user = await client.user.create({
      data: {
        email,
        password: hashed,
        username,
      },
    });

    // Create token
    const token = await createToken({ userId: user.id, email: user.email });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
