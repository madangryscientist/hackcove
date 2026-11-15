import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Caption,
  Card,
  Divider,
  MetaList,
  Section,
  Stack,
  Text,
  TextLink,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Layout/Divider" };
export default meta;
type S = StoryObj;

export const Rule: S = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <Text>Above the rule.</Text>
      <Divider />
      <Text>Below the rule.</Text>
    </div>
  ),
};

export const AboveAFooter: S = {
  render: () => (
    <div className="max-w-xl">
      <Text>The last paragraph of a page.</Text>
      <div className="mt-16">
        <Divider />
      </div>
      <footer className="pt-8">
        <Caption>Hack Cove (Pty) Ltd</Caption>
        <div className="mt-2">
          <MetaList>
            <TextLink href="/privacy">Privacy</TextLink>
            <TextLink href="/terms">Terms</TextLink>
          </MetaList>
        </div>
      </footer>
    </div>
  ),
};

/** A `Divider` is one hairline between two parts of a page, here the content and its footer. The space around it is the `Stack`'s. */
export const DoFooter: S = {
  render: () => (
    <Stack gap="lg">
      <Text>The last paragraph of a page.</Text>
      <Divider />
      <Caption>Hack Cove (Pty) Ltd</Caption>
    </Stack>
  ),
};

/** A line between two `Section`s of one page is a `Divider` in the `Stack` that holds them: the Stack's gap is the space on both sides. */
export const BetweenSections: S = {
  render: () => (
    <Stack>
      <Section title="Fixed expenses">
        <Text>Rent, insurance and transport, every month.</Text>
      </Section>
      <Divider />
      <Section title="One-off costs">
        <Text>Costs that fall in a single month.</Text>
      </Section>
    </Stack>
  ),
};

/** Bordered blocks need no rule between them: the Stack's gap separates them. */
export const DoCards: S = {
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

/** A `Divider` between two Cards is a second line on top of their borders and the gap. */
export const DontCards: S = {
  render: () => (
    <Stack>
      <Card title="Build 412">
        <Text>3 changed</Text>
      </Card>
      <Divider />
      <Card title="Build 411">
        <Text>No changes</Text>
      </Card>
    </Stack>
  ),
};
