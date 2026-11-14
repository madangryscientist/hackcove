/**
 * A small repo for the visual plan's tests: seven story files, three sections, three
 * themes (the first, `theme-a`, is the reference). */
import {
  GALLERY_TITLE,
  groupStories,
  type Repo,
  type Section,
  type StoryFile,
} from "./visual-plan.js";

const story = (stem: string, title: string, dir = "apps/storybook/src"): StoryFile => ({
  path: `${dir}/${stem}.stories.tsx`,
  stem,
  title,
});

export const storyFiles = [
  story("Button", "Actions/Button"),
  story("Card", "Content/Card"),
  story("CardBadge", "Content/Card"),
  story("Stack", "Layout/Stack", "apps/storybook/src/layout"),
  story("overview", "Overview"),
  story("palette", "Overview/Palette"),
  story("GallerySections", GALLERY_TITLE),
];

const files: Record<string, string> = {
  "packages/ui-react/src/index.ts": [
    'export { Button, type ButtonProps } from "./Button.js";',
    'export {\n  Card,\n  type CardProps,\n} from "./Card.js";',
    'export { Stack } from "./Stack.js";',
  ].join("\n"),
  "packages/ui-react/src/Button.tsx": 'import { focusRing } from "./focus.js";',
  "packages/ui-react/src/focus.ts": "export const focusRing = '';",
  "packages/ui-react/src/Card.tsx": 'import type { ButtonProps } from "./Button.js";',
  "packages/ui-react/src/Stack.tsx": "",
  "apps/storybook/src/Button.stories.tsx": 'import { Button } from "@hackcove/ui-react";',
  "apps/storybook/src/Card.stories.tsx":
    'import { Card, type CardProps } from "@hackcove/ui-react";\nimport { sample } from "./sample";',
  "apps/storybook/src/CardBadge.stories.tsx": 'import { Card } from "@hackcove/ui-react";',
  "apps/storybook/src/sample.ts": "export const sample = 1;",
  "apps/storybook/src/layout/Stack.stories.tsx": 'import { Stack } from "@hackcove/ui-react";',
  "apps/storybook/src/overview.stories.tsx": 'import { Gallery } from "./Gallery";',
  "apps/storybook/src/Gallery.tsx": 'import * as ui from "@hackcove/ui-react";',
  "apps/storybook/src/GallerySections.stories.tsx": 'import { GallerySlice } from "./Gallery";',
  "apps/storybook/src/palette.stories.tsx": "",
  "apps/storybook/.storybook/preview.tsx": 'import { ThemeDocument } from "./themes";',
  "apps/storybook/.storybook/themes.tsx": 'import { useTheme } from "../src/useTheme";',
  "apps/storybook/src/useTheme.ts": "",
};

const sections: Section[] = [
  {
    title: "Layout",
    pages: [{ slug: "stack", name: "Stack", pairs: [], stories: ["Stack"] }],
  },
  {
    title: "Content",
    pages: [{ slug: "card", name: "Card", pairs: ["Card/Title"], stories: ["CardBadge"] }],
  },
  {
    title: "Actions",
    pages: [
      { slug: "button", name: "Button", pairs: ["Button/Variants", "Button/Sizes"] },
      { slug: "card-action", name: "Card action", pairs: ["Card/Action"] },
    ],
  },
];

export const repo: Repo = {
  read: (path) => files[path],
  storyFiles,
  sections,
  themes: ["theme-a", "theme-b", "theme-c"],
};

export const grouping = groupStories(sections, storyFiles);
