import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminPassword, getAdminUsername } from "@/lib/env";

// Setup utility only. Do not call this from runtime login routes.
export async function seedAdminFromEnv() {
  const username = getAdminUsername();
  const password = getAdminPassword();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.admin.findUnique({
    where: { username },
  });

  if (existing) {
    const updatedAdmin = await prisma.admin.update({
      where: { id: existing.id },
      data: { passwordHash },
    });

    return {
      admin: updatedAdmin,
      created: false,
      updated: true,
    };
  }

  const admin = await prisma.admin.create({
    data: {
      username,
      passwordHash,
    },
  });

  return {
    admin,
    created: true,
    updated: false,
  };
}
