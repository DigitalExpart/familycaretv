const { Client } = require('pg');

const testConn = async (url, name) => {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`[SUCCESS] Connected to ${name}`);
    await client.end();
  } catch (e) {
    console.error(`[ERROR] Failed to connect to ${name}: ${e.message}`);
  }
};

(async () => {
  await testConn("postgresql://postgres.qmwwvvgntkluaxbcyokv:FAMILYCARETV%40123@aws-0-us-east-1.pooler.supabase.com:6543/postgres", "Pooler Port 6543");
  await testConn("postgresql://postgres.qmwwvvgntkluaxbcyokv:FAMILYCARETV%40123@aws-0-us-east-1.pooler.supabase.com:5432/postgres", "Pooler Port 5432");
  await testConn("postgresql://postgres:FAMILYCARETV%40123@db.qmwwvvgntkluaxbcyokv.supabase.co:5432/postgres", "Direct Port 5432");
})();
