import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, BodyStrong, Caption, Overline, SectionHeading, Stack } from "@hackcove/ui";

const meta: Meta = { title: "UI/BodyText" };
export default meta;
type S = StoryObj;

/** Body copy is `Body as="p"`, with `BodyStrong` for emphasis inside it and `Caption` for the fine print. */
export const DoParagraph: S = {
  render: () => (
    <Stack gap="xs">
      <Body as="p">
        Invoice <BodyStrong>INV-204</BodyStrong> is due on Friday.
      </Body>
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
      <Body as="p" tone="positive">
        Saved.
      </Body>
      <Body as="p" tone="danger">
        Could not save: the name is taken.
      </Body>
    </Stack>
  ),
};

/** `color` is the hierarchy of text, not its meaning: an error in the accent colour reads as a link, and in muted grey as nothing at all. */
export const DontMeaning: S = {
  render: () => (
    <Stack gap="xs">
      <Body as="p" color="brand">
        Saved.
      </Body>
      <Body as="p" color="muted">
        Could not save: the name is taken.
      </Body>
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
      <Body as="p">Two invoices are due this week.</Body>
    </Stack>
  ),
};
