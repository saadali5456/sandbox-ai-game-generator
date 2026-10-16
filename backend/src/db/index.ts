import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const sanitizedConnectionString = connectionString.replace(/([?&])sslmode=require(&|$)/, "$1");

const pool = new Pool({
  connectionString: sanitizedConnectionString,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool);