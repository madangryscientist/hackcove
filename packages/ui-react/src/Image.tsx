import { type ReactElement, useState } from "react";
import { cx } from "./cx.js";
import { Icon } from "./Icon.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";

/** The shapes an image is cropped or letterboxed to. */
export type ImageAspect = "square" | "4:3" | "3:2" | "16:9" | "3:4" | "9:16";

/** How wide an image is: `full` fills its parent; the others cap it at 96, 160 or 256px. */
export type ImageWidth = Size | "full";

const ASPECT: Record<ImageAspect, string> = {
  square: "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-video",
  "3:4": "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
};

/** `full` is the parent's width; a size is a cap on it, so a narrow parent still wins. */
export const IMAGE_WIDTH: Record<ImageWidth, string> = {
  sm: "w-full max-w-24",
  md: "w-full max-w-40",
  lg: "w-full max-w-64",
  full: "w-full",
};

/** Every image sits on the inset surface with a hairline, so a letterbox or a pale picture has an edge. */
const FRAME = "block rounded-lg border border-slate-200 bg-slate-100";

const PICTURE =
  "M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.22a.75.75 0 0 0-1.06 0l-1.91 1.91.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.09a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z";

export type ImageProps = {
  /**
   * The picture, a local path or a data URL. It is never loaded for you: this is the app's own
   * image. Left out, or if it fails to load, the picture is replaced by a placeholder.
   */
  src?: string | undefined;
  /** What the picture shows. An empty string marks it as decoration, hidden from a screen reader. */
  alt: string;
  /**
   * The shape it is cropped to: `square`, `4:3`, `3:2`, `16:9`, or the portrait `3:4` and `9:16`.
   * @default 4:3
   */
  aspect?: ImageAspect | undefined;
  /**
   * `cover` fills the shape and crops what overflows; `contain` shows the whole picture, with the
   * rest of the shape left empty (a QR code, a logo).
   * @default cover
   */
  fit?: "cover" | "contain" | undefined;
  /**
   * `sm` 96px, `md` 160px and `lg` 256px cap the width; `full` fills the parent.
   * @default full
   */
  width?: ImageWidth | undefined;
} & Passthrough;

/**
 * A picture in a fixed shape: `aspect` reserves the space before it loads, so the page does not
 * jump, and `fit` crops it to the shape or shows all of it. The corners are rounded and the frame
 * has a hairline. If the picture is missing or fails to load, a same-sized placeholder with a
 * picture mark stands in, still named by `alt`. A user's photo is an `Avatar`; a clickable
 * thumbnail with a label is a `MediaTile`.
 */
export function Image({
  src,
  alt,
  aspect = "4:3",
  fit = "cover",
  width = "full",
  ...rest
}: ImageProps): ReactElement {
  // The `src` that failed to load: a new `src` gets its own try, so a broken one never sticks.
  const [failedSrc, setFailedSrc] = useState<string>();
  const box = cx(FRAME, ASPECT[aspect], IMAGE_WIDTH[width]);
  if (src && src !== failedSrc) {
    return (
      <img
        {...rest}
        src={src}
        alt={alt}
        className={cx(box, fit === "cover" ? "object-cover" : "object-contain")}
        onError={() => setFailedSrc(src)}
      />
    );
  }
  return (
    <div
      {...rest}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
      className={cx(box, "grid place-items-center text-slate-400")}
    >
      <Icon size="lg">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d={PICTURE} />
        </svg>
      </Icon>
    </div>
  );
}
