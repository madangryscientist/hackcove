import { cx } from "./cx.js";

/**
 * A small red count, 10px, for sitting on an icon. Position it from outside with `className`
 * (`absolute -right-1 -top-1` over a `relative` parent); a count above 99 reads `99+`. Name the
 * control it sits on (`aria-label` on the button) for a screen reader.
 */
export function Badge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-red-50",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
