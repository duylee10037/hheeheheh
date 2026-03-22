import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  const existing = await prisma.license.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ message: "Không tìm thấy license" }, { status: 404 });
  }

  await prisma.license.update({
    where: { id },
    data: { machineCode: null },
  });

  return NextResponse.json({ success: true });
}
