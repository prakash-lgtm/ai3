const { execSync } = require('child_process');

const DATABASE_URL = "postgresql://neondb_owner:npg_6lcdBZqhXD3t@ep-restless-mountain-anm4t2dq-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

process.env.DATABASE_URL = DATABASE_URL;

try {
  console.log('--- STARTING PRISMA SYNC ---');
  execSync('npx prisma db push', { stdio: 'inherit', env: process.env });
  console.log('--- SYNC SUCCESSFUL ---');
  
  console.log('--- GENERATING CLIENT ---');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  console.log('--- GENERATE SUCCESSFUL ---');
} catch (error) {
  console.error('--- SYNC FAILED ---');
  console.error(error.message);
  process.exit(1);
}
