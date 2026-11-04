import type { Passthrough } from "./props.js";

// Small presentational primitives written against Tailwind's slate-based class vocabulary,
// which a theme remaps.

/** A coloured epic header row: a dot in the epic's colour + its label. */
export function EpicHeader({
  color,
  label,
  ...rest
}: {
  /** The dot's colour, any CSS colour (the epic's own). */
  color: string;
  /** The epic's name. */
  label: string;
} & Passthrough) {
  return (
    <div {...rest} className="mb-1.5 mt-3 flex items-center gap-2 first:mt-0">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );
}

function compareEpics(a: string | null, b: string | null): number {
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

/** Group items by their epic ref, ordered with real epics first (by ref) and "No epic" last. */
export function groupByEpic<T>(
  items: T[],
  epicOf: (t: T) => string | null,
): [string | null, T[]][] {
  const groups = new Map<string | null, T[]>();
  for (const item of items) {
    const key = epicOf(item) ?? null;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return [...groups].toSorted(([a], [b]) => compareEpics(a, b));
}
