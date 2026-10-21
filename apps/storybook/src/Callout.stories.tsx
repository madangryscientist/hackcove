import type { Meta, StoryObj } from "@storybook/react-vite";
import { Callout } from "@hackcove/ui";

const meta: Meta = { title: "UI/Callout" };
export default meta;
type S = StoryObj;

export const Tones: S = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Callout tone="neutral">Neutral: a note with no urgency.</Callout>
      <Callout tone="info">Info: something worth knowing.</Callout>
      <Callout tone="positive">Positive: your review is saved.</Callout>
      <Callout tone="warn">Warn: check this before you continue.</Callout>
      <Callout tone="danger">Danger: this cannot be undone.</Callout>
    </div>
  ),
};
export const WithTitle: S = {
  render: () => (
    <div className="max-w-xl">
      <Callout tone="warn" title="Draft.">
        This page has not yet been reviewed by a lawyer.
      </Callout>
    </div>
  ),
};
