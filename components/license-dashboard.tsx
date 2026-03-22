"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LicenseItem = {
  id: string;
  key: string;
  note: string;
  machineCode: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

type Props = {
  licenses: LicenseItem[];
};

export function LicenseDashboard({ licenses }: Props) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: licenses.length,
      active: licenses.filter((item) => item.isActive).length,
      bound: licenses.filter((item) => Boolean(item.machineCode)).length,
    };
  }, [licenses]);

  async function reload() {
    router.refresh();
  }

  async function createLicense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        note,
        expiresAt,
        isActive,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Không thể tạo key");
      setSubmitting(false);
      return;
    }

    setKey("");
    setNote("");
    setExpiresAt("");
    setIsActive(true);
    setSubmitting(false);
    await reload();
  }

  async function runAction(
    id: string,
    action: "toggle" | "delete" | "clear-binding",
  ) {
    setBusyId(id);

    const endpoint =
      action === "delete"
        ? `/api/admin/licenses/${id}`
        : `/api/admin/licenses/${id}/${action}`;

    await fetch(endpoint, {
      method: action === "delete" ? "DELETE" : "POST",
    }).catch(() => null);

    setBusyId(null);
    await reload();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Tổng key" value={stats.total} />
        <StatCard label="Đang active" value={stats.active} />
        <StatCard label="Đã bind máy" value={stats.bound} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tạo key</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Key mới sẽ bind tự động ở lần verify đầu tiên.
              </p>
            </div>
            <button
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={logout}
              type="button"
            >
              Logout
            </button>
          </div>

          <form className="space-y-4" onSubmit={createLicense}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                License key
              </label>
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                value={key}
                onChange={(event) => setKey(event.target.value.toUpperCase())}
                placeholder="KEY-ABC-123"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ngày hết hạn
              </label>
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ghi chú
              </label>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Khách A, gói 1 năm..."
              />
            </div>
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                type="checkbox"
              />
              Tạo key ở trạng thái active
            </label>
            {error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <button
              className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Đang tạo..." : "Tạo license"}
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Danh sách key</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Xem trạng thái active, machine binding và thao tác trực tiếp.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Key</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Binding</th>
                  <th className="px-6 py-4 font-medium">Hết hạn</th>
                  <th className="px-6 py-4 font-medium">Note</th>
                  <th className="px-6 py-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((license) => {
                  const disabled = busyId === license.id;

                  return (
                    <tr className="border-t border-[var(--border)] align-top" key={license.id}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{license.key}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          Tạo lúc {new Date(license.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            license.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {license.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {license.machineCode ? (
                          <div>
                            <div className="font-medium text-slate-900">Bound</div>
                            <code className="mt-1 block break-all text-xs text-[var(--muted)]">
                              {license.machineCode}
                            </code>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            Unbound
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {license.expiresAt
                          ? new Date(license.expiresAt).toLocaleString()
                          : "Không giới hạn"}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {license.note || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            disabled={disabled}
                            onClick={() => runAction(license.id, "toggle")}
                            type="button"
                          >
                            Toggle
                          </button>
                          <button
                            className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            disabled={disabled || !license.machineCode}
                            onClick={() => runAction(license.id, "clear-binding")}
                            type="button"
                          >
                            Clear binding
                          </button>
                          <button
                            className="rounded-xl border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                            disabled={disabled}
                            onClick={() => runAction(license.id, "delete")}
                            type="button"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {licenses.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[var(--muted)]">
                Chưa có license nào. Tạo key đầu tiên ở khung bên trái.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="text-sm text-[var(--muted)]">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
