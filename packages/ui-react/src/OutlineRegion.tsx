import type { HTMLAttributes, ImgHTMLAttributes, ReactElement, ReactNode } from "react";
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

/**
 * A picture drawn full width with a hairline edge, and `children` laid over it: the
 * `OutlineRegion`s that mark its areas. Every other prop goes to the `<img>` (`onLoad`, `loading`,
 * `data-*`), so the app can read the picture's own size for `within`.
 */
export function RegionFrame({
  src,
  alt,
  children,
  ...rest
}: {
  /** The picture. */
  src: string;
  /** What the picture shows; `""` for one that only decorates. */
  alt: string;
  /** The `OutlineRegion`s over the picture. */
  children?: ReactNode;
} & Unstyled<Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "children">>): ReactElement {
  return (
    <div className="relative border border-slate-200">
      <img {...rest} src={src} alt={alt} className="block w-full" />
      {children}
    </div>
  );
}
