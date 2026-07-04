const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Inserting bucket...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('books', 'books', true) 
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Creating policy...');
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Access" 
      ON storage.objects FOR ALL 
      USING ( bucket_id = 'books' );
    `);
    
    console.log('Bucket and policy created!');
  } catch (e) {
    console.log('Error (maybe it already exists or permissions issue):', e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
