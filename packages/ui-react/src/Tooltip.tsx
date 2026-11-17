import {
  type CSSProperties,
  type ReactElement,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react";

// The tooltip's layer is a native `popover="manual"` in the top layer, so a clipping table cell or
// card never cuts it off, placed above its trigger with CSS anchor positioning and flipped below
// when there is no room. Anchor positioning is newer than the browsers the library supports, so it
// is an enhancement: where the popover API or `CSS.supports("anchor-name: --a")` is missing, and on the server and the
// first client render, the trigger keeps the native `title` and no tooltip is drawn.
//
// Nothing here is a timer. Script reacts to events (enter, leave, focus, blur, Escape, a tap) and
// calls `showPopover()` and `hidePopover()`. The half-second wait before a hover shows is CSS: an
// animation with a delay holds the tooltip `visibility: hidden` (a discrete keyframe), and focus
// and a tap carry no animation, so they show at once. The popover's padding is the bridge the
// pointer crosses from the trigger to the tooltip, so moving onto it keeps it open.
const css = `[data-hc-tooltip]{position:fixed;inset:auto;margin:0;border:0;padding:.375rem 0;background:transparent;overflow:visible;width:max-content;max-width:min(20rem,calc(100vw - 2rem));position-area:top;position-try-fallbacks:flip-block}[data-hc-tooltip][data-via=pointer]{animation:hc-tooltip-in .01s linear .5s backwards}@keyframes hc-tooltip-in{from,to{visibility:hidden}}`;

const CHIP =
  "block rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 shadow-lg whitespace-normal break-words";

type Via = "pointer" | "focus" | "tap";

/** What a trigger may carry that the tooltip merges with. */
export type TriggerOwn<E extends Element> = {
  title?: string | undefined;
  "aria-describedby"?: string | undefined;
  onPointerEnter?: ((event: PointerEvent<E>) => void) | undefined;
  onPointerLeave?: ((event: PointerEvent<E>) => void) | undefined;
  onPointerDown?: ((event: PointerEvent<E>) => void) | undefined;
  onFocus?: ((event: FocusEvent<E>) => void) | undefined;
  onBlur?: ((event: FocusEvent<E>) => void) | undefined;
  onKeyDown?: ((event: KeyboardEvent<E>) => void) | undefined;
};

/** What to spread on the trigger after the caller's own props: the same keys, merged. */
export type TriggerProps<E extends Element> = TriggerOwn<E> & { style?: CSSProperties };

type Options = {
  /**
   * The text describes the trigger (`aria-describedby`): a disabled reason, a pill's detail. Left
   * false, the text is the trigger's name, already its `aria-label`, so the tooltip is hidden from
   * assistive tech and links nothing.
   */
  describes: boolean;
  /** A touch tap on the trigger shows the tooltip, and the next tap anywhere hides it. */
  tap?: boolean | undefined;
};

/** Whether this browser has the popover API and places a popover by its anchor. Read after mount. */
function anchorPositioning(): boolean {
  if (typeof HTMLElement === "undefined" || !("showPopover" in HTMLElement.prototype)) return false;
  return typeof CSS !== "undefined" && typeof CSS.supports === "function"
    ? CSS.supports("anchor-name: --a")
    : false;
}

const never = (): (() => void) => () => {};

/**
 * Whether the focus shows its ring: from the keyboard, not the focus a click or a modal opened by a
 * click gives. A browser without `:focus-visible` counts every focus.
 */
function focusVisible(element: Element): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

/** Shows the layer while `open`, hides it when not: the popover's own methods, never a timer. */
function useLayer(layer: HTMLSpanElement | null, open: boolean): void {
  useEffect(() => {
    if (!layer) return;
    if (open) layer.showPopover();
    else layer.hidePopover();
  }, [layer, open]);
}

/** While a tap holds the tooltip open, the next tap anywhere but the trigger closes it. */
function useTapAway(on: boolean, trigger: Element | null, close: () => void): void {
  useEffect(() => {
    if (!on) return undefined;
    const away = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && trigger?.contains(target)) return;
      close();
    };
    document.addEventListener("pointerdown", away, true);
    return () => document.removeEventListener("pointerdown", away, true);
  }, [on, trigger, close]);
}

/**
 * While the tooltip is open, Escape closes it wherever focus is (WCAG 1.4.13): a hover opens it
 * without moving focus, so the trigger's own key handler never sees the key. Capture on `document`,
 * and no `preventDefault` or `stopPropagation`, so Escape still reaches a Dialog or Drawer in the
 * same press.
 */
function useEscape(on: boolean, close: () => void): void {
  useEffect(() => {
    if (!on) return undefined;
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", escape, true);
    return () => document.removeEventListener("keydown", escape, true);
  }, [on, close]);
}

type TipState = {
  via: Via | null;
  setVia: (next: Via | null | ((current: Via | null) => Via | null)) => void;
  trigger: Element | null;
  setTrigger: (trigger: Element) => void;
  layer: HTMLSpanElement | null;
  pressed: boolean;
  setPressed: (pressed: boolean) => void;
  tap: boolean;
};

