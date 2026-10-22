import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { cx } from "./cx.js";

/** A definition list of label/value rows: each label on the left, its value right-aligned. */
export function KeyValueList({
  className,
  children,
  ...rest
}: {
  children: ReactNode;
} & HTMLAttributes<HTMLDListElement>): ReactElement {
  return (
    <dl className={cx("flex flex-col gap-1.5 text-sm", className)} {...rest}>
      {children}
    </dl>
  );
}

/** One row of a KeyValueList: a label on the left, a right-aligned tabular value on the right. */
export function KeyValue({
  label,
  children,
  className,
  ...rest
}: {
  label: ReactNode;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div className={cx("flex justify-between gap-3", className)} {...rest}>
      <dt className="text-slate-600">{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  );
}
