import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  Cluster,
  Field,
  Input,
  KeyValue,
  KeyValueList,
  ListRow,
  Overline,
  Section,
  SectionHeading,
  Stack,
  Text,
} from "@hackcove/ui-react";

/** The docs examples for `Stack` and `Section`. */
const meta: Meta = { title: "Layout/Stack" };
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

/** `rule` draws a hairline under the title row, across its full width with the actions, for a section that must read as set apart from what follows. */
export const SectionRule: S = {
  render: () => (
    <Section rule title="Recent builds" actions={<Button variant="outline">All builds</Button>}>
      <Card title="Build 412">
        <Text>3 changed</Text>
      </Card>
    </Section>
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

/** A width cap on one block is a `Stack` around it: `width="compact"` is one card's width, at the left edge. */
export const DoWidth: S = {
  render: () => (
    <Stack width="compact">
      <Card title="Opening hours" size="sm">
        <KeyValueList>
          <KeyValue label="Mon to Fri">08:00 to 17:00</KeyValue>
          <KeyValue label="Saturday">08:00 to 13:00</KeyValue>
          <KeyValue label="Sunday">Closed</KeyValue>
        </KeyValueList>
      </Card>
    </Stack>
  ),
};

/** Left to the page, a small card stretches across it and its few lines float in a wide box. */
export const DontWidth: S = {
  render: () => (
    <Stack>
      <Card title="Opening hours" size="sm">
        <KeyValueList>
          <KeyValue label="Mon to Fri">08:00 to 17:00</KeyValue>
          <KeyValue label="Saturday">08:00 to 13:00</KeyValue>
          <KeyValue label="Sunday">Closed</KeyValue>
        </KeyValueList>
      </Card>
    </Stack>
  ),
};

/** A column whose children keep their own width is `align="start"`: the button under the fields is as wide as its label. */
export const DoAlign: S = {
  render: () => (
    <Stack width="narrow" gap="sm" align="start">
      <Field label="Shop name" htmlFor="stack-align-name">
        <Input id="stack-align-name" placeholder="Corner Books" />
      </Field>
      <Button>Save shop</Button>
    </Stack>
  ),
};

/** In a stretched column the button spans it, as wide as the fields; never wrap it in a bare `div` to stop that. */
export const DontAlign: S = {
  render: () => (
    <Stack width="narrow" gap="sm">
      <Field label="Shop name" htmlFor="stack-align-name">
        <Input id="stack-align-name" placeholder="Corner Books" />
      </Field>
      <Button>Save shop</Button>
    </Stack>
  ),
};

/** Rows with a line between are a `Stack as="ul" divided` in a `Card flush`: the Stack owns the lines. */
export const DoDivided: S = {
  render: () => (
    <Card flush>
      <Stack as="ul" divided aria-label="Builds">
        <li>
          <ListRow secondary="3 changed">Build 412</ListRow>
        </li>
        <li>
          <ListRow secondary="No changes">Build 411</ListRow>
        </li>
        <li>
          <ListRow secondary="1 changed">Build 410</ListRow>
        </li>
      </Stack>
    </Card>
  ),
};

/** A line set by hand on every row but the first is arithmetic the Stack does for you, and the rows are no list. */
export const DontDivided: S = {
  render: () => (
    <Card flush>
      <ListRow secondary="3 changed">Build 412</ListRow>
      <ListRow divided secondary="No changes">
        Build 411
      </ListRow>
      <ListRow divided secondary="1 changed">
        Build 410
      </ListRow>
    </Card>
  ),
};

/** `align="start"` at phone width: a long paragraph, a long unbroken token and a button, none wider than the page. */
export const AlignStart: S = {
  parameters: { layout: "padded" },
  render: () => (
    <Stack align="start" gap="sm">
      <Text>
        A long paragraph that wraps across the column, so its own width is the column's and it never
        pushes the page sideways on a phone.
      </Text>
      <Text breakWords>
        tok_demo_0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz
      </Text>
      <Button>Copy the key</Button>
    </Stack>
  ),
};

/** A small titled group inside a card or a panel is `Section size="sm"`: a region named by its small title, its lines `xs` apart, an action at the end of the title row. */
export const DoSmallSection: S = {
  render: () => (
    <Card>
      <Stack gap="sm">
        <Section
          size="sm"
          title="Flaky"
          actions={
            <Button variant="ghost" size="sm">
              Rerun
            </Button>
          }
        >
          <Text>checkout.spec.ts failed once in the last 20 runs.</Text>
        </Section>
        <Section size="sm" title="Ignore areas">
          <Text>The clock in the header and the avatar.</Text>
        </Section>
      </Stack>
    </Card>
  ),
};

/** Built from a `Stack as="section"` and an `Overline as="h2"`, the group is an unnamed section whose gap is a guess. */
export const DontSmallSection: S = {
  render: () => (
    <Card>
      <Stack gap="sm">
        <Stack as="section" gap="xs">
          <Cluster justify="between">
            <Overline as="h2">Flaky</Overline>
            <Button variant="ghost" size="sm">
              Rerun
            </Button>
          </Cluster>
          <Text>checkout.spec.ts failed once in the last 20 runs.</Text>
        </Stack>
        <Stack as="section" gap="xs">
          <Overline as="h2">Ignore areas</Overline>
          <Text>The clock in the header and the avatar.</Text>
        </Stack>
      </Stack>
    </Card>
  ),
};
