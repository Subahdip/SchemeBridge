const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Load .env.local
const envLocalPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  console.log("Testing PostgreSQL connection via DATABASE_URL...");
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL database!");
    const result = await client.query("SELECT NOW() as now, version() as version;");
    console.log("Database Timestamp:", result.rows[0].now);
    console.log("PostgreSQL Version:", result.rows[0].version.split(",")[0]);
    
    // Check if schemes table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'schemes';
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log("✅ 'schemes' table already exists in public schema.");
      const countResult = await client.query("SELECT COUNT(*) as count FROM schemes;");
      console.log(`Current scheme row count: ${countResult.rows[0].count}`);
    } else {
      console.log("ℹ️ 'schemes' table does not exist yet. Needs migration.");
    }

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ PostgreSQL Connection Error:", err.message);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
