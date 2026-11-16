import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import {
  Bone,
  BusyLabel,
  busy,
  isEmptySlot,
  LoadingScope,
  type LoadingProps,
  useLoading,
} from "./skeleton.js";
import { type TextTone, textToneClass } from "./typography.js";

type KeyValueAlign = "end" | "start";

const AlignContext = createContext<KeyValueAlign>("end");

/**
 * A definition list of label/value rows. By default each label is on the left and its value
 * right-aligned. `align="start"` puts every value left-aligned in one column beside the labels,
 * which are sized to the widest. While `loading` with no rows it draws three rows of bones.
 */
export function KeyValueList({
  align = "end",
  loading: ownLoading,
  loadingLabel,
  children,
  ...rest
}: {
  /**
   * `end` right-aligns each value; `start` puts every value left-aligned in one column beside the labels, sized to the widest.
   * @default end
   */
  align?: KeyValueAlign;
  children?: ReactNode;
} & LoadingProps &
  Passthrough): ReactElement {
  const { loading, owner } = useLoading(ownLoading);
  const rows =
    loading && isEmptySlot(children)
      ? [0, 1, 2].map((i) => (
          <KeyValue key={i} label={undefined}>
            {undefined}
          </KeyValue>
        ))
      : children;
  return (
    <dl
      {...rest}
      {...busy(owner, loading)}
      className={cx(
        align === "start"
          ? "grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5"
          : "flex flex-col gap-1.5",
        "text-sm",
      )}
    >
      <AlignContext.Provider value={align}>
        <LoadingScope loading={loading}>{rows}</LoadingScope>
      </AlignContext.Provider>
      <BusyLabel owner={owner} loading={loading} label={loadingLabel} />
    </dl>
  );
}

/** A label or value not here yet. */
function bone(wide: boolean): ReactElement {
  return <Bone shape={cx("inline-block h-[0.6lh] rounded align-middle", wide ? "w-24" : "w-14")} />;
}

/**
 * One row of a KeyValueList: a label on the left, a tabular value on the right (or beside it, in an
 * `align="start"` list). `total` makes it the sum row: a rule above, strong text. `tone` colours the
 * value, on any row: a total that does not reconcile is `total tone="warn"`. While `loading`, a
 * label or value not here yet is a bone.
 */
export function KeyValue({
  label,
  total = false,
  tone,
  loading: ownLoading,
  loadingLabel,
  children,
  ...rest
}: {
  /** The term, on the left. */
  label: ReactNode;
  /** The sum the rows above add up to: a firm rule above it and the label and value in strong ink. */
  total?: boolean | undefined;
  /** The meaning of the value, in the colours of a `Table` cell's `tone` (`TextTone`; `neutral`, the default, is the list's ink); the label keeps its ink. Colour alone does not say it, so the value or the label says it too: a sign, a word. */
  tone?: TextTone | undefined;
  children?: ReactNode;
} & LoadingProps &
  Passthrough): ReactElement {
  const start = useContext(AlignContext) === "start";
  const { loading, owner } = useLoading(ownLoading);
  return (
    <div
      {...rest}
      {...busy(owner, loading)}
      className={cx(
        start ? "col-span-2 grid grid-cols-subgrid" : "flex justify-between gap-3",
        total && "border-t border-slate-300 pt-1.5 font-semibold",
      )}
    >
      <dt className={total ? "text-slate-900" : "text-slate-600"}>
        {loading && isEmptySlot(label) ? bone(true) : label}
      </dt>
      <dd className={cx(!start && "text-right", "tabular-nums", textToneClass(tone))}>
        {loading && isEmptySlot(children) ? bone(false) : children}
        <BusyLabel owner={owner} loading={loading} label={loadingLabel} />
      </dd>
    </div>
  );
}
