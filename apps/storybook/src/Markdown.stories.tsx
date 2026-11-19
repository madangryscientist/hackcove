import type { Meta, StoryObj } from "@storybook/react-vite";
import { Markdown } from "@slashsuite/ui-react";

const meta: Meta = { title: "Text/Markdown" };
export default meta;
type S = StoryObj;

/** `Markdown` renders `##` and `###` headings, `-` bullets, `**bold**` and plain paragraphs, as text nodes and never as HTML. */
export const DoSummary: S = {
  render: () => (
    <Markdown
      md={
        "## What I did\n- **HC-142** shipped the EmptyState\n- Fixed the Pill label wrap\n\n" +
        "### Next\nReview the Steps copy."
      }
    />
  ),
};

/** A `#` title, a numbered list, a link or a code span is not supported: each shows as literal text. */
export const DontSummary: S = {
  render: () => (
    <Markdown
      md={
        "# What I did\n1. Shipped the EmptyState\n2. Fixed the Pill\n\n" +
        "See [the ticket](https://example.com) and `bun install`."
      }
    />
  ),
};

type Loading = StoryObj<{ loading: boolean }>;

/** A note with no source yet is a paragraph of bones. */
export const Loading: Loading = {
  args: { loading: true },
  render: ({ loading }) => (
    <div className="max-w-md">
      <Markdown loading={loading} md={loading ? undefined : "## Notes\n- **HC-42** shipped"} />
    </div>
  ),
};
