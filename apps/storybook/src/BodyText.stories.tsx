import type { Meta, StoryObj } from "@storybook/react-vite";
import { Caption, Overline, SectionHeading, Stack, Text } from "@hackcove/ui-react";

const meta: Meta = { title: "Text/Body text" };
export default meta;
type S = StoryObj;

/** Body copy is `Text as="p"`, with `Text strong` for emphasis inside it and `Caption` for the fine print. */
export const DoParagraph: S = {
  render: () => (
    <Stack gap="xs">
      <Text as="p">
        Invoice <Text strong>INV-204</Text> is due on Friday.
      </Text>
      <Caption as="p">Sent 2 minutes ago</Caption>
    </Stack>
  ),
};

/** Plain HTML text elements carry no size, weight or colour of the theme. Every run of text is a typography part. */
export const DontParagraph: S = {
  render: () => (
    <Stack gap="xs">
      <p>
        Invoice <strong>INV-204</strong> is due on Friday.
      </p>
      <small>Sent 2 minutes ago</small>
    </Stack>
  ),
};

/** `tone` says what a run of text means: `positive` for "Saved.", `danger` for an error. */
export const DoMeaning: S = {
  render: () => (
    <Stack gap="xs">
      <Text as="p" tone="positive">
        Saved.
      </Text>
      <Text as="p" tone="danger">
        Could not save: the name is taken.
      </Text>
    </Stack>
  ),
};

/** `color` is the hierarchy of text, not its meaning: an error in the accent colour reads as a link, and in muted grey as nothing at all. */
export const DontMeaning: S = {
  render: () => (
    <Stack gap="xs">
      <Text as="p" color="brand">
        Saved.
      </Text>
      <Text as="p" color="muted">
        Could not save: the name is taken.
      </Text>
    </Stack>
  ),
};

/** An `Overline` is the small label above a heading, naming the group it belongs to. */
export const DoLabels: S = {
  render: () => (
    <Stack gap="xs">
      <Overline>Billing</Overline>
      <SectionHeading>Invoices</SectionHeading>
    </Stack>
  ),
};

/** An `Overline` is a `span`, not a heading: a section titled by one has no place in the page outline. Use `SectionHeading`. */
export const DontLabels: S = {
  render: () => (
    <Stack gap="xs">
      <Overline>Invoices</Overline>
      <Text as="p">Two invoices are due this week.</Text>
    </Stack>
  ),
};

// The options a body run takes: italic, a long string, alignment and a fixed amount width.

export const TextItalicStory: S = {
  name: "italic",
  render: () => (
    <div className="flex max-w-xl flex-col gap-2">
      <Text as="p" italic color="muted">
        A muted hint, set italic under the field it explains.
      </Text>
      <Caption as="p" italic>
        Italic fine print: last synced 2 minutes ago.
      </Caption>
    </div>
  ),
};

export const BreakWordsStory: S = {
  name: "breakWords",
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Text as="p">Without breakWords, a long unbroken string overflows its box:</Text>
      <Text as="p" color="muted">
        https://example.com/lookup/trail/0f3a9c1d7b2e4f60a8c5d9e1b3f7a2c4d6e8f0a1b2c3d4e5f6
      </Text>
      <Text as="p">With breakWords it breaks at the edge of the box:</Text>
      <Text as="p" breakWords color="muted">
        https://example.com/lookup/trail/0f3a9c1d7b2e4f60a8c5d9e1b3f7a2c4d6e8f0a1b2c3d4e5f6
      </Text>
      <Caption as="p" breakWords>
        Caption: 0f3a9c1d7b2e4f60a8c5d9e1b3f7a2c4d6e8f0a1b2c3d4e5f6
      </Caption>
    </div>
  ),
};

export const AlignStory: S = {
  name: "align",
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      {(["start", "center", "end"] as const).map((a) => (
        <div key={a} className="flex flex-col gap-1 rounded-md border border-slate-200/70 p-3">
          <Overline align={a}>align={a}</Overline>
          <Text as="p" align={a}>
            Text aligned {a} in its block.
          </Text>
        </div>
      ))}
    </div>
  ),
};

export const MinWidthStory: S = {
  name: "minWidth amount",
  render: () => (
    <div className="flex w-72 flex-col gap-1">
      <div className="flex justify-between">
        <Overline>Funded</Overline>
        <Overline>Amount</Overline>
      </div>
      {["1,111.11", "8,888.88", "120.00"].map((v) => (
        <div key={v} className="flex items-baseline justify-between gap-3">
          <Text>Pot</Text>
          <Text strong minWidth="amount">
            {v}
          </Text>
        </div>
      ))}
      <Caption as="p">The amounts share one fixed width, so the figures line up.</Caption>
    </div>
  ),
};
