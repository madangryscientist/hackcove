import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, FullBleedLayout, KeyValue, KeyValueList, Overline } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

/**
 * Edge-to-edge canvas with an optional right panel that stacks below under `lg`. Not in the
 * no-jump title check (the canvas has no page title); the e2e asserts the panel on its own terms.
 */
const meta: Meta = {
  title: "Layout/FullBleedLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

const canvas = (
  <div className="flex h-96 items-center justify-center bg-slate-100">
    <Body as="p" color="secondary">
      Snapshot viewer: fills the width
    </Body>
  </div>
);

const panel = (
  <>
    <Overline as="h2">Snapshot</Overline>
    <div className="mt-3">
      <KeyValueList>
        <KeyValue label="Story">Button / Primary</KeyValue>
        <KeyValue label="Theme">default</KeyValue>
        <KeyValue label="Changed">0.4%</KeyValue>
      </KeyValueList>
    </div>
  </>
);

export const WithPanel: S = {
  render: () => (
    <DemoShell bleed>
      <FullBleedLayout panel={panel}>{canvas}</FullBleedLayout>
    </DemoShell>
  ),
};

export const WithoutPanel: S = {
  render: () => (
    <DemoShell bleed>
      <FullBleedLayout>{canvas}</FullBleedLayout>
    </DemoShell>
  ),
};
