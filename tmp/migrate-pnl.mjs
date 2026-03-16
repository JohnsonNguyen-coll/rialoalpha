import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateSchema() {
  console.log("🚀 Manually updating Turso schema...");
  try {
    // Check if column exists or just try to add it
    // SQLite doesn't have "IF NOT EXISTS" for ADD COLUMN in older versions, 
    // but LibSql/newer SQLite supports it in some ways, or we just catch the error.
    await client.execute("ALTER TABLE Trade ADD COLUMN pnl REAL DEFAULT 0;");
    console.log("✅ Column 'pnl' added to 'Trade' table.");
  } catch (error) {
    if (error.message.includes("duplicate column name")) {
      console.log("ℹ️ Column 'pnl' already exists.");
    } else {
      console.error("❌ Error adding column:", error.message);
    }
  }

  // Also make sure Strategy status is correct if we want to support 'completed'
  // Strategy model has status @default("active")
  
  process.exit(0);
}

updateSchema();
