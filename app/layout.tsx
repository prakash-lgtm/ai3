import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobilePreviewWrapper } from "@/components/mobile-preview-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantum AI — Next-Gen Intelligence",
  description:
    "Quantum AI is a cutting-edge artificial intelligence platform powered by advanced large language models. Experience the future of AI-powered conversations.",
  keywords: ["Quantum AI", "artificial intelligence", "AI chat", "LLM", "Groq"],
  openGraph: {
    title: "Quantum AI — Next-Gen Intelligence",
    description: "Experience the future of AI-powered conversations.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          <MobilePreviewWrapper>{children}</MobilePreviewWrapper>
        </TooltipProvider>
      </body>
    </html>
  );
}
