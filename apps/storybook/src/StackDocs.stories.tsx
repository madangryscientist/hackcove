import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Button, Card, Cluster, Section, SectionHeading, Stack } from "@hackcove/ui";

/** The docs examples for `Stack` and `Section`. */
const meta: Meta = { title: "Docs/Stack" };
export default meta;
type S = StoryObj;

/** Blocks that follow each other go in a `Stack`: the gap is one step of the scale, `md` by default. */
export const DoGap: S = {
  render: () => (
    <Stack>
      <Card title="Build 412">
        <Body>3 changed</Body>
      </Card>
      <Card title="Build 411">
        <Body>No changes</Body>
      </Card>
    </Stack>
  ),
};

/** Blocks in a bare `div` touch each other. Space is the Stack's job, never left to the blocks. */
export const DontGap: S = {
  render: () => (
    <div>
      <Card title="Build 412">
        <Body>3 changed</Body>
      </Card>
      <Card title="Build 411">
        <Body>No changes</Body>
      </Card>
    </div>
  ),
};

/** A titled group is a `Section`: the title, the actions beside it and the blocks under it, as one named region. */
export const DoSectionTitle: S = {
  render: () => (
    <Section title="Recent builds" actions={<Button variant="outline">All builds</Button>}>
      <Card>
        <Body>Build 412 · 3 changed</Body>
      </Card>
      <Card>
        <Body>Build 411 · no changes</Body>
      </Card>
    </Section>
  ),
};

/** A heading row built by hand is not tied to its group: nothing names the region and the row's spacing is a guess. Use `Section`. */
export const DontSectionTitle: S = {
  render: () => (
    <Stack gap="sm">
      <Cluster justify="between">
        <SectionHeading>Recent builds</SectionHeading>
        <Button variant="outline">All builds</Button>
      </Cluster>
      <Card>
        <Body>Build 412 · 3 changed</Body>
      </Card>
      <Card>
        <Body>Build 411 · no changes</Body>
      </Card>
    </Stack>
  ),
};

/** A list of things is `Stack as="ul"` with an `li` per item: the spacing of a Stack and a list that assistive tech announces. */
export const DoList: S = {
  render: () => (
    <Stack as="ul" gap="sm" aria-label="Builds">
      <li>
        <Card>
          <Body>Build 412 · 3 changed</Body>
        </Card>
      </li>
      <li>
        <Card>
          <Body>Build 411 · no changes</Body>
        </Card>
      </li>
    </Stack>
  ),
};

/** The same cards in a plain Stack are two unrelated blocks: no list, no count, nothing to jump by. */
export const DontList: S = {
  render: () => (
    <Stack gap="sm">
      <Card>
        <Body>Build 412 · 3 changed</Body>
      </Card>
      <Card>
        <Body>Build 411 · no changes</Body>
      </Card>
    </Stack>
  ),
};
