import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Whether the picture at `src` has failed to load, for `Avatar` and `Image`, which swap a failed
 * picture for a fallback. A new `src` gets its own try, so a broken one never sticks.
 *
 * A failure is caught two ways. `markFailed` is the img's `onError`, for a picture that fails
 * after React has attached. On a server-rendered page the browser can fail the picture before
 * hydration, when the `error` event is already gone, so once the img mounts it is checked as well:
 * finished (`complete`) with no width (`naturalWidth` 0) means it failed. A picture still loading
 * or already loaded is left alone.
 */
export function useImageFailed(src: string | undefined): {
  /** Pass to the <img>. */
  ref: RefObject<HTMLImageElement | null>;
  /** True when there is no `src`, or this `src` has failed. */
  failed: boolean;
  /** Pass to the <img>'s `onError`. */
  markFailed: () => void;
} {
  const [failedSrc, setFailedSrc] = useState<string>();
  const ref = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = ref.current;
    if (src && img?.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);
  return { ref, failed: !src || src === failedSrc, markFailed: () => setFailedSrc(src) };
}
