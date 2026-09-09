import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: `${process.env.DATABASE_URL}`,
  },
  dialect: "sqlite",
  schema: "src/db/schema.ts",
});
