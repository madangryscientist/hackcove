import { type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import { type DataAttributes, dataAttributes, renderLink } from "./link.js";
import { Tipped } from "./Tooltip.js";

type Option = DataAttributes & {
  label: ReactNode;
  /** A small muted count after the label, part of the accessible name ("Shots 12"). */
  count?: number;
  /**
   * A tooltip on hover and keyboard focus, read out as the option's description; on a disabled
   * option it is the reason. A native `title` on a link option.
   */
  title?: string;
  // Any `data-*` key (`"data-testid": "tab-shots"`) is put on the option's button or link.
};

/** An option that is a button: it calls `onChange(value)`. */
export type SwitchButton = Option & {
  /** What `value` is set to when this option is current. */
  value: string;
  /**
   * Not chosen by click or arrow key. The button stays in the page as `aria-disabled`, so its
   * `title` still shows as its tooltip and is read out.
   */
  disabled?: boolean;
  /**
   * Why this option cannot be chosen: it is disabled as `disabled` is, but the arrow keys still
   * reach it (focus lands on it and chooses nothing), and the reason is its tooltip on hover,
   * keyboard focus and a tap, read out as its description.
   */
  disabledReason?: string;
  /** The id of the element this option controls (a tab's panel). */
  controls?: string;
  href?: undefined;
  external?: undefined;
};

/**
 * An option that is a link: `href`, drawn by the app's router link through `LinkProvider`. The router
 * changes the page; `selected` on the item, or a `value` equal to the group's, marks the current one.
 * `external` opens a new tab.
 */
export type SwitchLink = Option & {
  /** Marks this link current when it equals the group's `value`. */
  value?: string;
  /** This link is the current page. */
  selected?: boolean;
  disabled?: undefined;
  disabledReason?: undefined;
  controls?: undefined;
  external?: boolean;
  /** Where the option links. */
  href: string;
};

/** One option of a Tabs or SegmentedControl: a button or a link, never both in one group. */
export type SwitchItem = SwitchButton | SwitchLink;

type Shared = {
  /** The accessible name of the group. */
  label: string;
} & Passthrough;

export type SwitchProps = Shared &
  (
    | {
        /** The options in order: `{ value, label }` buttons, or links (`href`) with `value` marking the current one. Either may carry a `count`; a button may be `disabled`. */
        items: SwitchButton[];
        /** The `value` of the current option. */
        value: string;
        /** Called with the option's `value` when one is chosen, by click or arrow key. */
        onChange: (value: string) => void;
        /** Every option is disabled, e.g. until the page has hydrated. */
        disabled?: boolean;
      }
    | {
        /** The options in order: links (`href`), the current one marked by its `selected` or by a `value` equal to the group's. A link may carry a `count`. */
        items: SwitchLink[];
        /** The `value` of the current link, as an alternative to `selected` on the item. */
        value?: string;
        onChange?: undefined;
        disabled?: undefined;
      }
  );

type Parts = {
  /** The roles of a group of buttons; a group with links is a `<nav>` instead. */
  group: "tablist" | "radiogroup";
  item: "tab" | "radio";
  /** The vertical arrows move too, as in a radio group. */
  vertical: boolean;
  /** The options stack in a column: a tablist says so with `aria-orientation`. */
  stacked?: boolean;
  root: string;
  option: (active: boolean, disabled: boolean) => string;
};

/** The index a key moves to from `at` among `count` enabled options, wrapping; -1 for a key that does not move. */
function target(key: string, at: number, count: number, vertical: boolean): number {
  if (key === "ArrowRight" || (vertical && key === "ArrowDown")) return (at + 1) % count;
  if (key === "ArrowLeft" || (vertical && key === "ArrowUp")) return (at - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return -1;
}

/** The label with its count after it; the plain-space text node keeps the name "Shots 12". */
function Label({ item }: { item: SwitchItem }): ReactElement {
  if (item.count === undefined) return <>{item.label}</>;
  return (
    <>
      {item.label} <span className="ml-0.5 text-xs tabular-nums opacity-70">{item.count}</span>
    </>
  );
}

const isLinks = (items: SwitchProps["items"]): items is SwitchLink[] =>
  items.some((item) => item.href !== undefined);

const isCurrent = (item: SwitchLink, value: string | undefined): boolean =>
  item.selected === true || (item.value !== undefined && item.value === value);

function SwitchLinkItem({
  item,
  current,
  parts,
}: {
  item: SwitchLink;
  current: boolean;
  parts: Parts;
}): ReactElement {
  return renderLink({
    ...dataAttributes(item),
    href: item.href,
    external: item.external,
    className: parts.option(current, false),
    "aria-current": current ? "page" : undefined,
    ...(item.title === undefined ? {} : { title: item.title }),
    children: <Label item={item} />,
  });
}

/**
 * The arrow keys, Home and End on a button group: focus the next option and choose it. An option
 * with a reason is reached but not chosen, so the keyboard finds out why.
 */
function moveByArrows(event: KeyboardEvent<HTMLDivElement>, vertical: boolean): void {
  const buttons = [
    ...event.currentTarget.querySelectorAll(
      "button:not([aria-disabled=true]), button[data-hc-reason]",
    ),
  ];
  const at = buttons.findIndex((button) => button === event.target);
  if (at < 0) return;
  const button = buttons[target(event.key, at, buttons.length, vertical)];
  if (!(button instanceof HTMLButtonElement)) return;
  event.preventDefault();
  button.focus();
  if (!button.hasAttribute("data-hc-reason")) button.click();
}

/**
 * The shared body of Tabs and SegmentedControl: a row of options with one current. Buttons form a
 * `tablist` or `radiogroup` with a single tab stop and arrow-key movement (the arrow focuses and
 * chooses); links form a `<nav>` with `aria-current="page"` on the current one.
 */
export function Switcher({
  items,
  value,
  onChange,
  disabled: groupDisabled,
  label,
  parts,
  ...rest
}: SwitchProps & { parts: Parts }): ReactElement {
  const root = parts.root;
  if (isLinks(items)) {
    return (
      <nav {...rest} aria-label={label} className={root}>
        {items.map((item, index) => (
          <SwitchLinkItem
            key={item.value ?? item.href ?? index}
            item={item}
            current={isCurrent(item, value)}
            parts={parts}
          />
        ))}
      </nav>
    );
  }

  const off = (item: SwitchButton): boolean =>
    groupDisabled === true || item.disabled === true || item.disabledReason !== undefined;
  // An option with a reason stays reachable by the arrow keys, so the keyboard finds out why.
  const reasoned = (item: SwitchButton): boolean =>
    groupDisabled !== true && item.disabledReason !== undefined;
  const enabled = items.filter((item) => !off(item));
  const stop = enabled.some((item) => item.value === value) ? value : enabled[0]?.value;
  return (
    <div
      {...rest}
      role={parts.group}
      aria-label={label}
      {...(parts.stacked ? { "aria-orientation": "vertical" as const } : {})}
      {...(groupDisabled ? { "aria-disabled": true } : {})}
      onKeyDown={(event) => moveByArrows(event, parts.vertical)}
      className={root}
    >
      {items.map((item) => (
        // A title is the option's description, shown on hover and keyboard focus; on a disabled
        // option it is the reason, and a tap shows it too.
        <Tipped
          key={item.value}
          text={item.disabledReason ?? item.title}
          describes
          tap={off(item)}
          own={{}}
        >
          {(tip) => (
            <button
              {...dataAttributes(item)}
              type="button"
              role={parts.item}
              {...(parts.item === "tab"
                ? { "aria-selected": item.value === value }
                : { "aria-checked": item.value === value })}
              {...(item.controls === undefined ? {} : { "aria-controls": item.controls })}
              tabIndex={item.value === stop ? 0 : -1}
              {...(off(item) ? { "aria-disabled": true } : {})}
              {...(reasoned(item) ? { "data-hc-reason": "" } : {})}
              {...tip}
              onClick={() => {
                if (!off(item)) onChange?.(item.value);
              }}
              className={cx(
                parts.option(item.value === value, off(item)),
                off(item) && "cursor-not-allowed opacity-50",
              )}
            >
              <Label item={item} />
            </button>
          )}
        </Tipped>
      ))}
    </div>
  );
}
