import { drizzle } from "drizzle-orm/libsql";

export const db = drizzle({
  connection: {
    authToken: `${process.env.DATABASE_AUTH_TOKEN}`,
    url: `${process.env.DATABASE_URL}`,
  },
});
