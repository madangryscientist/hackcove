import type { Meta, StoryObj } from "@storybook/react-vite";
import { InlineLinks, TextLink } from "@hackcove/ui";

const meta: Meta = { title: "UI/InlineLinks" };
export default meta;
type S = StoryObj;

const links = [
  <TextLink key="privacy" href="#privacy">
    Privacy
  </TextLink>,
  <TextLink key="terms" href="#terms">
    Terms
  </TextLink>,
  <TextLink key="email" href="mailto:hello@example.com">
    hello@example.com
  </TextLink>,
];

export const Dot: S = { render: () => <InlineLinks>{links}</InlineLinks> };

export const Bullet: S = { render: () => <InlineLinks separator="•">{links}</InlineLinks> };

export const NoSeparator: S = { render: () => <InlineLinks separator="none">{links}</InlineLinks> };

export const Wraps: S = {
  render: () => (
    <div className="w-48">
      <InlineLinks>{links}</InlineLinks>
    </div>
  ),
};
