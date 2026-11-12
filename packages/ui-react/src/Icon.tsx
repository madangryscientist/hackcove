import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { type IconName, iconGlyph } from "./icons.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { TEXT_TONE, type TextTone } from "./typography.js";

const BOX: Record<Size | "feature", string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  feature: "size-8",
};

type IconProps = Passthrough & {
  /** The box: sm 14px, md 16px (the default), lg 20px, `feature` 32px for an icon that stands for an idea on its own (a feature card). */
  size?: Size | "feature";
  /** A text tone, or `inherit` (the default) for the colour of the text around it. */
  tone?: TextTone | "inherit";
  /** Names the icon (`role="img"`). Without one the icon is hidden from assistive tech. */
  label?: string;
};

/**
 * One inline icon, sized to a fixed box (sm 14px, md 16px, lg 20px, `feature` 32px) and drawn in
 * `currentColor`, so it takes the text colour around it unless a `tone` says otherwise. `name`
 * picks one of the library's own icons, all drawn on one grid with one stroke: feature ideas
 * (`diff`, `baseline`, `review`, `ci`, `self-host`, `privacy`, `capture`, `branch`, `theme`,
 * `speed`, `search`) and UI glyphs (`chevron-right`, `chevron-down`, `close`, `external-link`,
 * `settings`, `bell`, `check`, `plus`) and the ideas the docs sections stand for (`grid`, `window`,
 * `type`, `card`, `pointer`, `field`, `table`, `compass`, `page`, `briefcase`);
 * without a name, a bare `<svg>` child fills the box. It is decorative (`aria-hidden`) by
 * default; a `label` makes it an image with that name, for an icon that carries meaning no text
 * beside it says.
 */
export function Icon({
  size = "md",
  tone = "inherit",
  label,
  name,
  children,
  ...rest
}: IconProps &
  (
    | {
        /** One of the library's icons, named for the idea it stands for. */
        name: IconName;
        children?: undefined;
      }
    | {
        name?: undefined;
        /** The `<svg>`, drawn in `currentColor`; it fills the box. */
        children: ReactNode;
      }
  )): ReactElement {
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
      {name === undefined ? children : iconGlyph(name)}
    </span>
  );
}
