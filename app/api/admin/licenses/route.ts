import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { formatLicense } from "@/lib/licenses";
import { prisma } from "@/lib/prisma";
import { licenseCreateSchema } from "@/lib/validators";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    licenses: licenses.map(formatLicense),
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = licenseCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dữ liệu license không hợp lệ" },
      { status: 400 },
    );
  }

  const exists = await prisma.license.findUnique({
    where: { key: parsed.data.key },
  });

  if (exists) {
    return NextResponse.json(
      { message: "License key đã tồn tại" },
      { status: 409 },
    );
  }

  const expiresAt = parsed.data.expiresAt
    ? new Date(parsed.data.expiresAt)
    : null;

  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    return NextResponse.json(
      { message: "Ngày hết hạn không hợp lệ" },
      { status: 400 },
    );
  }

  const license = await prisma.license.create({
    data: {
      key: parsed.data.key,
      type: parsed.data.type,
      note: parsed.data.note,
      expiresAt,
      isActive: parsed.data.isActive,
    },
  });

  return NextResponse.json({ license: formatLicense(license) }, { status: 201 });
}
