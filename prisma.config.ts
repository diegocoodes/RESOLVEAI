import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `prisma generate` does not open a connection. Commands that access the
    // database are preceded by `npm run check:env` in the documented workflow.
    // Runtime traffic uses the pooled DATABASE_URL. Prefer a direct connection
    // for migration and seed commands when the provider exposes one.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
