import { PrismaClient } from "@prisma/client";

import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const prisma = new PrismaClient({
  datasourceUrl: `file:${dbPath}`,
} as any);

async function main() {
  console.log("Checking database connection...");
  try {
    const userCount = await prisma.user.count();
    console.log("Connection successful!");
    console.log("Current User count:", userCount);
    
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log("Tables found:", tables);
  } catch (error) {
    console.error("Database check failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
