import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, InlineLinks, TextLink } from "@hackcove/ui";

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

/** A row of links is `InlineLinks`: it spaces them, wraps them and hides the separator from a screen reader. */
export const DoFooter: S = {
  render: () => (
    <InlineLinks>
      <TextLink href="#privacy">Privacy</TextLink>
      <TextLink href="#terms">Terms</TextLink>
      <TextLink href="#contact">Contact</TextLink>
    </InlineLinks>
  ),
};

/** Separators typed by hand are read aloud and can wrap onto the end of a line. */
export const DontFooter: S = {
  render: () => (
    <Body as="p">
      <TextLink href="#privacy">Privacy</TextLink> | <TextLink href="#terms">Terms</TextLink> |{" "}
      <TextLink href="#contact">Contact</TextLink>
    </Body>
  ),
};
