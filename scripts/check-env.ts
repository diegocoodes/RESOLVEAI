import "dotenv/config";
import { getServerConfiguration } from "../src/lib/server-config";

const configuration = getServerConfiguration();

if (!configuration.ready) {
  console.error(`Configuração incompleta: ${configuration.missing.join(", ")}.`);
  console.error("Copie .env.example para .env e use credenciais PostgreSQL/Prisma Postgres válidas.");
  process.exit(1);
}

try {
  const url = new URL(process.env.DATABASE_URL!);
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") throw new Error();
} catch {
  console.error("DATABASE_URL deve ser uma URL PostgreSQL válida.");
  process.exit(1);
}

console.log("Variáveis obrigatórias configuradas. Valores permaneceram ocultos.");
