import type { MouseEventHandler, ReactElement, ReactNode } from "react";
import { cx, focusRing } from "./cx.js";
import { Icon } from "./Icon.js";
import { IMAGE_WIDTH, Image, type ImageAspect, type ImageWidth } from "./Image.js";
import { CLOSE } from "./Lightbox.js";
import { renderLink } from "./link.js";
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
   * The shape of the thumbnail, as `Image`'s `aspect`; `natural` keeps the picture's own
   * proportions (a chat image) and crops nothing.
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
   * Adds a round remove button on the picture's top-right corner, named `removeLabel` and `alt`: a
   * photo attached to a form, until it is sent. It is its own button, beside the tile's, so a tile
   * with `onClick` still opens its `Lightbox`.
   */
  onRemove?: (() => void) | undefined;
  /**
   * The remove button's word, before `alt` in its name and alone as its tooltip.
   * @default Remove
   */
  removeLabel?: string | undefined;
} & Passthrough &
  (
    | { onClick?: undefined; href?: undefined; external?: undefined }
    | {
        /**
         * Makes the whole tile one button; open a `Lightbox` from it. Without it (or `href`) the
         * tile is a plain, non-interactive block.
         */
        onClick: MouseEventHandler<HTMLButtonElement>;
        href?: undefined;
        external?: undefined;
      }
    | {
        onClick?: undefined;
        /** Makes the whole tile one link, named as the button form is; an in-app path goes through `LinkProvider`. */
        href: string;
        /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
        external?: boolean | undefined;
      }
  );

/**
 * A thumbnail tile: a picture in a fixed shape with an optional label on its bottom edge and a
 * caption under it. With `onClick` the whole tile is one button, which is how a grid or a
 * `ScrollStrip` of media opens each item in a `Lightbox`. The label sits on the same near-black
 * media scrim as the Lightbox, in every theme. The thumbnail is cropped to fill its shape, or with
 * `aspect="natural"` shown whole. With `href` the whole tile is one link instead. `onRemove` adds a
 * remove button for a tile that can be taken back out.
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
  href,
  external = false,
  onRemove,
  removeLabel,
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
  // With a remove button the tile fills a wrapper that carries the width and the button's anchor.
  const box = cx("block min-w-0 text-left", onRemove ? "w-full" : IMAGE_WIDTH[width]);
  const tile = tileOf({ rest, onClick, href, external, className: box, body });
  if (!onRemove) return tile;
  return (
    <div className={cx("relative min-w-0", IMAGE_WIDTH[width])}>
      {tile}
      <RemoveButton label={removeLabel} alt={alt} onRemove={onRemove} />
    </div>
  );
}

/** The round remove button on a tile's corner, named by its word and the picture's `alt`. */
function RemoveButton({
  label = "Remove",
  alt,
  onRemove,
}: {
  label: string | undefined;
  alt: string;
  onRemove: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={`${label} ${alt}`}
      title={label}
      onClick={onRemove}
      className="absolute top-1 right-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/90 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <Icon>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d={CLOSE} />
        </svg>
      </Icon>
    </button>
  );
}

/** The tile itself: one button, one link, or a plain block. */
function tileOf({
  rest,
  onClick,
  href,
  external,
  className,
  body,
}: {
  rest: Passthrough;
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  href: string | undefined;
  external: boolean;
  className: string;
  body: ReactNode;
}): ReactElement {
  const interactive = cx(className, "group rounded-lg", focusRing);
  if (href !== undefined) {
    return renderLink({ ...rest, href, external, className: interactive, children: body });
  }
  if (onClick) {
    return (
      <button {...rest} type="button" onClick={onClick} className={interactive}>
        {body}
      </button>
    );
  }
  return (
    <div {...rest} className={className}>
      {body}
    </div>
  );
}
