import type { ReactNode } from "react";
import { cx } from "./cx.js";
import { Overline } from "./typography.js";
import type { Size } from "./size.js";

/** The space under a card's heading, by `size`. */
const HEADING_GAP: Record<Size, string> = { sm: "mb-2", md: "mb-3", lg: "mb-4" };

/** The padding of a card's bar and footer strips, by `size`. */
const STRIP_PAD: Record<Size, string> = { sm: "px-3 py-2", md: "px-5 py-3", lg: "px-6 py-4" };

export function CardHeading({
  id,
  title,
  count,
  status,
  bar,
  spaced,
  size,
}: {
  id: string | undefined;
  title: string;
  count: number | undefined;
  status: ReactNode;
  bar: boolean;
  spaced: boolean;
  size: Size;
}) {
  const ink = bar ? "text-slate-500" : "text-slate-400";
  return (
    <div
      className={cx(
        "flex gap-2",
        status ? "items-center" : "items-baseline",
        spaced && HEADING_GAP[size],
      )}
    >
      <Overline as="h2" id={id} color={bar ? "tertiary" : "muted"}>
        {title}
      </Overline>
      {count !== undefined && <span className={cx("text-xs font-medium", ink)}>{count}</span>}
      {status}
    </div>
  );
}

function CardActions({ children }: { children: ReactNode }) {
  return <div className="ml-auto flex items-center gap-2">{children}</div>;
}

export function CardBar({
  heading,
  actions,
  size,
}: {
  heading: ReactNode;
  actions: ReactNode;
  size: Size;
}) {
  return (
    <div
      className={cx(
        "flex items-center justify-between gap-3 border-b border-slate-200/70 bg-slate-50",
        STRIP_PAD[size],
      )}
    >
      {heading}
      {actions && <CardActions>{actions}</CardActions>}
    </div>
  );
}

export function CardFooter({ children, size }: { children: ReactNode; size: Size }) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-200/70 bg-slate-50 [&>[data-button-group]]:grow",
        STRIP_PAD[size],
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  heading,
  actions,
  size,
}: {
  heading: ReactNode;
  actions: ReactNode;
  size: Size;
}) {
  if (!actions) return heading;
  return (
    <div className={cx("flex items-center justify-between gap-3", HEADING_GAP[size])}>
      {heading}
      <CardActions>{actions}</CardActions>
    </div>
  );
}
