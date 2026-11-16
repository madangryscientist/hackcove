import { type ReactElement, type ReactNode, useState } from "react";
import { cx, focusRing } from "./cx.js";
import { FoldedColumn } from "./foldedColumn.js";
import { renderLink } from "./link.js";
import { PageHeaderContent } from "./PageHeader.js";
import type { Passthrough } from "./props.js";
import { useScrollEdges } from "./scrollEdges.js";
import { SidebarLayout } from "./SidebarLayout.js";
import { Stack } from "./Stack.js";
import { STICKY_ASIDE_XL, STICKY_FADE_XL, STICKY_SCROLL_XL } from "./stickyColumn.js";
import type { SwitchLink } from "./switcher.js";
import { Tabs } from "./Tabs.js";
import { Overline } from "./typography.js";

/** One group of the docs nav: a title over its links (`Tab`s with an `href`). A group with no title is the nav's top. */
export type DocsNavGroup = { title?: string | undefined; items: SwitchLink[] };

/** One entry of "On this page": a heading's id, its text and its level. */
export type DocsHeading = { id: string; label: string; level: 2 | 3 };

/** The page before or after this one in reading order. */
export type DocsNeighbour = { label: string; href: string };

/** The rail: each group's title over a vertical list of its pages, the groups `md` apart. */
function DocsNav({ nav, navLabel }: { nav: DocsNavGroup[]; navLabel: string }): ReactElement {
  return (
    <Stack gap="md">
      {nav.map((group, index) => (
        <Stack key={group.title ?? `group-${index}`} gap="xs">
          {group.title !== undefined && <Overline>{group.title}</Overline>}
          <Tabs
            orientation="vertical"
            size="sm"
            label={group.title ?? navLabel}
            items={group.items}
          />
        </Stack>
      ))}
    </Stack>
  );
}

const ENTRY = `rounded text-sm/6 transition ${focusRing}`;
const ENTRY_ON = "font-medium text-violet-700";
const ENTRY_OFF = "text-slate-600 hover:text-violet-700";

/**
 * "On this page": one `<nav>` at every width. From `xl` a 12rem column right of the article that
 * sticks under the header and scrolls itself when it is taller than the screen; below `xl` the same
 * element folds behind a closed disclosure named `label`, above the article.
 */
function DocsContents({
  contents,
  current,
  label,
}: {
  contents: DocsHeading[];
  current: string | undefined;
  label: string;
}): ReactElement {
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  useScrollEdges(scroller, "y");
  return (
    <nav
      aria-label={label}
      className={cx("xl:col-start-2 xl:row-span-2 xl:row-start-1", STICKY_ASIDE_XL)}
    >
      <div ref={setScroller} className={cx(STICKY_SCROLL_XL, STICKY_FADE_XL)}>
        <FoldedColumn from="xl" label={label}>
          <div className="hidden pb-2 xl:block">
            <Overline>{label}</Overline>
          </div>
          <ul className="flex flex-col gap-1">
            {contents.map((entry) => (
              <li key={entry.id} className={entry.level === 3 ? "pl-3" : undefined}>
                <a
                  href={`#${entry.id}`}
                  aria-current={entry.id === current ? "location" : undefined}
                  className={cx(ENTRY, entry.id === current ? ENTRY_ON : ENTRY_OFF)}
                >
                  {entry.label}
                </a>
              </li>
            ))}
          </ul>
        </FoldedColumn>
      </div>
    </nav>
  );
}

/**
 * One way onwards: the small `word` line over the page's label, in a bordered box. Its name is the
 * two joined ("Previous: Install"), so a screen reader hears them as one phrase.
 */
function Neighbour({ to, word, end }: { to: DocsNeighbour; word: string; end: boolean }) {
  return renderLink({
    href: to.href,
    "aria-label": `${word}: ${to.label}`,
    className: cx(
      "flex flex-col gap-1 rounded-lg border border-slate-200 px-4 py-3 hover:border-violet-400",
      end && "text-right sm:col-start-2",
      focusRing,
    ),
    children: (
      <>
        <span className="text-sm text-slate-500">{word}</span>
        <span className="font-medium text-slate-900">{to.label}</span>
      </>
    ),
  });
}

