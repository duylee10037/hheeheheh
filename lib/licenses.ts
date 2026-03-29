import { License } from "@prisma/client";

export function isLicenseExpired(expiresAt: Date | null) {
  return expiresAt ? expiresAt.getTime() < Date.now() : false;
}

export function formatLicense(license: License) {
  return {
    ...license,
    createdAt: license.createdAt.toISOString(),
    expiresAt: license.expiresAt?.toISOString() ?? null,
  };
}

export function getLicenseTypeLabel(type: License["type"]) {
  return type === "CPP" ? "C++ project" : "Python tool";
}
