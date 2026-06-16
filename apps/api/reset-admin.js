const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  if (admins.length > 0) {
    console.log('Found Admins:');
    for (const admin of admins) {
      console.log(`- Email: ${admin.email}`);
    }
    
    // Reset password for the first admin to "password123" for testing
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: admins[0].id },
      data: { passwordHash: hashedPassword }
    });
    console.log(`\nPassword for ${admins[0].email} has been reset to: ${newPassword}`);
  } else {
    console.log('No admins found in the database. Creating one...');
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: 'familycare@admin.com',
        firstName: 'System',
        lastName: 'Admin',
        passwordHash: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log(`Created admin: familycare@admin.com / ${newPassword}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
