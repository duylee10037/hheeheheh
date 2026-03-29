"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LicenseType = "PYTHON" | "CPP";

type LicenseItem = {
  id: string;
  key: string;
  type: LicenseType;
  note: string;
  machineCode: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

type Props = {
  licenses: LicenseItem[];
};

const TYPE_OPTIONS: Array<{
  value: LicenseType;
  label: string;
  description: string;
}> = [
  {
    value: "PYTHON",
    label: "Python tool",
    description: "Dung cho tool auto login goi /api/verify bang JSON.",
  },
  {
    value: "CPP",
    label: "C++ project",
    description: "Dung cho project native goi /connect voi user_key va serial.",
  },
];

function getTypeLabel(type: LicenseType) {
  return type === "CPP" ? "C++ project" : "Python tool";
}

export function LicenseDashboard({ licenses }: Props) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [type, setType] = useState<LicenseType>("PYTHON");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pythonLicenses = useMemo(
    () => licenses.filter((item) => item.type === "PYTHON"),
    [licenses],
  );
  const cppLicenses = useMemo(
    () => licenses.filter((item) => item.type === "CPP"),
    [licenses],
  );

  const stats = useMemo(() => {
    const pythonBound = pythonLicenses.filter((item) => Boolean(item.machineCode)).length;
    const cppBound = cppLicenses.filter((item) => Boolean(item.machineCode)).length;

    return {
      total: licenses.length,
      python: pythonLicenses.length,
      cpp: cppLicenses.length,
      pythonBound,
      cppBound,
    };
  }, [cppLicenses, licenses, pythonLicenses]);

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
        type,
        note,
        expiresAt,
        isActive,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Khong the tao key");
      setSubmitting(false);
      return;
    }

    setKey("");
    setType("PYTHON");
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
      <section className="grid gap-4 md:grid-cols-5">
        <StatCard label="Tong key" value={stats.total} />
        <StatCard label="Python key" value={stats.python} />
        <StatCard label="C++ key" value={stats.cpp} />
        <StatCard label="Python da bind" value={stats.pythonBound} />
        <StatCard label="C++ da bind" value={stats.cppBound} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tao key moi</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Chon dung loai key ngay tu dau de tach rieng flow Python va C++.
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
                Loai key
              </label>
              <div className="grid gap-3">
                {TYPE_OPTIONS.map((option) => (
                  <label
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm transition ${
                      type === option.value
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-white"
                    }`}
                    key={option.value}
                  >
                    <input
                      checked={type === option.value}
                      className="sr-only"
                      name="license-type"
                      onChange={() => setType(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <div className="font-medium text-slate-900">{option.label}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {option.description}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                License key
              </label>
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                value={key}
                onChange={(event) => setKey(event.target.value.toUpperCase())}
                placeholder={type === "CPP" ? "CPP-KEY-ABC-123" : "PY-KEY-ABC-123"}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ngay het han
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
                Ghi chu
              </label>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Khach A, goi 1 nam..."
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                type="checkbox"
              />
              Tao key o trang thai active
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
              {submitting ? "Dang tao..." : `Tao key ${getTypeLabel(type)}`}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <LicenseTable
            busyId={busyId}
            description="Cho tool auto login, verify qua /api/verify voi JSON."
            licenses={pythonLicenses}
            onAction={runAction}
            title="Nhom key Python"
          />
          <LicenseTable
            busyId={busyId}
            description="Cho project native, verify qua /connect voi game + user_key + serial."
            licenses={cppLicenses}
            onAction={runAction}
            title="Nhom key C++"
          />
        </div>
      </section>
    </div>
  );
}

function LicenseTable({
  busyId,
  description,
  licenses,
  onAction,
  title,
}: {
  busyId: string | null;
  description: string;
  licenses: LicenseItem[];
  onAction: (id: string, action: "toggle" | "delete" | "clear-binding") => void;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
      <div className="border-b border-[var(--border)] px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-medium">Key</th>
              <th className="px-6 py-4 font-medium">Trang thai</th>
              <th className="px-6 py-4 font-medium">Binding</th>
              <th className="px-6 py-4 font-medium">Het han</th>
              <th className="px-6 py-4 font-medium">Note</th>
              <th className="px-6 py-4 font-medium">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => {
              const disabled = busyId === license.id;

              return (
                <tr className="border-t border-[var(--border)] align-top" key={license.id}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{license.key}</div>
                    <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                      {getTypeLabel(license.type)}
                    </div>
                    <div className="mt-2 text-xs text-[var(--muted)]">
                      Tao luc {new Date(license.createdAt).toLocaleString()}
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
                      : "Khong gioi han"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{license.note || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        disabled={disabled}
                        onClick={() => onAction(license.id, "toggle")}
                        type="button"
                      >
                        Toggle
                      </button>
                      <button
                        className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        disabled={disabled || !license.machineCode}
                        onClick={() => onAction(license.id, "clear-binding")}
                        type="button"
                      >
                        Clear binding
                      </button>
                      <button
                        className="rounded-xl border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60"
                        disabled={disabled}
                        onClick={() => onAction(license.id, "delete")}
                        type="button"
                      >
                        Xoa
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
            Chua co key nao trong nhom nay.
          </div>
        ) : null}
      </div>
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
