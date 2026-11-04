import {
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

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

/** One row of a KeyValueList: a label on the left, a tabular value on the right (or beside it, in an `align="start"` list). */
export function KeyValue({
  label,
  children,
  ...rest
}: {
  /** The term, on the left. */
  label: ReactNode;
  children: ReactNode;
} & Unstyled<HTMLAttributes<HTMLDivElement>>): ReactElement {
  const start = useContext(AlignContext) === "start";
  return (
    <div
      {...rest}
      className={start ? "col-span-2 grid grid-cols-subgrid" : "flex justify-between gap-3"}
    >
      <dt className="text-slate-600">{label}</dt>
      <dd className={start ? "tabular-nums" : "text-right tabular-nums"}>{children}</dd>
    </div>
  );
}
