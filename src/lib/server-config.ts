const MINIMUM_AUTH_SECRET_LENGTH = 32;

export type ServerConfiguration = {
  ready: boolean;
  databaseConfigured: boolean;
  authSecretConfigured: boolean;
  trustedHostConfigured: boolean;
  missing: Array<"DATABASE_URL" | "AUTH_SECRET">;
};

export function getServerConfiguration(): ServerConfiguration {
  const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
  const authSecretConfigured = (process.env.AUTH_SECRET?.trim().length ?? 0) >= MINIMUM_AUTH_SECRET_LENGTH;
  const trustedHostConfigured = process.env.AUTH_TRUST_HOST === "true" || Boolean(process.env.VERCEL || process.env.CF_PAGES);
  const missing: ServerConfiguration["missing"] = [];

  if (!databaseConfigured) missing.push("DATABASE_URL");
  if (!authSecretConfigured) missing.push("AUTH_SECRET");

  return {
    ready: missing.length === 0,
    databaseConfigured,
    authSecretConfigured,
    trustedHostConfigured,
    missing,
  };
}
