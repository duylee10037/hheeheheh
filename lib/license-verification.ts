import { License, LicenseType } from "@prisma/client";
import { isLicenseExpired } from "@/lib/licenses";
import { prisma } from "@/lib/prisma";

export type LicenseVerificationResult =
  | {
      ok: true;
      license: License;
      bound: boolean;
    }
  | {
      ok: false;
      message: string;
      license: License | null;
      bound: boolean;
    };

export async function verifyAndBindLicense(
  licenseKey: string,
  machineCode: string,
  expectedType: LicenseType,
): Promise<LicenseVerificationResult> {
  const license = await prisma.license.findUnique({
    where: { key: licenseKey },
  });

  if (!license) {
    return {
      ok: false,
      message: "Key khong ton tai",
      license: null,
      bound: false,
    };
  }

  if (license.type !== expectedType) {
    return {
      ok: false,
      message:
        expectedType === "CPP"
          ? "Key nay khong danh cho project C++"
          : "Key nay khong danh cho tool Python",
      license,
      bound: Boolean(license.machineCode),
    };
  }

  if (!license.isActive) {
    return {
      ok: false,
      message: "Key da bi vo hieu hoa",
      license,
      bound: Boolean(license.machineCode),
    };
  }

  if (isLicenseExpired(license.expiresAt)) {
    return {
      ok: false,
      message: "Key da het han",
      license,
      bound: Boolean(license.machineCode),
    };
  }

  if (!license.machineCode) {
    const updated = await prisma.license.update({
      where: { id: license.id },
      data: { machineCode },
    });

    return {
      ok: true,
      license: updated,
      bound: true,
    };
  }

  if (license.machineCode !== machineCode) {
    return {
      ok: false,
      message: "Key da duoc kich hoat tren thiet bi khac",
      license,
      bound: true,
    };
  }

  return {
    ok: true,
    license,
    bound: true,
  };
}
