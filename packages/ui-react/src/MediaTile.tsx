import type { ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { Icon } from "./Icon.js";
import { IMAGE_WIDTH, Image, type ImageAspect, type ImageWidth } from "./Image.js";
import type { Passthrough } from "./props.js";

const PLAY =
  "M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.34-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.84Z";

export type MediaTileProps = {
  /** The thumbnail, a local path or a data URL. Left out, or if it fails to load, a placeholder shows. */
  src?: string | undefined;
  /** What the thumbnail shows; it is the tile's name, with `label`. */
  alt: string;
  /** A short line on the bottom edge of the picture, on the media scrim: who posted it, or "Earlier". */
  label?: ReactNode;
  /** Muted text under the picture, e.g. when. */
  caption?: ReactNode;
  /**
   * The shape of the thumbnail, as `Image`'s `aspect`.
   * @default 3:4
   */
  aspect?: ImageAspect | undefined;
  /**
   * `sm` 96px, `md` 160px or `lg` 256px wide; `full` fills the parent (a tile in a grid).
   * @default md
   */
  width?: ImageWidth | undefined;
  /** Draws a play mark on the thumbnail: the tile opens a video, not a photo. Say so in `alt` too. */
  video?: boolean | undefined;
  /**
   * Makes the whole tile one button; open a `Lightbox` from it. Without it the tile is a plain,
   * non-interactive block.
   */
  onClick?: (() => void) | undefined;
} & Passthrough;

/**
 * A thumbnail tile: a picture in a fixed shape with an optional label on its bottom edge and a
 * caption under it. With `onClick` the whole tile is one button, which is how a grid or a
 * `ScrollStrip` of media opens each item in a `Lightbox`. The label sits on the same near-black
 * media scrim as the Lightbox, in every theme. The thumbnail is cropped to fill its shape.
 */
export function MediaTile({
  src,
  alt,
  label,
  caption,
  aspect = "3:4",
  width = "md",
  video = false,
  onClick,
  ...rest
}: MediaTileProps): ReactElement {
  const body = (
    <>
      <span className="relative block overflow-hidden rounded-lg">
        <Image src={src} alt={alt} aspect={aspect} />
        {video && (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span className="grid size-10 place-items-center rounded-full bg-black/90 text-white">
              <Icon size="lg">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d={PLAY} />
                </svg>
              </Icon>
            </span>
          </span>
        )}
        {label && (
          <span className="absolute inset-x-0 bottom-0 truncate bg-black/90 px-2 py-1 text-xs font-medium text-white">
            {label}
          </span>
        )}
      </span>
      {caption && <span className="mt-1 block truncate text-xs text-slate-600">{caption}</span>}
    </>
  );
  const box = cx("block min-w-0 text-left", IMAGE_WIDTH[width]);
  if (!onClick) {
    return (
      <div {...rest} className={box}>
        {body}
      </div>
    );
  }
  return (
    <button
      {...rest}
      type="button"
      onClick={onClick}
      className={cx(box, "group rounded-lg", focusRing)}
    >
      {body}
    </button>
  );
}
