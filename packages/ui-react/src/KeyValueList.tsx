import {
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";
import { TEXT_TONE, type TextTone } from "./typography.js";

type KeyValueAlign = "end" | "start";

const AlignContext = createContext<KeyValueAlign>("end");

/**
 * A definition list of label/value rows. By default each label is on the left and its value
 * right-aligned. `align="start"` puts every value left-aligned in one column beside the labels,
 * which are sized to the widest.
 */
export function KeyValueList({
  align = "end",
  children,
  ...rest
}: {
  /**
   * `end` right-aligns each value; `start` puts every value left-aligned in one column beside the labels, sized to the widest.
   * @default end
   */
  align?: KeyValueAlign;
  children: ReactNode;
} & Unstyled<HTMLAttributes<HTMLDListElement>>): ReactElement {
  return (
    <dl
      {...rest}
      className={cx(
        align === "start"
          ? "grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5"
          : "flex flex-col gap-1.5",
        "text-sm",
      )}
    >
      <AlignContext.Provider value={align}>{children}</AlignContext.Provider>
    </dl>
  );
}

/**
 * One row of a KeyValueList: a label on the left, a tabular value on the right (or beside it, in an
 * `align="start"` list). `total` makes it the sum row: a rule above, strong text. `tone` colours the
 * value, on any row: a total that does not reconcile is `total tone="warn"`.
 */
export function KeyValue({
  label,
  total = false,
  tone,
  children,
  ...rest
}: {
  /** The term, on the left. */
  label: ReactNode;
  /** The sum the rows above add up to: a firm rule above it and the label and value in strong ink. */
  total?: boolean | undefined;
  /** The meaning of the value, in the colours of a `Table` cell's `tone` (`muted`, `positive`, `warn`, `danger`, `info`); the label keeps its ink. Colour alone does not say it, so the value or the label says it too: a sign, a word. */
  tone?: TextTone | undefined;
  children: ReactNode;
} & Unstyled<HTMLAttributes<HTMLDivElement>>): ReactElement {
  const start = useContext(AlignContext) === "start";
  return (
    <div
      {...rest}
      className={cx(
        start ? "col-span-2 grid grid-cols-subgrid" : "flex justify-between gap-3",
        total && "border-t border-slate-300 pt-1.5 font-semibold",
      )}
    >
      <dt className={total ? "text-slate-900" : "text-slate-600"}>{label}</dt>
      <dd className={cx(!start && "text-right", "tabular-nums", tone && TEXT_TONE[tone])}>
        {children}
      </dd>
    </div>
  );
}
