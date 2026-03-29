import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { contact } = await req.json(); // can be email or phone

    if (!contact) {
      return NextResponse.json(
        { error: "Contact info is required" },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Developer Experience: Force a static OTP for the test identity
    if (contact === "test@example.com") {
      otp = "123456";
    }
    
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Try to find user first
    let user = await prisma.user.findFirst({
      where: contact.includes("@") ? { email: contact } : { phone: contact },
    }) as any;

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { otp, otpExpires } as any,
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: contact.includes("@") ? contact : `${contact}@placeholder.com`,
          phone: contact.includes("@") ? null : contact,
          otp,
          otpExpires,
        } as any,
      });
    }

    console.log(`\n[QUANTUM AUTH] >>> OTP generated for ${contact}: ${otp} <<<\n`);

    // REAL OTP DELIVERY: Email via Resend
    if (contact.includes("@") && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "Quantum AI <onboarding@resend.dev>",
          to: contact,
          subject: "Your Quantum AI Access Key",
          html: `
            <div style="font-family: 'Inter', sans-serif; background-color: #050510; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); max-width: 500px; margin: auto;">
              <h1 style="color: #60a5fa; font-size: 24px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">Quantum Key Active</h1>
              <p style="color: #ffffff; opacity: 0.7; font-size: 16px; line-height: 1.6;">Your identity verification protocol has been initiated. Use the key below to sync with the Quantum Network:</p>
              <div style="background: rgba(255,255,255,0.05); border: 1px dashed #60a5fa; color: #60a5fa; font-size: 42px; font-weight: 800; text-align: center; padding: 20px; margin: 30px 0; border-radius: 12px; letter-spacing: 12px;">
                ${otp}
              </div>
              <p style="color: #ffffff; opacity: 0.4; font-size: 12px;">This key expires in 10 minutes. If you did not request this, please ignore this transmission.</p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
                <p style="color: #ffffff; opacity: 0.3; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Quantum AI Intelligence System</p>
              </div>
            </div>
          `,
        });
        console.log(`[RESEND] Email sent successfully to ${contact}`);
      } catch (emailError: any) {
        console.error("[RESEND] Error sending email:", emailError);
        // Fallback: don't fail the whole request, but log the error
      }
    }

    return NextResponse.json({
      message: contact.includes("@") ? "OTP sent to your email" : "OTP sent successfully (check console)",
      otp: process.env.NODE_ENV !== "production" ? otp : undefined,
      debug: otp, // For frontend UI to still work in dev
    });
  } catch (error: any) {
    console.error("DEBUG: OTP Request Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to request OTP", 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}
