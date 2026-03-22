function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getDatabaseUrl() {
  return required("DATABASE_URL");
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
