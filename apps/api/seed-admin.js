const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'familycare@admin.com';
  const password = 'Familycare';
  
  const hash = await bcrypt.hash(password, 12);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: 'ADMIN' },
    create: {
      email,
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      hasConsentedToPrivacy: true
    }
  });
  
  console.log('Admin user created/updated:', user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
