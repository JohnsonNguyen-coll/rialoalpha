import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const client = createClient({
  url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateSchema() {
  console.log("🚀 Manually adding takeProfit to Strategy table...");
  try {
    await client.execute("ALTER TABLE Strategy ADD COLUMN takeProfit REAL DEFAULT 10;");
    console.log("✅ Column 'takeProfit' added to 'Strategy' table.");
  } catch (error) {
    if (error.message.includes("duplicate column name")) {
      console.log("ℹ️ Column 'takeProfit' already exists.");
    } else {
      console.error("❌ Error adding column:", error.message);
    }
  }
  process.exit(0);
}

updateSchema();
