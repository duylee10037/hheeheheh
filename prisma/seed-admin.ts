import bcrypt from "bcryptjs";
import { getAdminPassword, getAdminUsername } from "../lib/env";
import { prisma } from "../lib/prisma";

async function main() {
  const username = getAdminUsername();
  const password = getAdminPassword();
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash },
    create: {
      username,
      passwordHash,
    },
  });

  console.log(`Admin ready: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
