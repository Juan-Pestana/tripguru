//import { drizzle } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/node-postgres";
//import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

import { Pool } from "pg";
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool });

export { db };
