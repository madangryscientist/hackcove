import type { HTMLAttributes, ImgHTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import { IMAGE_WIDTH, type ImageAspect, type ImageWidth } from "./Image.js";
import type { Unstyled } from "./props.js";

/** A box in a picture's own units (an image's pixels): its top-left corner and its size. */
export type RegionRect = { x: number; y: number; width: number; height: number };

/** Thin accent stripes, drawn in the box's own colour, for an area that is left out. */
const HATCH =
  "absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,currentColor_0_1px,transparent_1px_6px)]";

/**
 * An accent outline over one area of a picture, such as a screenshot's ignored or flagged region.
 * `rect` is in the picture's own units and `within` is the picture's full size in the same units;
 * the box is placed in percent of them, so it sits right at any scale. Put it in a `RegionFrame`,
 * over the picture. `label` is a small tag in its top-left
 * corner; `hatched` stripes the inside, for an area that is left out. It takes no pointer events,
 * so it never blocks the picture or a layer drawn over it.
 */
export function OutlineRegion({
  rect,
  within,
  label,
  hatched = false,
  ...rest
}: {
  /** The area, in the picture's own units. */
  rect: RegionRect;
  /** The picture's full size, in the same units as `rect`. */
  within: { width: number; height: number };
  /** A short tag in the top-left corner: where the area came from, or what it is. */
  label?: ReactNode;
  /** Stripes the inside, for an area left out (ignored, masked). */
  hatched?: boolean | undefined;
} & Unstyled<Omit<HTMLAttributes<HTMLDivElement>, "children">>): ReactElement {
  return (
    <div
      {...rest}
      className="pointer-events-none absolute border-2 border-violet-600 text-violet-600"
      style={{
        left: `${(rect.x / within.width) * 100}%`,
        top: `${(rect.y / within.height) * 100}%`,
        width: `${(rect.width / within.width) * 100}%`,
        height: `${(rect.height / within.height) * 100}%`,
      }}
    >
      {hatched && <span aria-hidden="true" className={HATCH} />}
      {label != null && (
        <span className="absolute top-0 left-0 bg-violet-600 px-1 text-xs leading-tight text-violet-50">
          {label}
        </span>
      )}
    </div>
  );
}

/** The shapes `RegionFrame` letterboxes a picture into, as `Image`'s `aspect`, or `natural` (its own). */
const FRAME_ASPECT: Record<ImageAspect, string> = {
  square: "aspect-square",
  "4:3": "aspect-[4/3]",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-video",
  "3:4": "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
  natural: "",
};

/**
 * A picture with a hairline edge, and `children` laid over it: the `OutlineRegion`s that mark its
 * areas. Every other prop goes to the `<img>` (`onLoad`, `loading`, `data-*`), so the app can read
 * the picture's own size for `within`.
 *
 * It sizes as `Image` does. `width` is `full` (the parent's width) or 96, 160 or 256px. `aspect`
 * `natural` keeps the picture's own proportions; any other shape letterboxes it (contain, never a
 * crop) on the inset surface, centred and never scaled up, and the regions are laid over the
 * picture itself, not the box, so each stays on its spot. A letterboxed picture needs its own size:
 * a screenshot has one; an SVG needs `width` and `height` on its root, not only a `viewBox`.
 */
export function RegionFrame({
  src,
  alt,
  aspect = "natural",
  width = "full",
  children,
  ...rest
}: {
  /** The picture. */
  src: string;
  /** What the picture shows; `""` for one that only decorates. */
  alt: string;
  /**
   * The box's shape: `natural` is the picture's own; any other letterboxes the picture inside it.
   * @default natural
   */
  aspect?: ImageAspect | undefined;
  /**
   * How wide the frame is: `full` fills its parent; `sm`, `md` and `lg` are 96, 160 and 256px, capped at the parent's width.
   * @default full
   */
  width?: ImageWidth | undefined;
  /** The `OutlineRegion`s over the picture. */
  children?: ReactNode;
} & Unstyled<
  Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "children" | "width" | "height">
>): ReactElement {
  if (aspect === "natural") {
    return (
      <div className={cx("relative border border-slate-200", IMAGE_WIDTH[width])}>
        <img {...rest} src={src} alt={alt} className="block w-full" />
        {children}
      </div>
    );
  }
  // The box is a size container, so the picture is capped by its width and height in `cq` units
  // (a percentage height would not resolve), and the inner box shrinks to the picture: the
  // regions are placed in percent of the picture, wherever the letterbox puts it.
  return (
    <div
      className={cx(
        "grid place-items-center overflow-hidden border border-slate-200 bg-slate-100 [container-type:size]",
        FRAME_ASPECT[aspect],
        IMAGE_WIDTH[width],
      )}
    >
      <div className="relative">
        <img {...rest} src={src} alt={alt} className="block max-h-[100cqh] max-w-[100cqw]" />
        {children}
      </div>
    </div>
  );
}
