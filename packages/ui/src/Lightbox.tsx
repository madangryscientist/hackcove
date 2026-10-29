import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useRef,
} from "react";
import { Icon } from "./Icon.js";
import { useModal } from "./modal.js";
import type { Passthrough } from "./props.js";

/**
 * The full-screen viewer, painted with its own scrim: `bg-black/90` and the light text on it are the
 * palette's media-scrim role, which every theme keeps near-black, light themes included.
 */
const VIEWER =
  "fixed inset-0 m-0 size-full max-h-none max-w-none flex-col border-0 bg-black/90 p-0 text-white opacity-0 transition-[opacity,overlay,display] transition-discrete duration-200 open:flex open:opacity-100 starting:open:opacity-0 motion-reduce:transition-none";

/** A round control on the scrim, with a light focus ring: the accent is too dark on near-black in a light theme. */
const CONTROL =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const CLOSE =
  "M5.28 4.22a.75.75 0 0 0-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 1 0 1.06 1.06L10 11.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L11.06 10l4.72-4.72a.75.75 0 0 0-1.06-1.06L10 8.94 5.28 4.22Z";
const PREVIOUS =
  "M12.78 4.22a.75.75 0 0 1 0 1.06L8.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z";
const NEXT =
  "M7.22 4.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 0 1 0-1.06Z";

/** A round icon button on the scrim, named by `label`, which is also its tooltip. */
function ScrimButton({
  label,
  path,
  onClick,
}: {
  label: string;
  path: string;
  onClick: () => void;
}): ReactElement {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={CONTROL}>
      <Icon>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d={path} />
        </svg>
      </Icon>
    </button>
  );
}

export type LightboxProps = {
  /** The viewer's accessible name, e.g. "Photo from Anna". */
  label: string;
  /** The media: one `<img>` or `<video>`, scaled down to fit the screen. */
  children: ReactNode;
  /** A line on the scrim above the media, e.g. who posted it. */
  title?: ReactNode;
  /** A muted line under the title, e.g. when. */
  meta?: ReactNode;
  /** Muted text on the scrim under the media. */
  caption?: ReactNode;
  /** Called when the viewer closes: Esc, a click on the scrim or the close button. */
  onClose: () => void;
  /** Shows a previous button and binds ArrowLeft. Leave it out at the first item. */
  onPrevious?: (() => void) | undefined;
  /** Shows a next button and binds ArrowRight. Leave it out at the last item. */
  onNext?: (() => void) | undefined;
} & Passthrough;

/**
 * A full-screen photo or video viewer on the browser's own `<dialog>`: it is opened with
 * `showModal()` on mount, so render it only while it is open. The page behind goes inert, Esc
 * closes it and focus stays inside; a click on the scrim around the media and its text closes it
 * too. The scrim stays near-black with light text in every theme. `onPrevious` and `onNext` add
 * step buttons and the arrow keys.
 */
export function Lightbox({
  label,
  children,
  title,
  meta,
  caption,
  onClose,
  onPrevious,
  onNext,
  ...rest
}: LightboxProps): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null);
  const closed = useModal(dialog, onClose);

  const close = () => dialog.current?.close();
  // The scrim is the dialog and the layout boxes in it, marked `data-scrim`; the media, the text and
  // the buttons are not.
  const clicked = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target instanceof HTMLElement && event.target.hasAttribute("data-scrim")) close();
  };
  const stepped = (event: KeyboardEvent<HTMLDialogElement>) => {
    const step = { ArrowLeft: onPrevious, ArrowRight: onNext }[event.key];
    if (!step) return;
    event.preventDefault();
    step();
  };

  return (
    <dialog
      {...rest}
      ref={dialog}
      aria-label={label}
      data-scrim=""
      onClose={closed}
      onClick={clicked}
      onKeyDown={stepped}
      className={VIEWER}
    >
      <header data-scrim="" className="flex shrink-0 items-start justify-between gap-3 p-3">
        <div className="min-w-0 px-2 py-1.5">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {meta && <div className="text-xs text-white/70">{meta}</div>}
        </div>
        <ScrimButton label="Close" path={CLOSE} onClick={close} />
      </header>
      <div data-scrim="" className="flex min-h-0 flex-1 items-center gap-2 px-3">
        {onPrevious && <ScrimButton label="Previous" path={PREVIOUS} onClick={onPrevious} />}
        <div
          data-scrim=""
          className="flex size-full min-w-0 items-center justify-center *:max-h-full *:max-w-full *:object-contain"
        >
          {children}
        </div>
        {onNext && <ScrimButton label="Next" path={NEXT} onClick={onNext} />}
      </div>
      <footer data-scrim="" className="flex shrink-0 justify-center px-5 py-4">
        {caption && <p className="max-w-prose text-center text-sm text-white/70">{caption}</p>}
      </footer>
    </dialog>
  );
}
