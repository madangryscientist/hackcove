import type { AnimationEvent, ReactElement, ReactNode } from "react";
import { TONE_SURFACE, TONE_TEXT } from "./Callout.js";
import { cx } from "./cx.js";
import { IconButton } from "./IconButton.js";
import type { Passthrough } from "./props.js";
import type { Tone } from "./tone.js";

/** One notice in a `ToastRegion`. The caller holds the list; the region draws it. */
export type Toast = {
  /** The React key, and what `onDismiss` hands back. */
  id: string;
  /** The bold line: the whole message for a short one ("Saved"). */
  title: string;
  /** A line of detail under the title. */
  body?: ReactNode;
  /**
   * What the notice means, with `Callout`'s surfaces. A `warn` or `danger` toast never hides itself.
   * @default neutral
   */
  tone?: Tone | undefined;
  /** One `Button size="sm"`, as on a `Callout`. A toast with `actions` never hides itself. */
  actions?: ReactNode;
};

// The hide is CSS, not a timer. A toast that may leave on its own carries `data-toast-hide`: it is
// shown for five seconds, then fades for 200ms, and the animation's end calls `onDismiss`, so the
// caller drops it from the list, as `CopyButton` clears its copied state. Hovering the region or
// focusing anything in it pauses the run. Under reduced motion the same run holds a discrete
// `visibility` keyframe instead of the fade, so the toast still leaves at the same moment.
const css = `[data-toast-hide]{animation:hc-toast-hide .2s ease-in 5s forwards}[data-hc-toasts]:hover [data-toast-hide],[data-hc-toasts]:focus-within [data-toast-hide]{animation-play-state:paused}@keyframes hc-toast-hide{to{opacity:0}}@media (prefers-reduced-motion:reduce){[data-toast-hide]{animation-name:hc-toast-cut}}@keyframes hc-toast-cut{from,to{visibility:visible}}`;

/** Only a plain confirmation leaves on its own: no action to reach, nothing that must be read. */
function hides(toast: Toast): boolean {
  const tone = toast.tone ?? "neutral";
  return toast.actions == null && (tone === "neutral" || tone === "info" || tone === "positive");
}

function ToastItem({
  toast,
  dismissLabel,
  onDismiss,
}: {
  toast: Toast;
  dismissLabel: string;
  onDismiss: (id: string) => void;
}): ReactElement {
  const tone = toast.tone ?? "neutral";
  const hide = hides(toast);
  return (
    <div
      data-toast=""
      data-toast-hide={hide ? "" : undefined}
      onAnimationEnd={(event: AnimationEvent<HTMLDivElement>) => {
        // A child's animation (a busy Button's spinner) bubbles here too: only the toast's own
        // animation, which is the hide, counts.
        if (hide && event.target === event.currentTarget) onDismiss(toast.id);
      }}
      className={cx(
        "pointer-events-auto flex items-start gap-3 rounded-xl border p-3 pl-4 text-sm shadow-lg",
        TONE_SURFACE[tone],
        TONE_TEXT[tone],
      )}
    >
      <div className="min-w-0 flex-1 py-0.5">
        <p className="font-semibold">{toast.title}</p>
        {toast.body != null && <div className="mt-1">{toast.body}</div>}
      </div>
      {toast.actions != null && (
        <div className="flex shrink-0 items-center gap-2">{toast.actions}</div>
      )}
      <IconButton
        size="sm"
        variant="ghost"
        icon="close"
        label={dismissLabel}
        onClick={() => onDismiss(toast.id)}
      />
    </div>
  );
}

/**
 * The page's toasts: short notices fixed to the bottom of the viewport, from a list the app holds.
 * Mount it once, at the root beside `AppShell`; add a toast to `toasts` to show it, and drop it in
 * `onDismiss` to remove it. A `neutral`, `info` or `positive` toast with no `actions` leaves on its
 * own after five seconds (paused while the pointer is over it or focus is in it); a `warn` or
 * `danger` toast, or one with `actions`, stays until dismissed. The region is a named landmark with
 * a polite `role="status"`, kept in the page while empty, so each new toast is read once. A toast
 * raised while a `Dialog` or `Drawer` is open sits under it until it closes.
 */
export function ToastRegion({
  toasts,
  onDismiss,
  label = "Notifications",
  dismissLabel = "Dismiss",
  ...rest
}: {
  /** What is shown, oldest first. `[]` shows nothing and keeps the live region in the page. */
  toasts: readonly Toast[];
  /** Called by a toast's close button and when a self-hiding toast's time is up: drop it from `toasts`. */
  onDismiss: (id: string) => void;
  /**
   * The region's accessible name.
   * @default Notifications
   */
  label?: string | undefined;
  /**
   * The close button's name.
   * @default Dismiss
   */
  dismissLabel?: string | undefined;
} & Passthrough): ReactElement {
  return (
    <section
      aria-label={label}
      {...rest}
      data-hc-toasts=""
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <style>{css}</style>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            dismissLabel={dismissLabel}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </section>
  );
}
