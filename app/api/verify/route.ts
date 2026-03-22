import { NextResponse } from "next/server";
import { isLicenseExpired } from "@/lib/licenses";
import { prisma } from "@/lib/prisma";
import { verifySchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        valid: false,
        message: "Dữ liệu xác minh không hợp lệ",
        expires_at: null,
        bound: false,
      },
      { status: 400 },
    );
  }

  const { license_key, machine_code } = parsed.data;

  const license = await prisma.license.findUnique({
    where: { key: license_key },
  });

  if (!license) {
    return NextResponse.json({
      valid: false,
      message: "Key không tồn tại",
      expires_at: null,
      bound: false,
    });
  }

  if (!license.isActive) {
    return NextResponse.json({
      valid: false,
      message: "Key đã bị vô hiệu hóa",
      expires_at: license.expiresAt?.toISOString() ?? null,
      bound: Boolean(license.machineCode),
    });
  }

  if (isLicenseExpired(license.expiresAt)) {
    return NextResponse.json({
      valid: false,
      message: "Key đã hết hạn",
      expires_at: license.expiresAt?.toISOString() ?? null,
      bound: Boolean(license.machineCode),
    });
  }

  if (!license.machineCode) {
    const updated = await prisma.license.update({
      where: { id: license.id },
      data: { machineCode: machine_code },
    });

    return NextResponse.json({
      valid: true,
      message: "License hợp lệ",
      expires_at: updated.expiresAt?.toISOString() ?? null,
      bound: true,
    });
  }

  if (license.machineCode !== machine_code) {
    return NextResponse.json({
      valid: false,
      message: "Key đã được kích hoạt trên thiết bị khác",
      expires_at: license.expiresAt?.toISOString() ?? null,
      bound: true,
    });
  }

  return NextResponse.json({
    valid: true,
    message: "License hợp lệ",
    expires_at: license.expiresAt?.toISOString() ?? null,
    bound: true,
  });
}
