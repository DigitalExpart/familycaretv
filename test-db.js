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
  if (process.env.DATABASE_URL) {
    await testConn(process.env.DATABASE_URL, "DATABASE_URL");
  } else {
    console.log("No DATABASE_URL environment variable provided.");
  }
})();
