import type { Size } from "./size.js";
import { cx, liftInteractive } from "./cx.js";
import { TEXT_TONE, type TextTone } from "./typography.js";

// How a `TableRow` looks: its status tone, its stripe and the selected fill. Only `RowTone` is
// exported from the package.

/** The selected row's fill, the one `ListRow` uses. */
export const SELECTED = "bg-violet-50 hover:bg-violet-50";

/**
 * The status of a row: the Callout's tones, plus `muted`. A toned row gets a stripe on its leading
 * edge and the tone's soft fill; `muted` fades the row instead, for one that matters less. The
 * stripe takes the tone's text colour, which every theme already remaps, so no new palette entry.
 */
export type RowTone = "neutral" | "info" | "positive" | "warn" | "danger" | "muted";

const ROW_TONE: Record<RowTone, string> = {
  neutral: "bg-slate-50 text-slate-500",
  info: "bg-blue-50 text-blue-700",
  positive: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  muted: "opacity-60",
};
const STRIPE = "shadow-[inset_4px_0_0_0_currentColor]";

/** The row's mark: a `tone` (stripe and fill, or faded), a `stripe` alone or `emphasis`, only one of them. */
export type RowMark =
  | {
      /** The row's status: a stripe on the leading edge plus the tone's soft fill, or `muted` to fade the row. Give only one of `tone`, `stripe` and `emphasis`. */
      tone?: RowTone | undefined;
      /** A stripe on the leading edge in this tone, with no fill. Give only one of `tone`, `stripe` and `emphasis`. */
      stripe?: undefined;
      /** A subtotal in the body: the look of a `TableFoot` row, with strong cells, a firmer line above and no hover. Give only one of `tone`, `stripe` and `emphasis`. */
      emphasis?: false | undefined;
    }
  | {
      /** A stripe on the leading edge in this tone, with no fill. Give only one of `tone`, `stripe` and `emphasis`. */
      stripe?: Exclude<TextTone, "neutral"> | undefined;
      /** The row's status: a stripe on the leading edge plus the tone's soft fill, or `muted` to fade the row. Give only one of `tone`, `stripe` and `emphasis`. */
      tone?: undefined;
      /** A subtotal in the body: the look of a `TableFoot` row, with strong cells, a firmer line above and no hover. Give only one of `tone`, `stripe` and `emphasis`. */
      emphasis?: false | undefined;
    }
  | {
      /** A subtotal in the body: the look of a `TableFoot` row, with strong cells, a firmer line above and no hover. Give only one of `tone`, `stripe` and `emphasis`. */
      emphasis: boolean;
      /** The row's status: a stripe on the leading edge plus the tone's soft fill, or `muted` to fade the row. Give only one of `tone`, `stripe` and `emphasis`. */
      tone?: undefined;
      /** A stripe on the leading edge in this tone, with no fill. Give only one of `tone`, `stripe` and `emphasis`. */
      stripe?: undefined;
    };

export const BODY_LINE = cx("relative border-t border-slate-200/70", liftInteractive);

/** The classes of a row: a line above in the body and the foot, the hover fill and the tone's or stripe's look in the body only. */
export function rowClass(
  section: "head" | "body" | "foot" | undefined,
  plain: boolean,
  tone: RowTone | undefined,
  stripe: Exclude<TextTone, "neutral"> | undefined,
): string {
  if (section === "foot") return cx("relative border-t border-slate-300", liftInteractive);
  if (section !== "body") return cx("relative", liftInteractive);
  const line = BODY_LINE;
  const hover = !plain && "hover:bg-slate-50";
  if (stripe !== undefined) return cx(line, hover, TEXT_TONE[stripe], STRIPE);
  if (tone === undefined) return cx(line, hover);
  if (tone === "muted") return cx(line, hover, ROW_TONE.muted);
  return cx(line, ROW_TONE[tone], STRIPE);
}

/** The padding of a head cell, a body or foot cell, and a group row, by the table's `size`. */
export const PAD: Record<Size, { head: string; cell: string; group: string }> = {
  sm: { head: "px-4 py-2.5", cell: "px-4 py-3", group: "px-4 py-2" },
  md: { head: "px-5 py-3", cell: "px-5 py-4", group: "px-5 py-2.5" },
  lg: { head: "px-6 py-3.5", cell: "px-6 py-5", group: "px-6 py-3" },
};
