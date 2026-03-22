import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { ensureAdminExists } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    await ensureAdminExists();

    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dữ liệu đăng nhập không hợp lệ" },
        { status: 400 },
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username: parsed.data.username },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Sai tài khoản hoặc mật khẩu" },
        { status: 401 },
      );
    }

    const matched = await bcrypt.compare(parsed.data.password, admin.passwordHash);

    if (!matched) {
      return NextResponse.json(
        { message: "Sai tài khoản hoặc mật khẩu" },
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
    console.error("Admin login failed:", error);
    return NextResponse.json(
      { message: "Không thể đăng nhập lúc này" },
      { status: 500 },
    );
  }
}
