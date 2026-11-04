import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { TEXT_TONE, type TextTone } from "./typography.js";

const BOX: Record<Size, string> = { sm: "size-3.5", md: "size-4", lg: "size-5" };

/**
 * One inline icon: an `<svg>` child sized to a fixed box (sm 14px, md 16px, lg 20px) and drawn in
 * `currentColor`, so it takes the text colour around it unless a `tone` says otherwise. It is
 * decorative (`aria-hidden`) by default; a `label` makes it an image with that name, for an icon
 * that carries meaning no text beside it says.
 */
export function Icon({
  size = "md",
  tone = "inherit",
  label,
  children,
  ...rest
}: Passthrough & {
  /** The box: sm 14px, md 16px (the default), lg 20px. */
  size?: Size;
  /** A text tone, or `inherit` (the default) for the colour of the text around it. */
  tone?: TextTone | "inherit";
  /** Names the icon (`role="img"`). Without one the icon is hidden from assistive tech. */
  label?: string;
  /** The `<svg>`, drawn in `currentColor`; it fills the box. */
  children: ReactNode;
}): ReactElement {
  return (
    <span
      {...rest}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={cx(
        "inline-flex shrink-0 [&>svg]:size-full",
        BOX[size],
        tone !== "inherit" && TEXT_TONE[tone],
      )}
    >
      {children}
    </span>
  );
}
