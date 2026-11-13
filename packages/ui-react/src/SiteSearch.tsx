import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { Input } from "./Input.js";
import { Kbd } from "./Kbd.js";
import { ListRow } from "./ListRow.js";
import type { Passthrough } from "./props.js";
import { Text } from "./typography.js";

/** One page the search can find. */
export type SiteSearchItem = {
  /** The page's name: the row's label and the first thing matched. */
  label: string;
  /** A muted line under the label, matched last. */
  description?: string | undefined;
  /** Where the row goes. */
  href: string;
  /** Other names the page answers to (the exports it documents), matched like the label but not shown. */
  keywords?: string[] | undefined;
};

/**
 * The items that match `text`, best first: the label starts with it, then the label contains it,
 * then a keyword contains it, then the description does. Case is ignored, and items of the same
 * rank keep their order in `items`. Empty text matches nothing.
 */
export function rankSiteSearch(items: readonly SiteSearchItem[], text: string): SiteSearchItem[] {
  const query = text.trim().toLowerCase();
  if (query === "") return [];
  const rankOf = (item: SiteSearchItem): number => {
    const label = item.label.toLowerCase();
    if (label.startsWith(query)) return 0;
    if (label.includes(query)) return 1;
    if (item.keywords?.some((keyword) => keyword.toLowerCase().includes(query))) return 2;
    if (item.description?.toLowerCase().includes(query)) return 3;
    return -1;
  };
  return items
    .map((item, index) => ({ item, index, rank: rankOf(item) }))
    .filter((entry) => entry.rank >= 0)
    .toSorted((a, b) => a.rank - b.rank || a.index - b.index)
    .map((entry) => entry.item);
}

/** What the live region says for a result count. */
function countText(query: string, count: number): string {
  if (query.trim() === "") return "";
  if (count === 0) return "No results";
  return count === 1 ? "1 result" : `${count} results`;
}

// The shortcut's key reads ⌘ K on Apple platforms. The server cannot know, so it renders Ctrl K and
// the client swaps after hydration.
const noSubscribe = (): (() => void) => () => {};
const isApple = (): boolean =>
  /mac|iphone|ipad|ipod/i.test(typeof navigator === "undefined" ? "" : navigator.userAgent);

/** Ctrl+K or Cmd+K with no other modifier, the one shortcut that opens the search. */
function isShortcut(event: globalThis.KeyboardEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === "k"
  );
}

// A link that stays on the page (a hash, an app's router) still closes the search; one opened in a
// new tab or window leaves it open.
function onListClick(event: MouseEvent<HTMLUListElement>): void {
  if (event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target instanceof Element && event.target.closest("a[href]")) {
    event.currentTarget.closest("dialog")?.close();
  }
}

/** The result links in the list, in order. */
function linksIn(list: HTMLElement | null): HTMLAnchorElement[] {
  return list ? [...list.querySelectorAll<HTMLAnchorElement>("a[href]")] : [];
}

function SearchBody({ items, label }: { items: readonly SiteSearchItem[]; label: string }) {
  const [query, setQuery] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const results = rankSiteSearch(items, query);
  const typed = query.trim() !== "";

  const onFieldKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      // Close here, so no engine spends the first Esc clearing the search field.
      event.preventDefault();
      event.currentTarget.closest("dialog")?.close();
    } else if (event.key === "Enter") {
      event.preventDefault();
      linksIn(list.current)[0]?.click();
    } else if (event.key === "ArrowDown") {
      const first = linksIn(list.current)[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = linksIn(list.current);
    const at = links.findIndex((link) => link === document.activeElement);
    if (at < 0) return;
    event.preventDefault();
    const next = at + (event.key === "ArrowDown" ? 1 : -1);
    if (next < 0) box.current?.querySelector("input")?.focus();
    else links[Math.min(next, links.length - 1)]?.focus();
  };

  return (
    <div ref={box} className="flex flex-col gap-3">
      <Input
        type="search"
        icon={<Icon name="search" />}
        aria-label={label}
        placeholder="Search"
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onFieldKey}
      />
      <div role="status" aria-live="polite" className="sr-only">
        {countText(query, results.length)}
      </div>
      {!typed && (
        <Text as="p" tone="muted">
          Type a name
        </Text>
      )}
      {typed && results.length === 0 && (
        <Text as="p" tone="muted">
          No results for {query.trim()}
        </Text>
      )}
      {results.length > 0 && (
        // The keys only move focus between the links inside it; the list itself takes none.
        <ul ref={list} aria-label="Results" onKeyDown={onListKey} onClick={onListClick}>
          {results.map((item, index) => (
            <li key={item.href}>
              <ListRow href={item.href} size="sm" divided={index > 0} secondary={item.description}>
                {item.label}
              </ListRow>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The site's search: a header button that opens a dialog with a search field over a list of links
 * to the pages that match. Put it in `AppShell`'s `controls` and pass every page as `items`. Ctrl+K
 * (⌘ K on a Mac) opens it from anywhere on the page, and the button shows that key. Typing filters
 * by name, then by `keywords`, then by description; Enter opens the first result, the arrow keys
 * move through them, and Esc closes it and puts focus back where it was. Render it once per page.
 */
export function SiteSearch({
  items,
  label,
  ...rest
}: {
  /** Every page to search, in the order ties are listed (the rail's order). */
  items: readonly SiteSearchItem[];
  /** The dialog's title and the button's accessible name: "Search components". */
  label: string;
} & Passthrough): ReactElement {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const apple = useSyncExternalStore(noSubscribe, isApple, () => false);
  const keys = apple ? "⌘ K" : "Ctrl K";

  // Before paint, so a client-rendered trigger that is on screen already answers the shortcut.
  useLayoutEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || !isShortcut(event)) return;
      event.preventDefault();
      // Only the press that opens it records the opener; `close` clears it.
      if (!opener.current && document.activeElement instanceof HTMLElement) {
        opener.current = document.activeElement;
      }
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A pointer click does not focus a button in every engine, so the trigger is remembered by hand.
  const openFrom = (event: MouseEvent<HTMLElement>) => {
    opener.current = event.currentTarget;
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    const back = opener.current;
    opener.current = null;
    if (back?.isConnected && back !== document.body) back.focus();
  };

  return (
    <span {...rest} className="inline-flex">
      <span className="hidden sm:inline-flex">
        <Button
          variant="outline"
          size="sm"
          aria-label={label}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          onClick={openFrom}
        >
          <Icon name="search" size="sm" />
          Search
          <Kbd>{keys}</Kbd>
        </Button>
      </span>
      <span className="inline-flex sm:hidden">
        <IconButton
          label={label}
          size="sm"
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          onClick={openFrom}
        >
          <Icon name="search" size="sm" />
        </IconButton>
      </span>
      {open && (
        <Dialog title={label} size="md" onClose={close}>
          <SearchBody items={items} label={label} />
        </Dialog>
      )}
    </span>
  );
}
