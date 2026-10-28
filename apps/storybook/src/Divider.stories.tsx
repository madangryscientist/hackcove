import type { Meta, StoryObj } from "@storybook/react-vite";
import { Caption, Card, Divider, InlineLinks, Stack, Text, TextLink } from "@hackcove/ui";

const meta: Meta = { title: "UI/Divider" };
export default meta;
type S = StoryObj;

export const Rule: S = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <Text as="p">Above the rule.</Text>
      <Divider />
      <Text as="p">Below the rule.</Text>
    </div>
  ),
};

export const AboveAFooter: S = {
  render: () => (
    <div className="max-w-xl">
      <Text as="p">The last paragraph of a page.</Text>
      <div className="mt-16">
        <Divider />
      </div>
      <footer className="pt-8">
        <Caption as="p">Hack Cove (Pty) Ltd</Caption>
        <div className="mt-2">
          <InlineLinks>
            <TextLink href="/privacy">Privacy</TextLink>
            <TextLink href="/terms">Terms</TextLink>
          </InlineLinks>
        </div>
      </footer>
    </div>
  ),
};

/** A `Divider` is one hairline between two parts of a page, here the content and its footer. The space around it is the `Stack`'s. */
export const DoFooter: S = {
  render: () => (
    <Stack gap="lg">
      <Text as="p">The last paragraph of a page.</Text>
      <Divider />
      <Caption as="p">Hack Cove (Pty) Ltd</Caption>
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
