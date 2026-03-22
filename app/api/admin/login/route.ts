import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Du lieu dang nhap khong hop le" },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username: parsed.data.username },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Sai tai khoan hoac mat khau" },
        { status: 401 },
      );
    }

    const matched = await bcrypt.compare(parsed.data.password, admin.passwordHash);

    if (!matched) {
      return NextResponse.json(
        { message: "Sai tai khoan hoac mat khau" },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      adminId: admin.id,
      username: admin.username,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LOGIN_ROUTE_ERROR:", {
      error,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasPostgresPrismaDatabaseUrl: Boolean(
        process.env.POSTGRES_PRISMA_DATABASE_URL,
      ),
      hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      hasAdminUsername: Boolean(process.env.ADMIN_USERNAME),
    });

    return NextResponse.json(
      { message: "Khong the dang nhap luc nay" },
      { status: 500 },
    );
  }
}
