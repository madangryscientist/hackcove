import { Children, type ReactElement, type ReactNode, useLayoutEffect, useRef } from "react";
import { cx, focusRing, themedScrollbar } from "./cx.js";
import type { Passthrough } from "./props.js";

const HEIGHT = {
  sm: "max-h-80",
  md: "max-h-[28rem]",
  lg: "max-h-[40rem]",
  fill: "h-full min-h-0",
} as const;

/** How far above the very bottom, in pixels, still counts as reading the latest message. */
const BOTTOM_SLACK = 32;

/** Whether a box scrolled this far is at its bottom, give or take `BOTTOM_SLACK`. */
export function isAtBottom(scrollTop: number, clientHeight: number, scrollHeight: number): boolean {
  return scrollHeight - scrollTop - clientHeight <= BOTTOM_SLACK;
}

/**
 * Starts the box at the bottom and keeps it there as the content grows, until the reader scrolls
 * up; scrolling back to the bottom re-arms it. The box is watched as well as the content: a box
 * that gets shorter (a phone's keyboard opening under `fill`) has moved the bottom out of view too.
 */
function useStickToBottom() {
  const box = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  useLayoutEffect(() => {
    const scroller = box.current;
    if (!scroller || !content.current) return undefined;
    const follow = () => {
      if (following.current) scroller.scrollTop = scroller.scrollHeight;
    };
    follow();
    // jsdom (a consumer's own tests) has no ResizeObserver.
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(follow);
    observer.observe(content.current);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);
  const onScroll = () => {
    const scroller = box.current;
    if (!scroller) return;
    following.current = isAtBottom(
      scroller.scrollTop,
      scroller.clientHeight,
      scroller.scrollHeight,
    );
  };
  return { box, content, onScroll };
}

/**
 * The scrolling box of a chat: its children are the messages, tool cards and anything else, a gap
 * apart. It follows the newest content unless the reader has scrolled up. It is a named region and
 * a tab stop, so a keyboard can scroll it. It is deliberately not a live region, which would read
 * every streamed token aloud: set `announce` when a message is finished.
 */
export function ChatThread({
  label,
  height = "md",
  empty,
  announce,
  children,
  ...rest
}: {
  /** Names the region. */
  label: string;
  /**
   * The tallest it gets before it scrolls: `sm` 20rem, `md` 28rem, `lg` 40rem. `fill` takes the
   * height of a parent that sets one.
   * @default md
   */
  height?: "sm" | "md" | "lg" | "fill" | undefined;
  /** Drawn instead when there are no children: an `EmptyState`. */
  empty?: ReactNode;
  /** Text a screen reader reads out politely when it changes. Set it when a message is finished, not on each token. */
  announce?: string | undefined;
  children?: ReactNode;
} & Passthrough): ReactElement {
  const { box, content, onScroll } = useStickToBottom();
  return (
    <>
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>
      <div
        {...rest}
        ref={box}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={onScroll}
        className={cx("overflow-y-auto rounded-lg", HEIGHT[height], themedScrollbar, focusRing)}
      >
        <div ref={content} className="flex flex-col gap-3 text-slate-900">
          {Children.toArray(children).length === 0 ? empty : children}
        </div>
      </div>
    </>
  );
}
