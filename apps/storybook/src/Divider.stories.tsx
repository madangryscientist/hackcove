import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Caption, Card, Divider, InlineLinks, Stack, TextLink } from "@hackcove/ui";

const meta: Meta = { title: "UI/Divider" };
export default meta;
type S = StoryObj;

export const Rule: S = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <Body as="p">Above the rule.</Body>
      <Divider />
      <Body as="p">Below the rule.</Body>
    </div>
  ),
};

export const AboveAFooter: S = {
  render: () => (
    <div className="max-w-xl">
      <Body as="p">The last paragraph of a page.</Body>
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
      <Body as="p">The last paragraph of a page.</Body>
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
        <Body>3 changed</Body>
      </Card>
      <Card title="Build 411">
        <Body>No changes</Body>
      </Card>
    </Stack>
  ),
};

/** A `Divider` between two Cards is a second line on top of their borders and the gap. */
export const DontCards: S = {
  render: () => (
    <Stack>
      <Card title="Build 412">
        <Body>3 changed</Body>
      </Card>
      <Divider />
      <Card title="Build 411">
        <Body>No changes</Body>
      </Card>
    </Stack>
  ),
};
