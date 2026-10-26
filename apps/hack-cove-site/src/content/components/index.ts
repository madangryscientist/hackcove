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
