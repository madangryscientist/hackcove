import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Caption, Divider, InlineLinks, TextLink } from "@hackcove/ui";

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
