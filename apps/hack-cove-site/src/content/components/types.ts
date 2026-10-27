/* ---------------------------------------------------------------------------
   The component docs, as data: the words on /ui/<slug>/ and in /ui/llms.txt.
   ---------------------------------------------------------------------------
   Both read these files, so they cannot drift. The code and the Do/Don't examples are never
   written here: `pairs` name stories in apps/storybook/src, and the props are
   read from packages/ui. A page says one right way and what not to do; it has no recipe for
   extending a component and no styling escape hatch.
   --------------------------------------------------------------------------- */

export type ComponentPage = {
  /** The page's path segment: /ui/<slug>/. */
  slug: string;
  name: string;
  /** Under the page title. */
  summary: string;
  /** One sentence for llms.txt and the page: when this component is the right one. */
  whenToUse: string;
  /** Do/Don't pairs, `<File>/<Topic>`: the stories `Do<Topic>` and `Dont<Topic>`. The first is the one right way. */
  pairs: string[];
  /** A page layout's whole page, in its shell: the story `<File>/<Topic>`, shown under Overview. */
  fullPage?: string;
  usage: string[];
  accessibility: string[];
  /** The components whose props the API table lists. */
  api: string[];
  /**
   * Exports that are functions, not components (`buttonClass`, `schemeClass`), each with a line on
   * what it is for. A page lists a component under `api` or a function here; every export of
   * `@hackcove/ui` is on exactly one page.
   */
  functions?: { name: string; text: string }[];
};

/** A group in the rail and on the Getting started page. */
export type ComponentSection = {
  title: string;
  /** One line under the group's title on Getting started. */
  description: string;
  pages: ComponentPage[];
};
