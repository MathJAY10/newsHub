import { PrismaClient } from './app/generated/prisma/index.js';

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to DB');
    
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Query result:', result);
    
  } catch (e) {
    console.error('❌ DB connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
})();