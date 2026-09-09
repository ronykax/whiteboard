import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    authToken: `${process.env.DATABASE_AUTH_TOKEN}`,
    url: `${process.env.DATABASE_URL}`,
  },
  dialect: "turso",
  schema: "src/db/schema.ts",
});
