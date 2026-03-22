import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { formatLicense } from "@/lib/licenses";
import { LicenseDashboard } from "@/components/license-dashboard";

export default async function AdminLicensesPage() {
  await requireAdminSession();

  const licenses = await prisma.license.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              License Admin
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Quản lý license key
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Tạo key mới, bật tắt key, xóa key và clear machine binding khi cần.
            </p>
          </div>
        </div>

        <LicenseDashboard licenses={licenses.map(formatLicense)} />
      </div>
    </main>
  );
}
