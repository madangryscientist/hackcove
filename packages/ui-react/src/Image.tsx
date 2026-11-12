import type { ReactElement } from "react";
import { cx } from "./cx.js";
import { Icon } from "./Icon.js";
import type { Passthrough } from "./props.js";
import type { Size } from "./size.js";
import { useImageFailed } from "./useImageFailed.js";

/**
 * The shapes an image is cropped or letterboxed to, or `natural`: no shape of its own, so the
 * picture keeps its own proportions.
 */
export type ImageAspect = "square" | "4:3" | "3:2" | "16:9" | "3:4" | "9:16" | "natural";

/** How wide an image is: `full` fills its parent; the others are 96, 160 or 256px, capped at the parent's width. */
export type ImageWidth = Size | "full";

const ASPECT: Record<ImageAspect, string> = {
  square: "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-video",
  "3:4": "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
  natural: "h-auto",
};

/** What stands in for a `natural` picture that has none (yet): it has no proportions to keep. */
const PLACEHOLDER_ASPECT = "aspect-[4/3]";

/**
 * `full` is the parent's width; a size is a real width that a narrower parent still caps. It is
 * a width and not a `max-width`, so it holds inside a shrink-to-fit parent, where a placeholder
 * has no intrinsic size of its own to give it one.
 */
export const IMAGE_WIDTH: Record<ImageWidth, string> = {
  sm: "w-24 max-w-full",
  md: "w-40 max-w-full",
  lg: "w-64 max-w-full",
  full: "w-full",
};

/** Every image sits on the inset surface with a hairline, so a letterbox or a pale picture has an edge. */
const FRAME = "block rounded-lg border border-slate-200";
const INSET = "bg-slate-100";

/**
 * The white mat of `framed`. `bg-white/100` is the palette's media-matte role: a plain `bg-white` is
 * the surface, which a dark theme darkens, and a scanner needs the code on white. Every theme keeps
 * this one white, as it keeps the Lightbox scrim black.
 */
const MATTE = "bg-white/100 p-3";

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
   * `natural` keeps the picture's own proportions instead, so nothing is cropped or letterboxed;
   * the space is not reserved before it loads.
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
   * `sm` 96px, `md` 160px and `lg` 256px set the width, capped at the parent's; `full` fills the parent.
   * @default full
   */
  width?: ImageWidth | undefined;
  /**
   * Sets the picture on a white mat with padding, always white, in every theme: a QR code is
   * scanned off a dark page. It shows the whole picture, as `fit="contain"`, whatever `fit` says.
   */
  framed?: boolean | undefined;
} & Passthrough;

/** The fill and the fit of a picture: `framed` is a white mat around all of it. */
function pictureLook(fit: "cover" | "contain", framed: boolean): string {
  if (framed) return cx(MATTE, "object-contain");
  return cx(INSET, fit === "cover" ? "object-cover" : "object-contain");
}

/**
 * A picture in a fixed shape: `aspect` reserves the space before it loads, so the page does not
 * jump, and `fit` crops it to the shape or shows all of it. The corners are rounded and the frame
 * has a hairline. If the picture is missing or fails to load, a same-sized placeholder with a
 * picture mark stands in, still named by `alt`. `framed` mats a code or a logo in white. A user's photo is an `Avatar`; a clickable
 * thumbnail with a label is a `MediaTile`.
 */
export function Image({
  src,
  alt,
  aspect = "4:3",
  fit = "cover",
  width = "full",
  framed = false,
  ...rest
}: ImageProps): ReactElement {
  const { ref, failed, markFailed } = useImageFailed(src);
  const box = cx(FRAME, IMAGE_WIDTH[width]);
  if (src && !failed) {
    return (
      <img
        {...rest}
        ref={ref}
        src={src}
        alt={alt}
        className={cx(box, ASPECT[aspect], pictureLook(fit, framed))}
        onError={markFailed}
      />
    );
  }
  return (
    <span
      {...rest}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
      className={cx(
        box,
        aspect === "natural" ? PLACEHOLDER_ASPECT : ASPECT[aspect],
        INSET,
        "grid place-items-center text-slate-400",
      )}
    >
      <Icon size="lg">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d={PICTURE} />
        </svg>
      </Icon>
    </span>
  );
}
