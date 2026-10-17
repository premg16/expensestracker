import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: ReturnType<typeof createDb> | undefined;

function createDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return drizzle(neon(url), { schema });
}

// Lazy so importing this module never throws (next build runs without env).
export function getDb() {
  db ??= createDb();
  return db;
}
