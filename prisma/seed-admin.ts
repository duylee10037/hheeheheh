import { seedAdminFromEnv } from "../lib/admin";
import { prisma } from "../lib/prisma";

async function main() {
  const result = await seedAdminFromEnv();
  console.log(
    result.created
      ? `Admin created: ${result.admin.username}`
      : `Admin already exists: ${result.admin.username}`,
  );
}

main()
  .catch((error) => {
    console.error("Seed admin failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
