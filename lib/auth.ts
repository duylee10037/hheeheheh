import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "admin_session";
const secret = new TextEncoder().encode(env.jwtSecret);

type SessionPayload = {
  adminId: string;
  username: string;
};

export async function createSessionToken(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionPayload;
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
