import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: ".env" });

console.log("conn-string------------------", process.env.DATABASE_URL);
export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		url: process.env.DATABASE_URL!,
	},
});
