import type { Meta, StoryObj } from "@storybook/react-vite";
import { Markdown } from "@hackcove/ui";

const meta: Meta = { title: "UI/Markdown" };
export default meta;
type S = StoryObj;

/** `Markdown` renders `##` and `###` headings, `-` bullets, `**bold**` and plain paragraphs, as text nodes and never as HTML. */
export const DoSummary: S = {
  render: () => (
    <Markdown
      md={
        "## What I did\n- **HC-142** shipped the EmptyState\n- Fixed the Pill label wrap\n\n### Next\nReview the Steps copy."
      }
    />
  ),
};

/** A `#` title, a numbered list, a link or a code span is not supported: each shows as literal text. */
export const DontSummary: S = {
  render: () => (
    <Markdown
      md={
        "# What I did\n1. Shipped the EmptyState\n2. Fixed the Pill\n\nSee [the ticket](https://example.com) and `bun install`."
      }
    />
  ),
};
