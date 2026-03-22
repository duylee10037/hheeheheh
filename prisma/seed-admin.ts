import bcrypt from "bcryptjs";
import { env } from "../lib/env";
import { prisma } from "../lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash(env.adminPassword, 12);

  await prisma.admin.upsert({
    where: { username: env.adminUsername },
    update: { passwordHash },
    create: {
      username: env.adminUsername,
      passwordHash,
    },
  });

  console.log(`Admin ready: ${env.adminUsername}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
