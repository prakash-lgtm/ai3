import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

async function test() {
  const dbPath = path.resolve(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter } as any);

  try {
    const contact = "test@example.com";
    const otp = "123456";
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.upsert({
      where: { email: contact },
      update: { otp, otpExpires },
      create: {
        email: contact,
        otp,
        otpExpires,
      },
    });

    console.log("Upsert successful:", user.id);
  } catch (err: any) {
    console.error("Upsert failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
