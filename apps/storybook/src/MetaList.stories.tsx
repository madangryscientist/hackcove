import type { Meta, StoryObj } from "@storybook/react-vite";
import { Caption, Code, MetaList, TextLink } from "@hackcove/ui";

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
