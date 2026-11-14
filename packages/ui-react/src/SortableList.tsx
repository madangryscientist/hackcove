import {
  type AriaAttributes,
  type JSX,
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
  useMemo,
} from "react";
import {
  Button,
  DropIndicator,
  type DropTarget,
  GridList,
  GridListHeader,
  GridListItem,
  GridListSection,
  type Key,
  useDragAndDrop,
} from "react-aria-components";
import { cx, focusRing } from "./cx.js";
import type { DataAttributes } from "./link.js";

/** A move the user made: which item, the section it lands in, and the item it lands next to. */
export type SortableMove = {
  /** The `id` of the item that moved. */
  id: string;
  /** The `id` of the `SortableSection` the item lands in. Set whenever the list has sections. */
  section?: string;
  /**
   * The item it was dropped before or after. Absent only for a drop into an empty section, where
   * there is no item to land next to.
   */
  target?: { id: string; position: "before" | "after" };
};

/** The list's box: the Card's border, fill and shadow, clipped to its radius. */
const FRAME =
  "w-full overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm outline-none";

/**
 * A hairline above every row that follows another row (an item, a heading, a drop line), so the
 * first row of the list sits flush under the frame's own border. The line's colour is set apart.
 */
const AFTER_ROW = "border-slate-200/70 [[role=row]+&]:border-t";

/** A section after another section gets the same hairline above its heading. */
const AFTER_SECTION = "border-slate-200/70 [[role=rowgroup]+&]:border-t";

const HEADING =
  "flex items-center justify-between gap-3 bg-slate-50 px-4 py-2 text-xs font-medium tracking-wide text-slate-600 uppercase";

const ITEM =
  "flex w-full cursor-grab items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 outline-none hover:bg-slate-50";

/** The keyboard cursor: the focus ring, drawn inside the row. */
const ITEM_FOCUSED = "outline-2 -outline-offset-2 outline-violet-600";

/** An empty section's "Drop here" row. */
const PLACEHOLDER = "px-4 py-3 text-sm text-slate-500 outline-none";

/** The tail row of a section with items: takes no room and shows nothing but the drop line. */
const TAIL = "h-0 overflow-hidden outline-none";

/** A marker on every row a pointer can drop next to: the items and each section's tail row. */
const ROW_MARK = "data-sortable-row";

/** What a part takes through to its element: `data-*` (an e2e hook) and a description. */
type Through = DataAttributes & Pick<AriaAttributes, "aria-describedby" | "aria-details">;

/**
 * react-aria drops an `aria-describedby` or `aria-details` it is handed on a row or a section, and
 * sets its own describedby on a row. This draws the element with both: its own ids and the app's.
 */
function describedBy({ "aria-describedby": described, "aria-details": details, ...data }: Through) {
  return {
    ...data,
    render: (props: JSX.IntrinsicElements["div"]) => (
      <div
        {...props}
        aria-describedby={
          [props["aria-describedby"], described].filter(Boolean).join(" ") || undefined
        }
        aria-details={details ?? props["aria-details"]}
      />
    ),
  };
}

/**
 * The key of a section's tail row. Every section ends with one: in an empty section it is the "Drop
 * here" row, in one with items it is an empty row of no height. A drop before it is a drop at the
 * end of the section. react-aria's keyboard drop moves cannot step from "after the last item" of a
 * section into the next one (it wraps to the top), but they do step from "before" a row to "before"
 * the next row across sections, so with a tail row the end of each section is a "before" target.
 */
function tailKey(section: string): string {
  return `hackcove-sortable-end:${section}`;
}

/** The `SortableItem` children of a section, the ones its count counts. */
function itemsOf(children: ReactNode): ReactElement<SortableItemProps>[] {
  return Children.toArray(children).filter(
    (child): child is ReactElement<SortableItemProps> =>
      isValidElement(child) && child.type === SortableItem,
  );
}

/** A row's section and title; a tail row also lists its section's items, in order. */
type Place = { section?: string; title: string; tail?: string[] };

