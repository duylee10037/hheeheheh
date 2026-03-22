function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  adminUsername: required("ADMIN_USERNAME"),
  adminPassword: required("ADMIN_PASSWORD"),
};
