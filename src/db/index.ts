import { drizzle } from "drizzle-orm/neon-http";
//import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

// import { Pool } from "pg";

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   statement_timeout: 10000 // 10 seconds
// });
//const db = drizzle({ client: pool, schema });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

export { db };
