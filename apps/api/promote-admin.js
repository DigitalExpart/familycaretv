require('dotenv').config({ path: __dirname + '/.env' });
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const targetEmail = process.argv[2] || 'familycare@admin.com';

  console.log(`Checking user: ${targetEmail}...`);

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    console.log(`User ${targetEmail} not found. Searching all users...`);
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true, planTier: true }
    });
    console.log('Registered Users:');
    allUsers.forEach(u => console.log(`- ${u.email} (Role: ${u.role}, Tier: ${u.planTier})`));
    return;
  }

  if (user.role === 'ADMIN') {
    console.log(`✅ User ${user.email} is ALREADY an ADMIN.`);
  } else {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    });
    console.log(`🎉 Successfully promoted ${updated.email} to ADMIN!`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
