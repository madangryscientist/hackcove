import type { ReactElement, VideoHTMLAttributes } from "react";
import type { Unstyled } from "./props.js";

/**
 * A `<video>` with controls, full width and rounded; it loads metadata only, so the page does not
 * pull the file until it is played. `src` is the app's own video; `captions` is a WebVTT file,
 * offered as the default track. `children` is the fallback for a browser that cannot play it.
 */
export function Video({
  src,
  captions,
  children,
  ...rest
}: {
  /** The video file, the app's own. */
  src: string;
  /** A WebVTT file, offered as the default captions track. */
  captions?: string | undefined;
} & Unstyled<Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "controls">>): ReactElement {
  return (
    <video controls preload="metadata" src={src} {...rest} className="w-full rounded-lg">
      {captions && <track kind="captions" src={captions} default />}
      {children}
    </video>
  );
}
