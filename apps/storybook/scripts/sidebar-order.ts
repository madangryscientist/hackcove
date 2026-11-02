import { OVERVIEW, type Grouping, type Placement, type StoryFile } from "./visual-plan.js";

const overviewFirst = (file: StoryFile) => (file.title === "Overview" ? 0 : 1);

/**
 * The title a story file has in Storybook: `<Section>/<Page name>`, the section and page of the
 * site's docs that name it first. Storybook's sidebar and the site's rail read the same words.
 */
export const titleOf = ({ section, page }: Placement) => `${section.title}/${page.name}`;

/**
 * The story files in sidebar order: Overview first, then the site's rail order (section, page,
 * file); a file no page names comes last, where a test fails on it. Storybook sorts by this order
 * when `preview.tsx` sets no `storySort`.
 */
export function sidebarOrder({ placements, groups, unsectioned }: Grouping): string[] {
  const overview = groups.find((group) => group.slug === OVERVIEW)?.files ?? [];
  const head = overview.toSorted(
    (a, b) => overviewFirst(a) - overviewFirst(b) || a.path.localeCompare(b.path),
  );
  const placed = placements.map((placement) => placement.file);
  return [...head, ...placed, ...unsectioned].map((file) => file.path);
}
