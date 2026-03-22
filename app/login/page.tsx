import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const cookieStore = await cookies();

  if (cookieStore.has(SESSION_COOKIE)) {
    redirect("/admin/licenses");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-8">
          <p className="mb-2 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            Admin
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            License key manager
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Đăng nhập để tạo key, quản lý binding và kiểm tra trạng thái license.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
