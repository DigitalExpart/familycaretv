const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
  try {
    console.log('Creating policy...');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Access Audio" 
      ON storage.objects FOR ALL 
      USING ( bucket_id = 'audio' );
    `);
    
    console.log('Policy created!');
  } catch (e) {
    console.log('Error:', e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