/** The pointer left the trigger or the tooltip: close a hover tip, unless it moved onto the other. */
function leave(tip: TipState, related: EventTarget | null, from: "trigger" | "tooltip"): void {
  const other = from === "trigger" ? tip.layer : tip.trigger;
  if (related instanceof Node && other?.contains(related)) return;
  tip.setVia((current) => (current === "pointer" ? null : current));
}

/** The trigger's handlers: the caller's own first, then the tooltip's. */
function handlers<E extends Element>(own: TriggerOwn<E>, tip: TipState): TriggerOwn<E> {
  return {
    onPointerEnter: (event) => {
      own.onPointerEnter?.(event);
      tip.setTrigger(event.currentTarget);
      if (event.pointerType !== "touch") tip.setVia((current) => current ?? "pointer");
    },
    onPointerLeave: (event) => {
      own.onPointerLeave?.(event);
      leave(tip, event.relatedTarget, "trigger");
    },
    onPointerDown: (event) => {
      own.onPointerDown?.(event);
      tip.setTrigger(event.currentTarget);
      // The focus this press gives the trigger pops nothing: only the keyboard's (or script's) does.
      tip.setPressed(true);
      if (event.pointerType === "touch" && tip.tap) {
        tip.setVia((current) => (current === "tap" ? null : "tap"));
        return;
      }
      // A press on the trigger is the action, not a request for the tip.
      tip.setVia(null);
    },
    onFocus: (event) => {
      own.onFocus?.(event);
      tip.setTrigger(event.currentTarget);
      // The focused element, not the trigger: a wrapper's focus is the button inside it.
      if (!tip.pressed && focusVisible(event.target)) tip.setVia("focus");
      tip.setPressed(false);
    },
    onBlur: (event) => {
      own.onBlur?.(event);
      // A click on a trigger that already has focus fires no focus event to clear the press.
      tip.setPressed(false);
      tip.setVia((current) => (current === "tap" ? current : null));
    },
    onKeyDown: (event) => {
      own.onKeyDown?.(event);
      // Dismissed where it stands (WCAG 1.4.13): focus stays. The key goes on, so Escape in a
      // Dialog or Drawer still closes it in one press.
      if (event.key === "Escape") tip.setVia(null);
    },
  };
}

/**
 * Wires one internal tooltip to a trigger. Spread `props` on the trigger after the caller's own
 * props: it holds the same keys, merged (`aria-describedby` and the handlers keep the caller's), and
 * render `tooltip` right after the trigger. With no `text`, `props` is `own` unchanged and
 * `tooltip` is null. Internal: not exported from the package.
 */
export function useTooltip<E extends Element>(
  text: string | undefined,
  { describes, tap = false }: Options,
  own: TriggerOwn<E>,
): { props: TriggerProps<E>; tooltip: ReactNode } {
  const id = useId();
  // False in the server markup and while the client hydrates, so both render the native `title`.
  const enhanced = useSyncExternalStore(never, anchorPositioning, () => false);
  const [via, setVia] = useState<Via | null>(null);
  const [trigger, setTrigger] = useState<Element | null>(null);
  const [layer, setLayer] = useState<HTMLSpanElement | null>(null);
  const [pressed, setPressed] = useState(false);
  const close = useCallback(() => setVia(null), []);
  useLayer(layer, via !== null);
  useTapAway(via === "tap", trigger, close);
  useEscape(via !== null, close);

  if (text === undefined || text === "") return { props: own, tooltip: null };
  if (!enhanced) return { props: { ...own, title: text }, tooltip: null };

  const tip: TipState = { via, setVia, trigger, setTrigger, layer, pressed, setPressed, tap };
  const anchor = `--hc-tip${id.replaceAll(/[^a-zA-Z0-9_-]/g, "")}`;
  const tipId = `${id}-tip`;
  const describedBy = describes
    ? [own["aria-describedby"], tipId].filter(Boolean).join(" ")
    : own["aria-describedby"];
  const props: TriggerProps<E> = {
    ...handlers(own, tip),
    // The native title goes: the tooltip shows the text, and both at once would double it.
    title: undefined,
    "aria-describedby": describedBy || undefined,
    style: { anchorName: anchor },
  };
  const tooltip = (
    <>
      <style>{css}</style>
      <span
        ref={setLayer}
        id={tipId}
        role="tooltip"
        popover="manual"
        data-hc-tooltip=""
        data-via={via ?? undefined}
        aria-hidden={describes ? undefined : true}
        style={{ positionAnchor: anchor }}
        onPointerLeave={(event) => leave(tip, event.relatedTarget, "tooltip")}
      >
        <span className={CHIP}>{text}</span>
      </span>
    </>
  );
  return { props, tooltip };
}

/**
 * `useTooltip` as a part, for a component that picks its element in a branch: `children` draws the
 * trigger from the merged props, and the tooltip follows it. Internal.
 */
export function Tipped<E extends Element>({
  text,
  describes,
  tap,
  own,
  children,
}: Options & {
  text: string | undefined;
  own: TriggerOwn<E>;
  children: (props: TriggerProps<E>) => ReactElement;
}): ReactElement {
  const { props, tooltip } = useTooltip(text, { describes, tap }, own);
  return (
    <>
      {children(props)}
      {tooltip}
    </>
  );
}
