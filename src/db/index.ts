import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Reuse the client across Next.js dev-server hot reloads to avoid exhausting
// the local Postgres connection limit; each serverless invocation in
// production still gets its own fresh module instance.
declare global {
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

const client = global.__dbClient ?? postgres(connectionString, { max: 1 });

if (process.env.NODE_ENV !== "production") {
  global.__dbClient = client;
}

export const db = drizzle(client, { schema });
