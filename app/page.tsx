import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  redirect(cookieStore.has(SESSION_COOKIE) ? "/admin/licenses" : "/login");
}
