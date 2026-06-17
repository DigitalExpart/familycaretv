import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateReferralCode(firstName?: string | null): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (firstName) {
    result += `-${firstName.toUpperCase().replace(/[^A-Z]/g, '')}`;
  }
  return result;
}

async function main() {
  console.log('Starting referral code backfill...');

  const usersWithoutCodes = await prisma.user.findMany({
    where: { referralCode: null },
  });

  console.log(`Found ${usersWithoutCodes.length} users missing referral codes.`);

  let updated = 0;
  for (const user of usersWithoutCodes) {
    let success = false;
    let attempts = 0;

    while (!success && attempts < 5) {
      try {
        const code = generateReferralCode(user.firstName);
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode: code },
        });
        success = true;
        updated++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation, retry
          attempts++;
        } else {
          console.error(`Failed to update user ${user.id}:`, error);
          break;
        }
      }
    }
    
    if (!success) {
      console.error(`Failed to generate unique code for user ${user.id} after 5 attempts.`);
    }
  }

  console.log(`Successfully generated referral codes for ${updated} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
