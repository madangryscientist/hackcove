import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Callout, Card, TextLink } from "@hackcove/ui";

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
export const WithActions: S = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Callout
        tone="warn"
        title="3 uncategorised."
        actions={
          <Button size="sm" variant="outline">
            Review
          </Button>
        }
      >
        Sort them before the month closes.
      </Callout>
      <Callout tone="info" actions={<Button size="sm">Retry</Button>}>
        The last import did not finish.
      </Callout>
    </div>
  ),
};
export const Banner: S = {
  render: () => (
    <div className="max-w-xl">
      <Card flush>
        <Callout banner tone="warn" actions={<Button size="sm">Fix</Button>}>
          Two bills have no due date.
        </Callout>
        <p className="p-5 text-sm text-slate-700">The card body sits under the strip.</p>
      </Card>
    </div>
  ),
};

/** A `TextLink stretch` in `actions`: the whole callout is the click target, one link at the end of the row. */
export const Linked: S = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Callout
        tone="warn"
        title="3 uncategorised."
        actions={
          <TextLink stretch href="#review">
            Review
          </TextLink>
        }
      >
        Sort them before the month closes.
      </Callout>
      <Callout
        tone="info"
        actions={
          <TextLink
            stretch
            render={(props) => <a {...props} href="#router" data-router="/imports" />}
          >
            Open
          </TextLink>
        }
      >
        The last import finished.
      </Callout>
    </div>
  ),
};
