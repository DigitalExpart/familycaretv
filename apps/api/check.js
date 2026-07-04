const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
prisma.referral.findMany({ include: { referrer: true, referredUser: true } }).then(res => { console.log(JSON.stringify(res, null, 2)); }).catch(console.error).finally(()=>prisma.$disconnect());
