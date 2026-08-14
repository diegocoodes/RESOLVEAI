import { spawnSync } from "node:child_process";
import path from "node:path";

if (process.env.VERCEL_ENV !== "production") {
  console.log("Migrations ignoradas fora do ambiente de produção da Vercel.");
  process.exit(0);
}

const prismaExecutable = path.resolve(
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);

console.log("Aplicando migrations pendentes no banco de produção...");

const result = spawnSync(prismaExecutable, ["migrate", "deploy"], {
  env: process.env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
