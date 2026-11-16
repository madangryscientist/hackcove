import { type ReactElement, type Ref, useCallback, useState } from "react";
import {
  Button as AriaButton,
  Menu as AriaMenu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { buttonClass } from "./Button.js";
import { cx } from "./cx.js";
import { Icon } from "./Icon.js";
import { look, type IconButtonTone } from "./IconButton.js";
import type { IconName } from "./icons.js";
import { renderLink } from "./link.js";
import { Tipped } from "./Tooltip.js";
import { definedProps, type Passthrough } from "./props.js";
import type { Size } from "./size.js";

/** One entry of a `Menu`: an action that runs `onSelect`, or a link to `href`. Never both. */
export type MenuAction = {
  /** The item's text and its accessible name. */
  label: string;
  /** A leading glyph from the `Icon` set, decorative. */
  icon?: IconName | undefined;
  /**
   * `danger` is red text, for delete, hide and leave. Put it last.
   * @default neutral
   */
  tone?: IconButtonTone | undefined;
  /** Shown dimmed; the arrows skip it and a press does nothing. */
  disabled?: boolean | undefined;
} & (
  | {
      /** Runs when the item is chosen; the menu then closes and focus goes back to the trigger. */
      onSelect: () => void;
      href?: undefined;
      external?: undefined;
    }
  | {
      onSelect?: undefined;
      /** Makes the item a link; an in-app path goes through the app's `LinkProvider`. */
      href: string;
      /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
      external?: boolean | undefined;
    }
);

type MenuProps = Passthrough & {
  /** The trigger's accessible name and the menu's. With `trigger="button"` it is the visible text. */
  label: string;
  /** The actions, in order. */
  items: readonly [MenuAction, ...MenuAction[]];
  /**
   * `icon` is a ghost square button holding three dots, the overflow menu; `button` is an outline
   * `Button` with `label` as its text and a chevron after it, for a menu whose name is worth a word.
   * @default icon
   */
  trigger?: "icon" | "button" | undefined;
  /**
   * The trigger's height, the same steps as `IconButton` and `Button`: `sm` inside a row or a card
   * header. The menu's own text does not change with it.
   * @default md
   */
  size?: Size | undefined;
  /** Opens on mount, for a story or a test that shows the open menu. */
  defaultOpen?: boolean | undefined;
};

const FRAME =
  "min-w-44 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-1 text-slate-900 shadow-lg outline-none";

const ITEM =
  "flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 text-sm outline-none select-none data-disabled:cursor-not-allowed data-disabled:opacity-50";

const ITEM_TONE: Record<IconButtonTone, { ink: string; focused: string }> = {
  neutral: { ink: "text-slate-900", focused: "bg-slate-100" },
  danger: { ink: "text-red-700", focused: "bg-red-50" },
};

/** The modal `<dialog>` the trigger sits in, if any, so the menu renders inside it and is not inert. */
function useDialogOf(): { container: Element | undefined; find: Ref<HTMLButtonElement> } {
  const [container, setContainer] = useState<Element | undefined>(undefined);
  // React Aria merges this ref with its own into a new function on every render, so React detaches
  // and reattaches it each time: a detach (`null`) must not clear the container, or the open menu
  // would move to <body> and lose its focus.
  const find = useCallback((el: HTMLButtonElement | null) => {
    if (el) setContainer(el.closest("dialog") ?? undefined);
  }, []);
  return { container, find };
}

/** What the trigger shows: three dots, or the label and a chevron. */
function Face({ icon, label, size }: { icon: boolean; label: string; size: Size }): ReactElement {
  if (icon) return <Icon name="more" size={size} />;
  return (
    <>
      {label}
      <Icon name="chevron-down" size={size} />
    </>
  );
}

/**
 * A button that opens a short list of actions: the overflow menu at the end of a row, a card header
 * or a page header. Keep the one main action in view beside it and put the rest here, the `danger`
 * one last. `items` are data: each a `label` with `onSelect`, or a link with `href` (`external` for
 * a new tab), an optional leading `icon`, `tone="danger"` and `disabled`.
 *
 * `trigger="icon"` (the default) is a ghost three-dot button named by `label`; `trigger="button"` is
 * an outline button reading `label`. The menu opens below the trigger, aligned to its end, and flips
 * when there is no room. The keyboard is the menu button pattern: Enter, Space or ArrowDown open it
 * on the first item, ArrowUp on the last; the arrows, Home, End and a letter move; Enter chooses;
 * Escape closes, and focus goes back to the trigger. `data-*` and `aria-*` land on the trigger.
 */
export function Menu({
  label,
  items,
  trigger = "icon",
  size = "md",
  defaultOpen = false,
  ...rest
}: MenuProps): ReactElement {
  const { container, find } = useDialogOf();
  const icon = trigger === "icon";
  // A pointer opens the menu on its first item, as the keyboard's Enter does (the menu button
  // pattern); left to itself, React Aria focuses the menu box. ArrowUp still opens on the last.
  const [pointer, setPointer] = useState(false);
  const button = (
    <AriaButton
      {...definedProps(rest)}
      ref={find}
      onPressStart={(event) => setPointer(event.pointerType !== "keyboard")}
      // ArrowDown and ArrowUp open it with no press: they keep React Aria's first and last item.
      onKeyDown={(event) => {
        setPointer(false);
        event.continuePropagation();
      }}
      {...(icon ? { "aria-label": label } : {})}
      className={icon ? look({ variant: "ghost", size }) : buttonClass("outline", { size })}
    >
      <Face icon={icon} label={label} size={size} />
    </AriaButton>
  );
  // The three-dot trigger shows its name as the library's tooltip, as an `IconButton` does. React
  // Aria's button takes no pointer handlers, so they sit on a wrapper; focus and keys bubble to it.
  return (
    <MenuTrigger defaultOpen={defaultOpen}>
      {icon ? (
        <Tipped<HTMLSpanElement> text={label} describes={false} own={{}}>
          {(tip) => (
            <span className="inline-flex" {...tip}>
              {button}
            </span>
          )}
        </Tipped>
      ) : (
        button
      )}
      <Popover
        {...(container ? { UNSTABLE_portalContainer: container } : {})}
        placement="bottom end"
        className={FRAME}
      >
        <AriaMenu className="outline-none" {...(pointer ? { autoFocus: "first" as const } : {})}>
          {items.map((item, index) => (
            <Item key={`${index}:${item.label}`} item={item} />
          ))}
        </AriaMenu>
      </Popover>
    </MenuTrigger>
  );
}

function Item({ item }: { item: MenuAction }): ReactElement {
  const tone = ITEM_TONE[item.tone ?? "neutral"];
  const className = ({ isFocused }: { isFocused: boolean }) =>
    cx(ITEM, tone.ink, isFocused && tone.focused);
  const inside = (
    <>
      {item.icon ? <Icon name={item.icon} size="md" /> : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </>
  );
  if (item.href !== undefined) {
    const { href, external = false } = item;
    return (
      <MenuItem
        textValue={item.label}
        href={href}
        isDisabled={item.disabled ?? false}
        className={className}
        render={(props) => {
          // An item with `href` is drawn as an anchor; the `div` form is React Aria's fallback.
          if (!("href" in props)) return <div {...props} />;
          // React Aria hands the anchor its role, tab index, handlers and ref; the app's router
          // link draws it when `href` is an in-app path.
          const { href: _href, className: drawn, children: _children, ...aria } = props;
          return renderLink({
            ...aria,
            href,
            external,
            className: drawn ?? cx(ITEM, tone.ink),
            children: inside,
          });
        }}
      >
        {inside}
      </MenuItem>
    );
  }
  return (
    <MenuItem
      textValue={item.label}
      onAction={item.onSelect}
      isDisabled={item.disabled ?? false}
      className={className}
    >
      {inside}
    </MenuItem>
  );
}
