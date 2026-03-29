import { NextResponse } from "next/server";
import { verifyAndBindLicense } from "@/lib/license-verification";
import { verifySchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        valid: false,
        message: "Du lieu xac minh khong hop le",
        expires_at: null,
        bound: false,
      },
      { status: 400 },
    );
  }

  const { license_key, machine_code } = parsed.data;
  const result = await verifyAndBindLicense(license_key, machine_code, "PYTHON");

  if (!result.ok) {
    return NextResponse.json({
      valid: false,
      message: result.message,
      expires_at: result.license?.expiresAt?.toISOString() ?? null,
      bound: result.bound,
    });
  }

  return NextResponse.json({
    valid: true,
    message: "License hop le",
    expires_at: result.license.expiresAt?.toISOString() ?? null,
    bound: result.bound,
  });
}
