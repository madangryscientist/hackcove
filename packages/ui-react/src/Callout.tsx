import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { Icon } from "./Icon.js";
import type { IconName } from "./icons.js";
import type { Passthrough } from "./props.js";
import type { Tone } from "./tone.js";
import { GapProvider } from "./stackGap.js";
import { useProse } from "./typography.js";

/** The soft fill and border of each tone; a toned `Card` uses the same. */
export const TONE_SURFACE: Record<Tone, string> = {
  neutral: "border-slate-200 bg-slate-50",
  info: "border-blue-200 bg-blue-50",
  positive: "border-emerald-200 bg-emerald-50",
  warn: "border-amber-200 bg-amber-50",
  danger: "border-red-200 bg-red-50",
};

const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-slate-700",
  info: "text-blue-800",
  positive: "text-emerald-800",
  warn: "text-amber-800",
  danger: "text-red-800",
};

/**
 * A tinted notice box, with an optional bold title above its body. Its text is text-sm (text-base/7
 * inside a `Prose`, boxed or `banner`). `actions` puts a button or link
 * at the end of the row; `banner` makes it a flat strip (bottom border only, no radius) for the
 * top of a `Card flush` and nowhere else: a padded card or a padded `FullBleedLayout` column
 * would inset it. `align="center"` centres the text. In a page's column the notice is a plain Callout, first in the column's `Stack`. With `actions` the box is `relative`, so a `TextLink
 * stretch` there makes the whole callout its click target, like a link in a table row. `icon`
 * sets one of the library's icons at the start of the box, in the tone's ink.
 */
export function Callout({
  tone = "neutral",
  icon,
  title,
  actions,
  banner = false,
  align = "start",
  children,
  ...rest
}: {
  /**
   * What the notice means; `neutral` is a plain note.
   * @default neutral
   */
  tone?: Tone;
  /** One of the library's icons, at the start of the box beside the text. */
  icon?: IconName | undefined;
  /** A bold line above the body. */
  title?: ReactNode;
  /** A flat strip: `border-b` only and no radius, for the top of a `Card flush` only. */
  banner?: boolean;
  /**
   * `center` centres the title and body, for a success or empty state that stands alone. With
   * `actions` only the text is centred.
   * @default start
   */
  align?: "start" | "center" | undefined;
  /** A button or link at the end of the row, beside the title and body. */
  actions?: ReactNode;
  children: ReactNode;
} & Passthrough): ReactElement {
  const size = useProse() ? "text-base/7" : "text-sm";
  const content = withIcon(
    icon,
    title ? (
      <>
        <p className="font-semibold">{title}</p>
        <div className="mt-1">{children}</div>
      </>
    ) : (
      children
    ),
  );
  return (
    <div
      className={cx(
        Boolean(actions) && "relative",
        banner ? "border-b px-5 py-3" : "rounded-xl border p-4",
        size,
        TONE_SURFACE[tone],
        TONE_TEXT[tone],
        align === "center" && "text-center",
      )}
      {...rest}
    >
      <GapProvider gap="xs">
        {actions ? (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">{content}</div>
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          </div>
        ) : (
          content
        )}
      </GapProvider>
    </div>
  );
}

/** The callout's text with its `icon` at the start, the icon centred on the first line. */
function withIcon(icon: IconName | undefined, text: ReactNode): ReactNode {
  if (icon === undefined) return text;
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-[1lh] items-center">
        <Icon name={icon} />
      </span>
      <div className="min-w-0 flex-1">{text}</div>
    </div>
  );
}