/** Every row's key mapped to its section (and, for a tail row, the section's items), read from the children. */
function placesOf(children: ReactNode): Map<string, Place> {
  const places = new Map<string, Place>();
  for (const child of Children.toArray(children)) {
    if (isValidElement<SortableItemProps>(child) && child.type === SortableItem) {
      const { id, title } = child.props;
      places.set(id, { title });
    } else if (isValidElement<SortableSectionProps>(child) && child.type === SortableSection) {
      const { id: section, children: items } = child.props;
      const own = itemsOf(items);
      for (const item of own) places.set(item.props.id, { section, title: item.props.title });
      places.set(tailKey(section), { section, title: "", tail: own.map((item) => item.props.id) });
    }
  }
  return places;
}

/**
 * Where a pointer drops: before or after the row it is over, by which half it is in. Over a section
 * heading, or in a gap, it is before the next row below (the first item of that section, or its
 * "Drop here" row), and below every row it is after the last. Never "on" a row.
 */
function dropTargetAt(list: HTMLElement | null, y: number): DropTarget | null {
  if (!list) return null;
  const top = y + list.getBoundingClientRect().top;
  const rows = [...list.querySelectorAll<HTMLElement>(`[${ROW_MARK}]`)];
  for (const row of rows) {
    const key = row.dataset.key;
    if (key == null) continue;
    const box = row.getBoundingClientRect();
    if (top < box.top) return { type: "item", key, dropPosition: "before" };
    if (top <= box.bottom) {
      return {
        type: "item",
        key,
        dropPosition: top < box.top + box.height / 2 ? "before" : "after",
      };
    }
  }
  const last = rows.at(-1)?.dataset.key;
  return last == null ? null : { type: "item", key: last, dropPosition: "after" };
}

/** react-aria's pointer drop delegate, aware of sections (the stock one sees only top-level items). */
function sectionDelegate(listId: string) {
  return {
    getDropTargetFromPoint: (_x: number, y: number) =>
      dropTargetAt(document.getElementById(listId), y),
  };
}

/** Only a drop between two rows is a move; a drop on a row's centre, or on the list itself, is not. */
export function dropOperation(target: DropTarget): "move" | "cancel" {
  return target.type === "item" && target.dropPosition !== "on" ? "move" : "cancel";
}

/**
 * The move react-aria reported, as the app's `SortableMove`, or nothing when it is not one (a drop
 * on a row's centre, or next to the item itself). A drop at a section's tail lands after the
 * section's last other item, or with no target when it has none.
 */
export function moveOf(
  places: Map<string, Place>,
  keys: Iterable<Key>,
  target: DropTarget,
): SortableMove | null {
  const [key] = keys;
  if (key == null || target.type !== "item" || target.dropPosition === "on") return null;
  const place = places.get(String(target.key));
  if (!place) return null;
  const id = String(key);
  if (String(target.key) === id) return null;
  const section = place.section === undefined ? {} : { section: place.section };
  if (place.tail) {
    const last = place.tail.filter((item) => item !== id).at(-1);
    return last === undefined
      ? { id, ...section }
      : { id, ...section, target: { id: last, position: "after" } };
  }
  return {
    id,
    ...section,
    target: { id: String(target.key), position: target.dropPosition },
  };
}

/**
 * A list the user puts in order: items under section headings, moved by dragging a row or from the
 * keyboard (each row's grip handle, Enter, the arrow keys, Enter to drop, Escape to cancel). A drop
 * reports `onReorder` with the item, the section it lands in and the item it lands next to; the app
 * applies it to its own data. The list never reorders itself: it shows what its children say.
 *
 * Its children are `SortableSection`s, or `SortableItem`s directly for a list with no sections, each
 * a direct child (map your data straight to them). Moving an item into another section is how the
 * app changes its group, such as a ticket's priority. Two lists on one page never take each other's
 * items.
 */
