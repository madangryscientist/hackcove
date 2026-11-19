import { actions } from "./actions";
import { content } from "./content";
import { data } from "./data";
import { feedback } from "./feedback";
import { forms } from "./forms";
import { layout } from "./layout";
import { navigation } from "./navigation";
import { pagelayouts } from "./pagelayouts";
import { pages } from "./pages";
import { text } from "./text";
import type { ComponentPage, ComponentSection } from "./types";

export type { ComponentPage } from "./types";

/** The groups, in the order the rail shows them. A page is in exactly one. */
export const componentSections: ComponentSection[] = [
  layout,
  pagelayouts,
  text,
  content,
  actions,
  forms,
  data,
  feedback,
  navigation,
  pages,
];

export const componentPages: ComponentPage[] = componentSections.flatMap((s) => s.pages);

export function componentPageOf(slug: string): ComponentPage {
  const page = componentPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`No component page "${slug}" in componentPages`);
  return page;
}

/** The section a page is in. */
export function sectionOfPage(slug: string): ComponentSection {
  const section = componentSections.find((s) => s.pages.some((p) => p.slug === slug));
  if (!section) throw new Error(`No section holds the component page "${slug}"`);
  return section;
}

/**
 * The component pages either side of `slug` in the rail's order, for the page's previous and next
 * links. The first component page has no previous and the last no next; Getting started (`/ui/`) is
 * not part of the walk.
 */
export function neighboursOf(slug: string): { previous?: ComponentPage; next?: ComponentPage } {
  const at = componentPages.findIndex((p) => p.slug === slug);
  if (at === -1) throw new Error(`No component page "${slug}" in componentPages`);
  const previous = componentPages[at - 1];
  const next = componentPages[at + 1];
  return { ...(previous && { previous }), ...(next && { next }) };
}
