import type { Meta, StoryObj } from "@storybook/react-vite";
import { Caption, Code, MetaList, Text as Prose, TextLink } from "@hackcove/ui";

const meta: Meta = { title: "UI/MetaList" };
export default meta;
type S = StoryObj;

export const Text: S = {
  render: () => (
    <MetaList>
      <span>chromium</span>
      <span>desktop</span>
      <span>1280×800</span>
    </MetaList>
  ),
};

export const Mixed: S = {
  render: () => (
    <MetaList>
      <TextLink href="#branch">hc-139</TextLink>
      <Code>0f9d376</Code>
      <span>26 Oct 2026</span>
    </MetaList>
  ),
};

export const Mono: S = {
  render: () => (
    <MetaList mono>
      <span>hc-139</span>
      <span>0f9d376</span>
      <span>2026-10-26</span>
    </MetaList>
  ),
};

export const Wraps: S = {
  render: () => (
    <div className="w-48">
      <MetaList>
        <span>chromium</span>
        <span>desktop</span>
        <span>1280×800</span>
        <span>dark theme</span>
      </MetaList>
    </div>
  ),
};

/** A row of facts is a `MetaList`; an item is text, a `Code` or a `TextLink`. */
export const DoFacts: S = {
  render: () => (
    <MetaList>
      <TextLink href="#hc-145">hc-145</TextLink>
      <Code>0f9d376</Code>
      <span>26 Oct 2026</span>
    </MetaList>
  ),
};

/** Dots typed into one string are one item to a screen reader and can wrap onto the end of a line. */
export const DontFacts: S = {
  render: () => <Caption as="p">hc-145 · 0f9d376 · 26 Oct 2026</Caption>,
};

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

/** A row of links: `nowrap` keeps each link whole, so a line breaks only between them. */
export const Links: S = { render: () => <MetaList nowrap>{links}</MetaList> };

/** `separator="•"` swaps the dot for a bullet. */
export const LinksBullet: S = {
  render: () => (
    <MetaList nowrap separator="•">
      {links}
    </MetaList>
  ),
};

/** `separator="none"` leaves only the gap. */
export const LinksNoSeparator: S = {
  render: () => (
    <MetaList nowrap separator="none">
      {links}
    </MetaList>
  ),
};

export const LinksWrap: S = {
  render: () => (
    <div className="w-48">
      <MetaList nowrap>{links}</MetaList>
    </div>
  ),
};

/** A row of links is a `MetaList nowrap`: it spaces them, wraps them and hides the separator from a screen reader. */
export const DoFooter: S = {
  render: () => (
    <MetaList nowrap>
      <TextLink href="#privacy">Privacy</TextLink>
      <TextLink href="#terms">Terms</TextLink>
      <TextLink href="#contact">Contact</TextLink>
    </MetaList>
  ),
};

/** Separators typed by hand are read aloud and can wrap onto the end of a line. */
export const DontFooter: S = {
  render: () => (
    <Prose as="p">
      <TextLink href="#privacy">Privacy</TextLink> | <TextLink href="#terms">Terms</TextLink> |{" "}
      <TextLink href="#contact">Contact</TextLink>
    </Prose>
  ),
};