export function SortableList({
  label,
  onReorder,
  children,
  ...rest
}: {
  /** The list's accessible name, read by a screen reader. */
  label: string;
  /** Called once per drop with the move; apply it to your data. */
  onReorder: (move: SortableMove) => void;
  /** `SortableSection`s, or `SortableItem`s for a list with no sections. */
  children: ReactNode;
} & Through): ReactElement {
  const listId = useId();
  const dragType = `application/x-hackcove-sortable-${useId()
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()}`;
  const places = placesOf(children);
  const delegate = useMemo(() => sectionDelegate(listId), [listId]);
  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
      [...keys].map((key) => ({
        "text/plain": places.get(String(key))?.title ?? String(key),
        [dragType]: String(key),
      })),
    acceptedDragTypes: [dragType],
    getDropOperation: dropOperation,
    dropTargetDelegate: delegate,
    onMove: (e) => {
      const move = moveOf(places, e.keys, e.target);
      if (move) onReorder(move);
    },
    renderDropIndicator: (target) => (
      <DropIndicator target={target} className="relative h-0 outline-none">
        {({ isDropTarget }) => (
          <span
            aria-hidden="true"
            className={cx(
              "absolute inset-x-0 -top-px z-10 block h-0.5",
              isDropTarget && "bg-violet-600",
            )}
          />
        )}
      </DropIndicator>
    ),
  });
  return (
    <GridList
      {...describedBy(rest)}
      id={listId}
      aria-label={label}
      dragAndDropHooks={dragAndDropHooks}
      disabledBehavior="all"
      className={FRAME}
    >
      {children}
    </GridList>
  );
}

type SortableSectionProps = {
  /** The section's id, reported as `section` in a move that lands in it. */
  id: string;
  /** The heading over its items. */
  title: string;
  /** Its `SortableItem`s, each a direct child. With none it shows a quiet "Drop here" row. */
  children?: ReactNode;
};

/**
 * One group of a `SortableList` under a heading that shows its title and how many items it holds.
 * An empty section still takes a drop: it shows a quiet "Drop here" row in place of items.
 */
export function SortableSection({
  id,
  title,
  children,
  ...rest
}: SortableSectionProps & Through): ReactElement {
  const count = itemsOf(children).length;
  return (
    <GridListSection {...describedBy(rest)} id={id} aria-label={title} className={AFTER_SECTION}>
      <GridListHeader className={HEADING}>
        <span>{title}</span>
        <span className="tabular-nums text-slate-500">{count}</span>
      </GridListHeader>
      {children}
      <GridListItem
        id={tailKey(id)}
        textValue={count > 0 ? `End of ${title}` : "Drop here"}
        isDisabled
        {...{ [ROW_MARK]: "" }}
        className={count > 0 ? TAIL : cx(PLACEHOLDER, AFTER_ROW)}
      >
        {/* react-aria wants a drag slot in every row; this one is never shown or used. */}
        <Button slot="drag" className="hidden" />
        {count === 0 && "Drop here"}
      </GridListItem>
    </GridListSection>
  );
}

type SortableItemProps = {
  /** The item's id, reported in a move. */
  id: string;
  /** Its one line; also what a screen reader announces while it is dragged. */
  title: string;
  /** A meta line under the title: `Pill`s, an `Avatar`. */
  children?: ReactNode;
};

/** The six-dot grip on each row's handle. */
const GRIP = (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-4 w-4">
    <circle cx="6" cy="4" r="1.25" />
    <circle cx="10" cy="4" r="1.25" />
    <circle cx="6" cy="8" r="1.25" />
    <circle cx="10" cy="8" r="1.25" />
    <circle cx="6" cy="12" r="1.25" />
    <circle cx="10" cy="12" r="1.25" />
  </svg>
);

/**
 * One row of a `SortableList`: a grip handle, the title, and an optional meta line under it. A
 * pointer drags the row itself; the handle ("Reorder <title>") is how a keyboard or screen reader
 * starts a move.
 */
export function SortableItem({
  id,
  title,
  children,
  ...rest
}: SortableItemProps & Through): ReactElement {
  return (
    <GridListItem
      {...describedBy(rest)}
      id={id}
      textValue={title}
      {...{ [ROW_MARK]: "" }}
      className={({ isFocusVisible, isDragging }) =>
        cx(ITEM, AFTER_ROW, isFocusVisible && ITEM_FOCUSED, isDragging && "opacity-50")
      }
    >
      <Button
        slot="drag"
        aria-label={`Reorder ${title}`}
        className={cx("shrink-0 rounded p-0.5 text-slate-400", focusRing)}
      >
        {GRIP}
      </Button>
      <div className="min-w-0 flex-1">
        <div className="truncate">{title}</div>
        {children != null && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {children}
          </div>
        )}
      </div>
    </GridListItem>
  );
}
