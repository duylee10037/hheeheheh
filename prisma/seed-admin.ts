import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const [{ seedAdminFromEnv }, { prisma }] = await Promise.all([
    import("../lib/admin"),
    import("../lib/prisma"),
  ]);

  const result = await seedAdminFromEnv();
  console.log(
    result.created
      ? `Admin created: ${result.admin.username}`
      : result.updated
        ? `Admin password updated: ${result.admin.username}`
        : `Admin already exists: ${result.admin.username}`,
  );

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error("Seed admin failed:", error);
    process.exit(1);
  });
