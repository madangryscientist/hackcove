import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock, Stack, ToolCallCard } from "@hackcove/ui-react";

const meta: Meta = {
  title: "Content/ToolCallCard",
  parameters: { layout: "padded" },
  // A chat takes the width it is given, so a story gives it a realistic one.
  decorators: [
    (Story) => (
      <Stack width="narrow">
        <Story />
      </Stack>
    ),
  ],
};
export default meta;
type S = StoryObj;

const args = <CodeBlock language="json">{'{ "query": "leek soup" }'}</CodeBlock>;

/** The status is a word on the line: Running, Done or Failed. */
export const Statuses: S = {
  render: () => (
    <Stack gap="sm">
      <ToolCallCard name="read_pantry" status="running" summary="Checking the cupboard">
        {args}
      </ToolCallCard>
      <ToolCallCard name="search_recipes" status="done" summary="Found 3 soups under an hour">
        {args}
      </ToolCallCard>
      <ToolCallCard name="add_to_list" status="error" summary="The list is read-only">
        {args}
      </ToolCallCard>
    </Stack>
  ),
};

/** `summary` is optional, and a long one is cut off on its one line. */
export const Summaries: S = {
  render: () => (
    <Stack gap="sm">
      <ToolCallCard name="read_pantry" status="done">
        {args}
      </ToolCallCard>
      <ToolCallCard
        name="search_recipes"
        status="done"
        summary="Found 3 soups under an hour, and 2 more that take longer but freeze well, and one that needs a smoker"
      >
        {args}
      </ToolCallCard>
    </Stack>
  ),
};

/** Opened: the arguments and the result, here in a `CodeBlock`. */
export const Open: S = {
  play: ({ canvasElement }) => {
    canvasElement.querySelector("button")?.click();
  },
  render: () => (
    <ToolCallCard name="search_recipes" status="done" summary="Found 3 soups under an hour">
      <CodeBlock language="json">{'{ "query": "leek soup", "results": 3 }'}</CodeBlock>
    </ToolCallCard>
  ),
};

/** The line says what happened in a few words; the raw arguments and result wait behind it. */
export const DoDetail: S = {
  render: () => (
    <ToolCallCard name="search_recipes" status="done" summary="Found 3 soups under an hour">
      <CodeBlock language="json">{'{ "query": "leek soup" }'}</CodeBlock>
    </ToolCallCard>
  ),
};

/** Raw JSON on the line is cut off before it says anything. */
export const DontDetail: S = {
  render: () => (
    <ToolCallCard
      name="search_recipes"
      status="done"
      summary={'{ "query": "leek soup", "max_minutes": 60, "results": [{ "id": 1 }, { "id": 2 }] }'}
    >
      <CodeBlock language="json">{'{ "query": "leek soup" }'}</CodeBlock>
    </ToolCallCard>
  ),
};
