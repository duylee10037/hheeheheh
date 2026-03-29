function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getDatabaseUrl() {
  const value =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_DATABASE_URL ||
    process.env.POSTGRES_URL;

  if (!value) {
    throw new Error(
      "Missing database URL. Set DATABASE_URL or use a supported Vercel Postgres variable.",
    );
  }

  return value;
}

export function getJwtSecret() {
  return required("JWT_SECRET");
}

export function getAdminUsername() {
  return required("ADMIN_USERNAME");
}

export function getAdminPassword() {
  return required("ADMIN_PASSWORD");
}

export function getGetKeyGame() {
  return process.env.GETKEY_GAME || "PUBG";
}

export function getGetKeySecret() {
  return process.env.GETKEY_SECRET || "Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E";
}
