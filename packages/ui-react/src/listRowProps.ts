import type {
  ComponentPropsWithoutRef,
  MouseEventHandler,
  PointerEventHandler,
  ReactNode,
} from "react";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";

// The props of `ListRow`, one type per form: a button row, a link row and a static row.

type Shared = {
  /**
   * `sm` is dense padding, `lg` one step roomier than `md`. A `Button`, `IconButton` or `Pill` in a
   * `sm` row with no `size` of its own is `sm` too.
   * @default md
   */
  size?: Size | undefined;
  /** A hairline above the row: set it on every row after the first. */
  divided?: boolean | undefined;
  /** Content before the label: an Avatar, a thumbnail, an icon. */
  leading?: ReactNode | undefined;
  /** A second, muted line under the label (a date, a note), like `TableCell`'s `secondary`. */
  secondary?: ReactNode | undefined;
  /** Content at the far end of the row: a value, a count, a Pill. */
  trailing?: ReactNode | undefined;
  /**
   * Marks the row in view, the one whose detail is open: a violet fill and `aria-current="true"`.
   * Set it on one row of a list.
   */
  selected?: boolean | undefined;
  /**
   * Marks the row the keyboard cursor is on, for a list moved with the arrow keys or `j`/`k` while
   * focus stays on the list: the focus ring, drawn inside the row. It says nothing to a screen
   * reader (move real focus for that) and combines with `selected`.
   */
  focused?: boolean | undefined;
  /**
   * Marks the row a list follows with the pointer and the keyboard alike (set it from
   * `onPointerEnter` and `onFocus`): a fill one step deeper than hover, so it shows on a white card
   * and on a tinted panel alike. On a static row it shows the fill without `revealOnHover`, and
   * shows `actions` that `revealOnHover` hides. `selected` wins.
   */
  highlighted?: boolean | undefined;
  /**
   * A fixed width for `leading`, for a thumbnail (an `<img>` fills it), so the labels of rows with
   * and without a picture still line up. Without it `leading` is as wide as its content.
   */
  leadingWidth?: "thumbnail" | undefined;
  children: ReactNode;
};

type NotStatic = { actions?: undefined; revealOnHover?: undefined; panel?: undefined };

export type ListRowButtonProps = Shared &
  NotStatic & {
    /**
     * Makes the row a collapsible header: sets `aria-expanded` and shows a chevron that turns down
     * when open. The caller owns the state and the section; pass `aria-controls` to name it.
     */
    expanded?: boolean | undefined;
    /** What the row does when pressed: it makes the row a button. */
    onClick: MouseEventHandler<HTMLButtonElement>;
    /** Why the row cannot be pressed: it fades, `aria-disabled` and focusable, the reason its tooltip. */
    disabledReason?: string | undefined;
    href?: undefined;
    /** On the row, not its button, so a link or button in `trailing` does not count as entering it. */
    onPointerEnter?: PointerEventHandler<HTMLDivElement> | undefined;
    /** On the row, not its button, so a link or button in `trailing` does not count as leaving it. */
    onPointerLeave?: PointerEventHandler<HTMLDivElement> | undefined;
  } & Unstyled<
    Omit<
      ComponentPropsWithoutRef<"button">,
      "children" | "onClick" | "onPointerEnter" | "onPointerLeave"
    >
  >;

export type ListRowLinkProps = Shared &
  NotStatic & {
    /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
    external?: boolean | undefined;
    expanded?: undefined;
    disabledReason?: undefined;
    /** On the row, not the link, so a link or button in the row does not count as leaving it. */
    onPointerEnter?: PointerEventHandler<HTMLDivElement> | undefined;
    onPointerLeave?: PointerEventHandler<HTMLDivElement> | undefined;
  } & Unstyled<
    Omit<ComponentPropsWithoutRef<"a">, "href" | "children" | "onPointerEnter" | "onPointerLeave">
  > & {
    /** Makes the row a link to this URL; an in-app path goes through the app's `LinkProvider`. */
    href: string;
  };

/**
 * A row with no `href` and no `onClick`: a `<div>` with no click target and no hover fill (unless
 * `revealOnHover`), for one that holds its own controls, taking `actions` as well.
 */
export type ListRowStaticProps = Shared & {
  /** Buttons for this row, after `trailing`: `Button size="sm"`, `IconButton`. */
  actions?: ReactNode | undefined;
  /**
   * Hides `actions` until the row is hovered or something in it has focus, so a long list is not a
   * wall of buttons. A touch screen has no hover, so they are always shown there.
   */
  revealOnHover?: boolean | undefined;
  /**
   * Content under the row, lined up with the label rather than the row's edge (past `leading`): the
   * panel of a row that opens in place, such as a conversation under its chat. It sits inside the
   * row, so `divided`, the fill and `revealOnHover` cover it too. Only a row that is neither a
   * button nor a link takes it.
   */
  panel?: ReactNode | undefined;
  expanded?: undefined;
  onClick?: undefined;
  disabledReason?: undefined;
  href?: undefined;
} & Unstyled<Omit<ComponentPropsWithoutRef<"div">, "children" | "onClick">>;

export type ListRowProps = ListRowButtonProps | ListRowLinkProps | ListRowStaticProps;
