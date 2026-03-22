import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminPassword, getAdminUsername } from "@/lib/env";

// Setup utility only. Do not call this from runtime login routes.
export async function seedAdminFromEnv() {
  const username = getAdminUsername();
  const password = getAdminPassword();

  const existing = await prisma.admin.findUnique({
    where: { username },
  });

  if (existing) {
    return {
      admin: existing,
      created: false,
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({
    data: {
      username,
      passwordHash,
    },
  });

  return {
    admin,
    created: true,
  };
}
