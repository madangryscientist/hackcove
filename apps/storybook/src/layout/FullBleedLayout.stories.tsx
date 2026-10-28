import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Button,
  Card,
  Cluster,
  EmptyState,
  FullBleedLayout,
  KeyValue,
  KeyValueList,
  NavTabs,
  Overline,
  Text,
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
          <Text as="p" color="secondary">
            Your viewer goes here and fills the width.
          </Text>
        </EmptyState>
      </FullBleedLayout>
    </AppShell>
  ),
};

const snapshotCanvas = (
  <div className="flex h-96 items-center justify-center bg-slate-100">
    <Text as="p" color="secondary">
      Snapshot viewer: fills the width
    </Text>
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

/** `padded` gives the canvas and panel the same page padding as the other layouts, for a full-height body that is not a viewer. */
export const Padded: S = {
  render: () => (
    <DemoShell bleed>
      <FullBleedLayout padded panel={snapshotPanel}>
        <Card title="Quotes">
          <Text as="p">Every quote you have sent.</Text>
        </Card>
      </FullBleedLayout>
    </DemoShell>
  ),
};

const viewerBar = (
  <Cluster justify="between" gap="md">
    <Text as="p">Button / Primary</Text>
    <Button size="sm" variant="outline">
      Accept
    </Button>
  </Cluster>
);

/** `bar` is a full-width row above the canvas and the panel, on the surface with a bottom line, that sticks under the shell's header as the page scrolls. */
export const WithBar: S = {
  render: () => (
    <DemoShell bleed>
      <FullBleedLayout bar={viewerBar} panel={snapshotPanel}>
        {snapshotCanvas}
      </FullBleedLayout>
    </DemoShell>
  ),
};

/** With a `bar`, `padded` pads only what is below it: the bar keeps its own edge. */
export const BarPadded: S = {
  render: () => (
    <DemoShell bleed>
      <FullBleedLayout bar={viewerBar} padded panel={snapshotPanel}>
        <Card title="Quotes">
          <Text as="p">Every quote you have sent.</Text>
        </Card>
      </FullBleedLayout>
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
      <Text as="p" color="secondary">
        The snapshot fills the width.
      </Text>
    </FullBleedLayout>
  ),
};

/** `FullBleedLayout` adds no padding unless `padded`, so an ordinary page lands on the screen edge. A page with a title is a `ListLayout` or `DetailLayout`. */
export const DontViewer: S = {
  render: () => (
    <FullBleedLayout>
      <Card title="Quotes">
        <Text as="p">Every quote you have sent.</Text>
      </Card>
    </FullBleedLayout>
  ),
};
