// Node 20.6+ built-in .env loader. Lets tests import modules that touch
// "@/db" (which validates DATABASE_URL at import time) without a separate
// dotenv dependency. Safe to no-op if `.env` doesn't exist (e.g. some CI setups).
try {
  process.loadEnvFile(".env");
} catch {
  // no .env file present - tests relying on DATABASE_URL will fail on their own
}