/** Previous and next: up to two links, previous at the start and next at the end, two columns from `sm`. */
function DocsPager({
  previous,
  next,
  previousLabel,
  nextLabel,
}: {
  previous: DocsNeighbour | undefined;
  next: DocsNeighbour | undefined;
  previousLabel: string;
  nextLabel: string;
}): ReactElement | null {
  if (!previous && !next) return null;
  return (
    <nav aria-label={`${previousLabel} and ${nextLabel}`} className="grid gap-4 sm:grid-cols-2">
      {previous && <Neighbour to={previous} word={previousLabel} end={false} />}
      {next && <Neighbour to={next} word={nextLabel} end />}
    </nav>
  );
}

type DocsLayoutProps = {
  /** The docs nav, in reading order: each group's title over a vertical pill list of its pages. */
  nav: DocsNavGroup[];
  /** Names the nav's landmark, and the disclosure it folds behind below `md` ("Docs", "All components"). */
  navLabel: string;
  /** The page's title, its `h1`. */
  title: ReactNode;
  /** The line under the title (a `Lead`). */
  description?: ReactNode;
  /** A `Breadcrumbs` above the title. */
  breadcrumbs?: ReactNode;
  /** The page's own headings, in order. With fewer than two there is no "On this page" list. */
  contents?: DocsHeading[] | undefined;
  /** The id of the heading being read: its entry is marked (`aria-current="location"`). A value the page passes, never tracked inside. */
  current?: string | undefined;
  /**
   * The contents list's name and its label.
   * @default On this page
   */
  contentsLabel?: string | undefined;
  /** The page before this one in reading order. */
  previous?: DocsNeighbour | undefined;
  /** The page after this one in reading order. */
  next?: DocsNeighbour | undefined;
  /**
   * The word over the previous page's label.
   * @default Previous
   */
  previousLabel?: string | undefined;
  /**
   * The word over the next page's label.
   * @default Next
   */
  nextLabel?: string | undefined;
  /** The article. Wrap long text in a `Prose`. */
  children: ReactNode;
} & Passthrough;

/**
 * A docs page: a `SidebarLayout` whose rail is the docs `nav` (each group's title over its links,
 * folded behind a disclosure named `navLabel` below `md`), and a canvas of the page's title, an
 * "On this page" list of its `contents`, the article and the previous and next links.
 *
 * The contents list is rendered once: from `xl` a 12rem column right of the article that sticks
 * under the header, below `xl` a closed disclosure above the article. `current` marks the heading
 * being read; it is a value the page passes (a site that follows the reader computes it), with no
 * scroll spy inside. The previous and next links are links, not cards, so they add no heading to
 * the page's outline.
 */
export function DocsLayout({
  nav,
  navLabel,
  title,
  description,
  breadcrumbs,
  contents = [],
  current,
  contentsLabel = "On this page",
  previous,
  next,
  previousLabel = "Previous",
  nextLabel = "Next",
  children,
  ...rest
}: DocsLayoutProps): ReactElement {
  return (
    <SidebarLayout
      {...rest}
      asideLabel={navLabel}
      aside={<DocsNav nav={nav} navLabel={navLabel} />}
    >
      <div className="flex flex-col gap-12 sm:gap-16 xl:grid xl:grid-cols-[minmax(0,1fr)_12rem] xl:gap-x-10">
        <PageHeaderContent
          breadcrumbs={breadcrumbs}
          title={title}
          description={description}
          className="xl:col-start-1"
        />
        {contents.length >= 2 && (
          <DocsContents contents={contents} current={current} label={contentsLabel} />
        )}
        <div className="min-w-0 xl:col-start-1">
          <Stack gap="xl">
            {children}
            <DocsPager
              previous={previous}
              next={next}
              previousLabel={previousLabel}
              nextLabel={nextLabel}
            />
          </Stack>
        </div>
      </div>
    </SidebarLayout>
  );
}
