import type { ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";

const BUBBLE = "max-w-[90%] rounded-xl px-3 py-2 text-sm text-slate-900";

const ROLE = {
  user: { side: "items-end", row: "justify-end", bubble: "bg-slate-100" },
  assistant: {
    side: "items-start",
    row: "justify-start",
    bubble: "border border-slate-200 bg-white",
  },
} as const;

/**
 * One message in a chat: a bubble on the sender's side, with an optional line above it and a row of
 * actions under it. `children` is the body as the caller wants it (plain text, which keeps its line
 * breaks, a `Markdown`, an `Image`). `streaming` marks a reply still arriving; with no children it
 * draws the caret alone, the pending state.
 */
export function ChatMessage({
  role,
  author,
  meta,
  actions,
  streaming = false,
  children,
  ...rest
}: {
  /** Whose side it sits on: `user` on the right on the inset fill, `assistant` on the left on the surface. */
  role: "user" | "assistant";
  /** Who sent it, read first by a screen reader and drawn nowhere: alignment alone tells a screen reader nothing. Show a sender with `meta`. */
  author: string;
  /** A small line above the bubble: a sender and a time, already formatted. */
  meta?: ReactNode;
  /** A row under the bubble on the message's own side: copy, retry, a row of reaction `Pill`s. */
  actions?: ReactNode;
  /**
   * The reply is still arriving: sets `aria-busy` and draws a caret after the body, which pulses
   * unless the reader asks for reduced motion.
   * @default false
   */
  streaming?: boolean | undefined;
  /** The body. It may be empty while `streaming`. */
  children?: ReactNode;
} & Passthrough): ReactElement {
  const look = ROLE[role];
  return (
    <article
      {...rest}
      aria-busy={streaming || undefined}
      className={cx("flex w-full min-w-0 flex-col gap-1", look.side)}
    >
      <span className="sr-only">{author}</span>
      {meta && <div className="text-xs text-slate-500">{meta}</div>}
      <div className={cx(BUBBLE, look.bubble, "wrap-anywhere whitespace-pre-wrap")}>
        {children}
        {streaming && (
          <span aria-hidden="true" className="text-slate-400 motion-safe:animate-pulse">
            ▍
          </span>
        )}
      </div>
      {actions && (
        <div className={cx("flex flex-wrap items-center gap-1", look.row)}>{actions}</div>
      )}
    </article>
  );
}
