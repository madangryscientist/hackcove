import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Body,
  Card,
  EmptyState,
  FullBleedLayout,
  KeyValue,
  KeyValueList,
  NavTabs,
  Overline,
} from "@hackcove/ui";
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

/** A whole viewer page: the shell with `bleed`, then the layout with the viewer in `children` and the facts in `panel`. The `EmptyState` stands in for the app's own viewer. */
export const FullPage: S = {
  render: () => (
    <AppShell
      brand={<a href="#">Hack Cove</a>}
      nav={
        <NavTabs
          label="Main"
          items={[
            { label: "Quotes", href: "#quotes", active: true },
            { label: "Clients", href: "#clients" },
          ]}
        />
      }
      bleed
    >
      <FullBleedLayout
        panel={
          <>
            <Overline as="h2">Snapshot</Overline>
            <KeyValueList>
              <KeyValue label="Story">Button / Primary</KeyValue>
              <KeyValue label="Changed">0.4%</KeyValue>
            </KeyValueList>
          </>
        }
      >
        <EmptyState title="Snapshot viewer">
          <Body as="p" color="secondary">
            Your viewer goes here and fills the width.
          </Body>
        </EmptyState>
      </FullBleedLayout>
    </AppShell>
  ),
};

const snapshotCanvas = (
  <div className="flex h-96 items-center justify-center bg-slate-100">
    <Body as="p" color="secondary">
      Snapshot viewer: fills the width
    </Body>
  </div>
);

const snapshotPanel = (
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
      <FullBleedLayout panel={snapshotPanel}>{snapshotCanvas}</FullBleedLayout>
    </DemoShell>
  ),
};

export const WithoutPanel: S = {
  render: () => (
    <DemoShell bleed>
      <FullBleedLayout>{snapshotCanvas}</FullBleedLayout>
    </DemoShell>
  ),
};

/** A viewer that needs the whole width (a snapshot, a canvas, a player) fills it, with the facts in the `panel`. */
export const DoViewer: S = {
  render: () => (
    <FullBleedLayout
      panel={
        <>
          <Overline as="h2">Snapshot</Overline>
          <KeyValueList>
            <KeyValue label="Story">Button / Primary</KeyValue>
            <KeyValue label="Changed">0.4%</KeyValue>
          </KeyValueList>
        </>
      }
    >
      <Body as="p" color="secondary">
        The snapshot fills the width.
      </Body>
    </FullBleedLayout>
  ),
};

/** `FullBleedLayout` adds no padding, so an ordinary page lands on the screen edge. A page with a title is a `ListLayout` or `DetailLayout`. */
export const DontViewer: S = {
  render: () => (
    <FullBleedLayout>
      <Card title="Quotes">
        <Body as="p">Every quote you have sent.</Body>
      </Card>
    </FullBleedLayout>
  ),
};
