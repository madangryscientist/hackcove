import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, Cluster, Section, SectionHeading, Stack, Text } from "@hackcove/ui";

/** The docs examples for `Stack` and `Section`. */
const meta: Meta = { title: "Docs/Stack" };
export default meta;
type S = StoryObj;

/** Blocks that follow each other go in a `Stack`: the gap is one step of the scale, `md` by default. */
export const DoGap: S = {
  render: () => (
    <Stack>
      <Card title="Build 412">
        <Text>3 changed</Text>
      </Card>
      <Card title="Build 411">
        <Text>No changes</Text>
      </Card>
    </Stack>
  ),
};

/** Blocks in a bare `div` touch each other. Space is the Stack's job, never left to the blocks. */
export const DontGap: S = {
  render: () => (
    <div>
      <Card title="Build 412">
        <Text>3 changed</Text>
      </Card>
      <Card title="Build 411">
        <Text>No changes</Text>
      </Card>
    </div>
  ),
};

/** A titled group is a `Section`: the title, the actions beside it and the blocks under it, as one named region. */
export const DoSectionTitle: S = {
  render: () => (
    <Section title="Recent builds" actions={<Button variant="outline">All builds</Button>}>
      <Card>
        <Text>Build 412 · 3 changed</Text>
      </Card>
      <Card>
        <Text>Build 411 · no changes</Text>
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
        <Text>Build 412 · 3 changed</Text>
      </Card>
      <Card>
        <Text>Build 411 · no changes</Text>
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
          <Text>Build 412 · 3 changed</Text>
        </Card>
      </li>
      <li>
        <Card>
          <Text>Build 411 · no changes</Text>
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
        <Text>Build 412 · 3 changed</Text>
      </Card>
      <Card>
        <Text>Build 411 · no changes</Text>
      </Card>
    </Stack>
  ),
};
