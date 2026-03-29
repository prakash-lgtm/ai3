import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { contact, otp } = await req.json();

    if (!contact || !otp) {
      return NextResponse.json(
        { error: "Contact and OTP are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: contact.includes("@") ? { email: contact } : { phone: contact },
    }) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Success, clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpires: null },
    });

    const token = await createToken({ userId: user.id, email: user.email });
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ message: "Login successful", user: { id: user.id, email: user.email } });
  } catch (error: any) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
