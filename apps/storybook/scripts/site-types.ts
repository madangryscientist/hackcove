import type { StoryFile } from "./visual-plan.js";

/** The part of a site section this reads. */
export type Section = {
  title: string;
  pages: Page[];
};

export type Page = {
  slug: string;
  name: string;
  pairs: string[];
  fullPage?: string;
  stories?: string[];
};

/** A story file in its place on the site: the section and the page that name it first. */
export type Placement = { file: StoryFile; section: Section; page: Page };
