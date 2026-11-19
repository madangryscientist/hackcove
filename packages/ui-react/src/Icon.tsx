import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { type IconName, iconGlyph } from "./icons.js";
import type { Passthrough } from "./props.js";
import { type ResponsiveSize, type Size, sizeClass } from "./size.js";
import { type TextTone, textToneClass } from "./typography.js";

const BOX: Record<Size | "feature", string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  feature: "size-8",
};
/** `BOX` from the `md` breakpoint up, for a responsive size (`sm`, `md` and `lg` only). */
const BOX_MD: Record<Size, string> = { sm: "md:size-3.5", md: "md:size-4", lg: "md:size-5" };
/** The box table and its `md:` twin, for the data test. */
export const iconSizeTables = { box: BOX, boxMd: BOX_MD };

type IconProps = Passthrough & {
  /** The box: sm 14px, md 16px (the default), lg 20px, `feature` 32px for an icon that stands for an idea on its own (a feature card). `{ base, md }` (sm, md, lg) changes at the `md` breakpoint (48rem), as the icon in a Button of that size does. */
  size?: Size | "feature" | ResponsiveSize;
  /** A text tone. Left out, the icon takes the colour of the text around it. */
  tone?: TextTone | undefined;
  /** Names the icon (`role="img"`). Without one the icon is hidden from assistive tech. */
  label?: string;
};

/**
 * One inline icon, sized to a fixed box (sm 14px, md 16px, lg 20px, `feature` 32px) and drawn in
 * `currentColor`, so it takes the text colour around it unless a `tone` says otherwise. `name`
 * picks one of the library's own icons, all drawn on one grid with one stroke: feature ideas
 * (`diff`, `baseline`, `review`, `ci`, `self-host`, `privacy`, `capture`, `branch`, `theme`,
 * `speed`, `search`) and UI glyphs (`chevron-right`, `chevron-down`, `close`, `external-link`,
 * `settings`, `bell`, `check`, `plus`, `more`) and the ideas the docs sections stand for (`grid`, `window`,
 * `type`, `card`, `pointer`, `field`, `table`, `compass`, `page`, `briefcase`);
 * without a name, a bare `<svg>` child fills the box. It is decorative (`aria-hidden`) by
 * default; a `label` makes it an image with that name, for an icon that carries meaning no text
 * beside it says.
 */
export function Icon({
  size = "md",
  tone,
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
        sizeClass(BOX, BOX_MD, size),
        textToneClass(tone),
      )}
    >
      {name === undefined ? children : iconGlyph(name)}
    </span>
  );
}
