import type { IconName } from "@hackcove/ui-react";

/** What each icon in the set stands for. Typed over every `IconName`, so a new icon cannot ship without a line here. */
export const iconIdeas: Record<IconName, string> = {
  diff: "What changed between two versions",
  baseline: "The approved picture to compare against",
  review: "Looking a change over",
  ci: "A pipeline that runs and passes",
  "self-host": "Running it on your own machine",
  privacy: "Kept to yourself",
  capture: "Taking a screenshot",
  branch: "A line of work off the trunk",
  theme: "The look of a site",
  speed: "Fast",
  search: "Finding something in a list",
};

const NAMES = [
  "diff",
  "baseline",
  "review",
  "ci",
  "self-host",
  "privacy",
  "capture",
  "branch",
  "theme",
  "speed",
  "search",
] as const;

/** `true` only while `NAMES` lists every `IconName`: a missing one makes this line a type error. */
export const iconSetIsListed: [Exclude<IconName, (typeof NAMES)[number]>] extends [never]
  ? true
  : never = true;

/** Every icon name, in the set's order. */
export const iconNames: readonly IconName[] = NAMES;
