import { Fragment, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { cx } from "./cx.js";
import { type LinkRender, renderLink } from "./link.js";

type Option = {
  /** What `value` is set to when this option is current. */
  value: string;
  label: ReactNode;
};

/** An option that is a button: it calls `onChange(value)`. */
export type SwitchButton = Option & {
  disabled?: boolean;
  /** The id of the element this option controls (a tab's panel). */
  controls?: string;
  href?: undefined;
  render?: undefined;
  external?: undefined;
};

/**
 * An option that is a link: `href`, or `render` to draw the app's own router `<Link>`. The router
 * changes the page; `value` only marks which one is current. `external` opens a new tab.
 */
export type SwitchLink = Option & {
  disabled?: undefined;
  controls?: undefined;
  external?: boolean;
} & ({ href: string; render?: LinkRender } | { href?: string; render: LinkRender });

/** One option of a Tabs or SegmentedControl: a button or a link, never both in one group. */
export type SwitchItem = SwitchButton | SwitchLink;

type Shared = {
  /** The `value` of the current option. */
  value: string;
  /** The accessible name of the group. */
  label: string;
  className?: string;
};

export type SwitchProps = Shared &
  (
    | {
        items: SwitchButton[];
        /** Called with the option's `value` when one is chosen, by click or arrow key. */
        onChange: (value: string) => void;
      }
    | { items: SwitchLink[]; onChange?: undefined }
  );

type Parts = {
  /** The roles of a group of buttons; a group with links is a `<nav>` instead. */
  group: "tablist" | "radiogroup";
  item: "tab" | "radio";
  /** The vertical arrows move too, as in a radio group. */
  vertical: boolean;
  root: string;
  option: (active: boolean) => string;
};

/** The index a key moves to from `at` among `count` enabled options, wrapping; -1 for a key that does not move. */
function target(key: string, at: number, count: number, vertical: boolean): number {
  if (key === "ArrowRight" || (vertical && key === "ArrowDown")) return (at + 1) % count;
  if (key === "ArrowLeft" || (vertical && key === "ArrowUp")) return (at - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return -1;
}

const isLinks = (items: SwitchProps["items"]): items is SwitchLink[] =>
  items.some((item) => item.href !== undefined || item.render !== undefined);

/**
 * The shared body of Tabs and SegmentedControl: a row of options with one current. Buttons form a
 * `tablist` or `radiogroup` with a single tab stop and arrow-key movement (the arrow focuses and
 * chooses); links form a `<nav>` with `aria-current="page"` on the current one.
 */
export function Switcher({
  items,
  value,
  onChange,
  label,
  className,
  parts,
}: SwitchProps & { parts: Parts }): ReactElement {
  const root = cx(parts.root, className);
  if (isLinks(items)) {
    return (
      <nav aria-label={label} className={root}>
        {items.map((item) => (
          <Fragment key={item.value}>
            {renderLink({
              href: item.href,
              render: item.render,
              external: item.external,
              className: parts.option(item.value === value),
              "aria-current": item.value === value ? "page" : undefined,
              children: item.label,
            })}
          </Fragment>
        ))}
      </nav>
    );
  }

  const enabled = items.filter((item) => !item.disabled);
  const stop = enabled.some((item) => item.value === value) ? value : enabled[0]?.value;
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const buttons = [...event.currentTarget.querySelectorAll("button:not(:disabled)")];
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
    <div role={parts.group} aria-label={label} onKeyDown={onKeyDown} className={root}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role={parts.item}
          {...(parts.item === "tab"
            ? { "aria-selected": item.value === value }
            : { "aria-checked": item.value === value })}
          {...(item.controls === undefined ? {} : { "aria-controls": item.controls })}
          tabIndex={item.value === stop ? 0 : -1}
          disabled={item.disabled === true}
          onClick={() => onChange?.(item.value)}
          className={cx(parts.option(item.value === value), "disabled:opacity-50")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
