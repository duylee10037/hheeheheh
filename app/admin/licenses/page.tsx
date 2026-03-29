import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { formatLicense } from "@/lib/licenses";
import { LicenseDashboard } from "@/components/license-dashboard";

export default async function AdminLicensesPage() {
  await requireAdminSession();

  const licenses = await prisma.license.findMany({
    orderBy: [{ type: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              License Admin
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Quan ly license key
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              Tach rieng key cho Python tool va C++ project, giu dung flow verify
              theo cach moi client gui du lieu len server.
            </p>
          </div>
        </div>

        <LicenseDashboard licenses={licenses.map(formatLicense)} />
      </div>
    </main>
  );
}
