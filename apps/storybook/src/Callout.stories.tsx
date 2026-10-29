import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Callout, Card, FullBleedLayout, Stack, Text, TextLink } from "@hackcove/ui";

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
      <Callout
        tone="danger"
        title="Build failed."
        actions={
          <Button size="sm" variant="outline">
            Rerun
          </Button>
        }
      >
        3 visual checks did not match their baselines.
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

/** In a padded `FullBleedLayout` column the notice is a plain Callout, first in the column's `Stack`: `banner` is for the top of a `Card flush` only, and the padding would inset it. */
export const InPaddedColumn: S = {
  render: () => (
    <FullBleedLayout padded panel={<Text tone="muted">The side panel.</Text>}>
      <Stack gap="sm">
        <Callout tone="danger" role="alert">
          The decision did not save. Try again.
        </Callout>
        <Text>The column's content sits under the notice, on the same edge.</Text>
      </Stack>
    </FullBleedLayout>
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

/** The tone matches how much the message matters: `warn` for a thing to check before going on. */
export const DoTone: S = {
  render: () => (
    <Stack gap="sm">
      <Callout tone="info">The import runs overnight.</Callout>
      <Callout tone="warn" title="3 uncategorised.">
        Sort them before the month closes.
      </Callout>
    </Stack>
  ),
};

/** `danger` on a plain note cries wolf: when everything is red, a real failure no longer stands out. */
export const DontTone: S = {
  render: () => (
    <Stack gap="sm">
      <Callout tone="danger">The import runs overnight.</Callout>
      <Callout tone="danger" title="3 uncategorised.">
        Sort them before the month closes.
      </Callout>
    </Stack>
  ),
};

/** The action goes in `actions`, at the end of the row, so every callout puts it in the same place. */
export const DoAction: S = {
  render: () => (
    <Callout
      tone="warn"
      title="Import failed."
      actions={
        <Button size="sm" variant="outline">
          Retry
        </Button>
      }
    >
      The last file did not finish.
    </Callout>
  ),
};

/** A button inside the body drops under the text and leaves the row without its action. */
export const DontAction: S = {
  render: () => (
    <Callout tone="warn" title="Import failed.">
      The last file did not finish. <Button size="sm">Retry</Button>
    </Callout>
  ),
};
