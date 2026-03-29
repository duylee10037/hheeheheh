import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getGetKeyGame, getGetKeySecret } from "@/lib/env";
import { verifyAndBindLicense } from "@/lib/license-verification";

function md5(value: string) {
  return createHash("md5").update(value).digest("hex");
}

function formatExp(expiresAt: Date | null) {
  if (!expiresAt) {
    return "Khong gioi han";
  }

  return expiresAt.toISOString();
}

export async function POST(request: Request) {
  const body = await request.text();
  const params = new URLSearchParams(body);

  const game = params.get("game")?.trim() || "";
  const userKey = params.get("user_key")?.trim() || "";
  const serial = params.get("serial")?.trim() || "";
  const expectedGame = getGetKeyGame();

  if (!game || !userKey || !serial) {
    return NextResponse.json(
      {
        status: false,
        reason: "Thieu game, user_key hoac serial",
      },
      { status: 400 },
    );
  }

  if (game !== expectedGame) {
    return NextResponse.json(
      {
        status: false,
        reason: `Game khong hop le. Yeu cau ${expectedGame}`,
      },
      { status: 400 },
    );
  }

  const result = await verifyAndBindLicense(userKey, serial, "CPP");

  if (!result.ok) {
    return NextResponse.json({
      status: false,
      reason: result.message,
    });
  }

  const rng = Math.floor(Date.now() / 1000);
  const token = md5(
    `${expectedGame}-${userKey}-${serial}-${getGetKeySecret()}`,
  );

  return NextResponse.json({
    status: true,
    data: {
      token,
      rng,
      EXP: formatExp(result.license.expiresAt),
    },
  });
}
