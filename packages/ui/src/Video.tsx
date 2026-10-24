import type { ReactElement, VideoHTMLAttributes } from "react";
import { cx } from "./cx.js";

/**
 * A `<video>` with controls, full width and rounded; it loads metadata only, so the page does not
 * pull the file until it is played. `src` is the app's own video; `captions` is a WebVTT file,
 * offered as the default track. `children` is the fallback for a browser that cannot play it.
 */
export function Video({
  src,
  captions,
  className,
  children,
  ...rest
}: {
  src: string;
  captions?: string | undefined;
} & Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "controls">): ReactElement {
  return (
    <video
      controls
      preload="metadata"
      src={src}
      className={cx("w-full rounded-lg", className)}
      {...rest}
    >
      {captions && <track kind="captions" src={captions} default />}
      {children}
    </video>
  );
}
