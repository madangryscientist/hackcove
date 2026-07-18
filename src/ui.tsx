import type { ReactNode } from "react";

// Small presentational primitives, using the same slate-based class vocabulary as the budget repo
// (auto-remapped to Catppuccin Mocha in dark mode by styles.css).

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Card({ title, count, children }: { title?: string; count?: number; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">
      {title && (
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
          {count !== undefined && <span className="text-xs font-medium text-slate-400">{count}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

/** A coloured epic header row: a dot in the epic's colour + its label. */
export function EpicHeader({ color, label }: { color: string; label: string }) {
  return (
    <div className="mb-1.5 mt-3 flex items-center gap-2 first:mt-0">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}

export function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "amber" | "emerald" | "blue" | "red" }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-900",
  };
  return <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}

/** Group items by their epic ref, ordered with real epics first (by ref) and "No epic" last. */
export function groupByEpic<T>(items: T[], epicOf: (t: T) => string | null): [string | null, T[]][] {
  const m = new Map<string | null, T[]>();
  for (const it of items) {
    const k = epicOf(it) ?? null;
    (m.get(k) ?? m.set(k, []).get(k)!).push(it);
  }
  return [...m.keys()]
    .sort((a, b) => (a === null ? 1 : b === null ? -1 : a < b ? -1 : 1))
    .map((k) => [k, m.get(k)!] as [string | null, T[]]);
}
