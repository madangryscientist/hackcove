import {
  Children,
  createContext,
  type ElementType,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";
import { cx } from "./cx.js";

/*
   Loading skeletons. Internal: nothing here is exported from the package.

   A part that shows data, and every page layout, takes `loading` and `loadingLabel`. While loading,
   what the part has is drawn as it always is and what it does not have yet (an empty slot) is a
   bone of that slot's shape. A part's own `loading` wins; left out, it takes the nearest loading
   ancestor's, so one `loading` on a layout reaches everything inside it. The part whose own prop is
   `true` is the owner: it alone sets `aria-busy` and holds the one visually hidden label, so a wait
   is one busy region and one announcement however many parts draw bones in it.
*/

/** The two props every part that can wait for its data takes. */
export type LoadingProps = {
  /**
   * The data is not here yet: an empty slot draws a bone of its shape, a filled one draws as usual.
   * Left out, the part takes the nearest loading layout's or part's; `false` opts it out inside one.
   */
  loading?: boolean | undefined;
  /**
   * What a screen reader hears while this part is loading, when its own `loading` is set.
   * @default Loading
   */
  loadingLabel?: string | undefined;
};

const LoadingContext = createContext(false);

/** Whether a part is loading (its own prop, else its ancestors'), and whether it owns the wait. */
export function useLoading(own: boolean | undefined): { loading: boolean; owner: boolean } {
  const inherited = useContext(LoadingContext);
  return { loading: own ?? inherited, owner: own === true };
}

/** Passes `loading` down to every part inside. Renders no element. */
export function LoadingScope({
  loading,
  children,
}: {
  loading: boolean;
  children?: ReactNode;
}): ReactElement {
  return <LoadingContext.Provider value={loading}>{children}</LoadingContext.Provider>;
}

/**
 * A slot with nothing in it: `null`, `undefined`, `false`, an empty string or an empty array. A
 * number is a value, `0` included.
 */
export function isEmptySlot(value: ReactNode): boolean {
  return Children.toArray(value).every((part) => part === "");
}

/** The owner's root attribute: `aria-busy` while it waits, nothing otherwise. */
export function busy(owner: boolean, loading: boolean): { "aria-busy"?: true } {
  return owner && loading ? { "aria-busy": true } : {};
}

/** The owner's one visually hidden announcement. Renders nothing for a part that inherits. */
export function BusyLabel({
  owner,
  loading,
  label,
}: {
  owner: boolean;
  loading: boolean;
  label: string | undefined;
}): ReactElement | null {
  if (!owner || !loading) return null;
  return <span className="sr-only">{label ?? "Loading"}</span>;
}

/**
 * One bone: the skeleton colour, pulsing unless the reader asked for less motion, hidden from
 * assistive tech. `shape` is its size and corners, chosen by the part that draws it.
 */
export function Bone({ shape }: { shape: string }): ReactElement {
  return (
    <span
      aria-hidden="true"
      data-skeleton=""
      className={cx("bg-slate-200 motion-safe:animate-pulse", shape)}
    />
  );
}

/** How wide a line of text bones is. */
export type LineWidth = "full" | "3/4" | "3/5" | "1/2" | "1/3";

const WIDTH: Record<LineWidth, string> = {
  full: "w-full",
  "3/4": "w-3/4",
  "3/5": "w-3/5",
  "1/2": "w-1/2",
  "1/3": "w-1/3",
};

/**
 * Lines of text bones, each a rounded bar inside its own line height, so they take the room the
 * text would. The last of several is shorter, as a paragraph's last line is.
 */
export function BoneLines({
  count = 3,
  width = "full",
}: {
  count?: number;
  width?: LineWidth;
}): ReactElement {
  return (
    <span aria-hidden="true" className="flex flex-col gap-[0.4lh] py-[0.2lh]">
      {Array.from({ length: count }, (_, i) => (
        <Bone
          key={i}
          shape={cx(
            "block h-[0.6lh] rounded",
            count > 1 && i === count - 1 ? "w-3/5" : WIDTH[width],
          )}
        />
      ))}
    </span>
  );
}

/** One word-sized bone inside a line of text: a figure, a name, a label not here yet. */
export function InlineBone({ wide = false }: { wide?: boolean }): ReactElement {
  return <Bone shape={cx("inline-block h-[0.6lh] rounded align-middle", wide ? "w-28" : "w-16")} />;
}

/** The bones of a text role with nothing in it yet, shaped by its element. */
function TextBones({ tag }: { tag: ElementType }): ReactElement {
  if (tag === "span") return <InlineBone />;
  if (typeof tag === "string" && /^h[1-6]$/.test(tag)) return <BoneLines count={1} width="1/2" />;
  return <BoneLines />;
}

/**
 * A text role's wait: its root's `aria-busy`, and what it holds (its children, or bones of its
 * element's shape when it has none yet, then the owner's label). `bones` says which.
 */
export function useTextWait(
  tag: ElementType,
  { loading: own, loadingLabel, children }: LoadingProps & { children?: ReactNode },
): { attrs: { "aria-busy"?: true }; body: ReactNode; bones: boolean } {
  const { loading, owner } = useLoading(own);
  const bones = loading && isEmptySlot(children);
  return {
    attrs: busy(owner, loading),
    bones,
    body: (
      <>
        {bones ? <TextBones tag={tag} /> : children}
        <BusyLabel owner={owner} loading={loading} label={loadingLabel} />
      </>
    ),
  };
}

/**
 * A part that is all bone while it waits (a count, a pill with no text yet): a root carrying the
 * part's passthrough props and the owner's `aria-busy`, the one bone, and the owner's label.
 */
export function WaitingBone({
  own,
  label,
  shape,
  root,
  attrs,
}: {
  own: boolean | undefined;
  label: string | undefined;
  shape: string;
  root: string;
  attrs: object;
}): ReactElement {
  const { loading, owner } = useLoading(own);
  return (
    <span {...attrs} {...busy(owner, loading)} className={root}>
      <Bone shape={shape} />
      <BusyLabel owner={owner} loading={loading} label={label} />
    </span>
  );
}

/** The `id`, `data-*` and `aria-*` of a part's props: what its root takes through. */
export function passthroughOf(props: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => key === "id" || /^(?:data|aria)-/.test(key)),
  );
}
