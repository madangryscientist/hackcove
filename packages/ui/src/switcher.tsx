import { type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";
import { type DataAttributes, dataAttributes, type LinkRender, renderLink } from "./link.js";

type Option = DataAttributes & {
  label: ReactNode;
  /** A small muted count after the label, part of the accessible name ("Shots 12"). */
  count?: number;
  /** A native tooltip; on a disabled option it is the reason. */
  title?: string;
  // Any `data-*` key (`"data-testid": "tab-shots"`) is put on the option's button or link.
};

/** An option that is a button: it calls `onChange(value)`. */
export type SwitchButton = Option & {
  /** What `value` is set to when this option is current. */
  value: string;
  /**
   * Not chosen by click or arrow key. The button stays in the page as `aria-disabled`, so its
   * `title` still shows on hover and is read out.
   */
  disabled?: boolean;
  /** The id of the element this option controls (a tab's panel). */
  controls?: string;
  href?: undefined;
  render?: undefined;
  external?: undefined;
};

/**
 * An option that is a link: `href`, or `render` to draw the app's own router `<Link>`. The router
 * changes the page; `active` on the item, or a `value` equal to the group's, marks the current one.
 * `external` opens a new tab.
 */
export type SwitchLink = Option & {
  /** Marks this link current when it equals the group's `value`. */
  value?: string;
  /** This link is the current page. */
  active?: boolean;
  disabled?: undefined;
  controls?: undefined;
  external?: boolean;
} & ({ href: string; render?: LinkRender } | { href?: string; render: LinkRender });

/** One option of a Tabs or SegmentedControl: a button or a link, never both in one group. */
export type SwitchItem = SwitchButton | SwitchLink;

type Shared = {
  /** The accessible name of the group. */
  label: string;
} & Passthrough;

export type SwitchProps = Shared &
  (
    | {
        /** The options in order: `{ value, label }` buttons, or links (`href` or `render`) with `value` marking the current one. Either may carry a `count`; a button may be `disabled`. */
        items: SwitchButton[];
        /** The `value` of the current option. */
        value: string;
        /** Called with the option's `value` when one is chosen, by click or arrow key. */
        onChange: (value: string) => void;
        /** Every option is disabled, e.g. until the page has hydrated. */
        disabled?: boolean;
      }
    | {
        /** The options in order: links (`href` or `render`), the current one marked by its `active` or by a `value` equal to the group's. A link may carry a `count`. */
        items: SwitchLink[];
        /** The `value` of the current link, as an alternative to `active` on the item. */
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
  items.some((item) => item.href !== undefined || item.render !== undefined);

const isCurrent = (item: SwitchLink, value: string | undefined): boolean =>
  item.active === true || (item.value !== undefined && item.value === value);

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
    render: item.render,
    external: item.external,
    className: parts.option(current, false),
    "aria-current": current ? "page" : undefined,
    ...(item.title === undefined ? {} : { title: item.title }),
    children: <Label item={item} />,
  });
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

  const off = (item: SwitchButton): boolean => groupDisabled === true || item.disabled === true;
  const enabled = items.filter((item) => !off(item));
  const stop = enabled.some((item) => item.value === value) ? value : enabled[0]?.value;
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const buttons = [...event.currentTarget.querySelectorAll("button:not([aria-disabled=true])")];
    const at = buttons.findIndex((button) => button === event.target);
    if (at < 0) return;
    const to = target(event.key, at, buttons.length, parts.vertical);
    const button = buttons[to];
    if (!(button instanceof HTMLButtonElement)) return;
    event.preventDefault();
    button.focus();
    button.click();
  }

  return (
    <div
      {...rest}
      role={parts.group}
      aria-label={label}
      {...(parts.stacked ? { "aria-orientation": "vertical" as const } : {})}
      {...(groupDisabled ? { "aria-disabled": true } : {})}
      onKeyDown={onKeyDown}
      className={root}
    >
      {items.map((item) => (
        <button
          {...dataAttributes(item)}
          key={item.value}
          type="button"
          role={parts.item}
          {...(parts.item === "tab"
            ? { "aria-selected": item.value === value }
            : { "aria-checked": item.value === value })}
          {...(item.controls === undefined ? {} : { "aria-controls": item.controls })}
          tabIndex={item.value === stop ? 0 : -1}
          {...(off(item) ? { "aria-disabled": true } : {})}
          {...(item.title === undefined ? {} : { title: item.title })}
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
      ))}
    </div>
  );
}
