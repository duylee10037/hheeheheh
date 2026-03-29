import { z } from "zod";

export const licenseTypeSchema = z.enum(["PYTHON", "CPP"]);

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const licenseCreateSchema = z.object({
  key: z.string().trim().min(3).max(100),
  type: licenseTypeSchema,
  note: z.string().trim().max(300).optional().default(""),
  expiresAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  isActive: z.boolean().optional().default(true),
});

export const verifySchema = z.object({
  license_key: z.string().trim().min(1),
  machine_code: z.string().trim().length(32),
});
