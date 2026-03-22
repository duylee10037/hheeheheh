import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminPassword, getAdminUsername } from "@/lib/env";

export async function ensureAdminExists() {
  const username = getAdminUsername();
  const existing = await prisma.admin.findUnique({
    where: { username },
  });

  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(getAdminPassword(), 12);

  return await prisma.admin.create({
    data: {
      username,
      passwordHash,
    },
  });
}
