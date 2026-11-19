/* ---------------------------------------------------------------------------
   The component docs, as data: the words on /ui/<slug>/ and in /ui/llms.txt.
   ---------------------------------------------------------------------------
   Both read these files, so they cannot drift. The code and the Do/Don't examples are never
   written here: `pairs` name stories in apps/storybook/src, and the props are
   read from packages/ui-react. A page says one right way and what not to do; it has no recipe for
   extending a component and no styling escape hatch.
   --------------------------------------------------------------------------- */

import type { IconName } from "../../src/icons";

export type ComponentPage = {
  /** The page's path segment: /ui/<slug>/. */
  slug: string;
  name: string;
  /** Under the page title. */
  summary: string;
  /** One sentence for llms.txt and the page: when this component is the right one. */
  whenToUse: string;
  /**
   * The pages a reader weighs this one against, each with when to use it instead. Shown at the top
   * of Overview as the "Use instead" table and in llms.txt. The relation is symmetric: if A lists B,
   * B lists A, each saying it from its own side.
   */
  siblings?: { slug: string; when: string }[];
  /** Do/Don't pairs, `<File>/<Topic>`: the stories `Do<Topic>` and `Dont<Topic>`. The first is the one right way. */
  pairs: string[];
  /** A page layout's whole page, in its shell: the story `<File>/<Topic>`, shown under Overview. */
  fullPage?: string;
  /**
   * Story files (`<File>`, as in `pairs`) this page covers but does not show. The visual check
   * captures every story file with the section of a page that names it, and fails on one that no
   * page names.
   */
  stories?: string[];
  /**
   * The usage rules, printed under the Usage heading and in llms.txt. `do` says the one right way;
   * `dont` says what not to do, each bullet opening with "Never" or "Do not". A pair's Dont story is
   * not one of these: that is `pairs`.
   */
  usage: { do: string[]; dont?: string[] };
  accessibility: string[];
  /** The components whose props the API table lists. */
  api: string[];
  /** The types it exports that its components take (`Crumb`, `Tone`), each on one page, printed after the props. */
  types?: string[];
  /**
   * Exports that are functions, not components (`fromISODate`, `schemeClass`), each with a line on
   * what it is for. A page lists a component under `api`, a function here or a type under `types`;
   * every export of `@hackcove/ui-react`, value or type, is on exactly one page.
   */
  functions?: {
    name: string;
    text: string;
    /** A few lines of TSX that show it in use, under its line and fenced in llms.txt. */
    example?: string;
  }[];
};

/** A group in the rail and on the Getting started page. */
export type ComponentSection = {
  title: string;
  /** The card's icon on Getting started: the idea of the group. */
  icon: IconName;
  /** One line under the group's title on Getting started. */
  description: string;
  pages: ComponentPage[];
};
