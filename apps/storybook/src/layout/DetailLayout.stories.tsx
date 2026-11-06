import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Button,
  Card,
  DetailLayout,
  KeyValue,
  KeyValueList,
  ListLayout,
  Tabs,
  Text,
} from "@hackcove/ui-react";
import { DemoShell, layoutPage } from "./DemoShell";
import { DetailPage } from "./pages";

/** Main two thirds and aside one third from `lg`; the aside stacks below main under it. `stickyAside` keeps the aside in view under the header from `lg` as a long page scrolls. */
const meta: Meta = {
  title: "Page layouts/DetailLayout",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole record page: the shell with its brand and nav, then the layout with the record in `children` and its facts in `aside`. */
export const FullPage: S = {
  render: () => (
    <AppShell
      brand={<a href="#">Hack Cove</a>}
      nav={
        <Tabs
          variant="pill"
          label="Main"
          items={[
            { label: "Quotes", href: "#quotes", active: true },
            { label: "Clients", href: "#clients" },
          ]}
        />
      }
    >
      <DetailLayout
        title="Quote Q-1042"
        subtitle="Naledi Mokoena"
        actions={<Button variant="outline">Edit</Button>}
        aside={
          <Card title="Details">
            <KeyValueList>
              <KeyValue label="Status">Sent</KeyValue>
              <KeyValue label="Premium">R 1 240 / mo</KeyValue>
            </KeyValueList>
          </Card>
        }
      >
        <Card title="Cover">
          <Text as="p">Life cover of R 1 500 000, to age 65.</Text>
        </Card>
        <Card title="Notes">
          <Text as="p">The client asked to be debited on the 25th.</Text>
        </Card>
      </DetailLayout>
    </AppShell>
  ),
};

export const MainAndAside: S = {
  render: () => (
    <DemoShell>
      <DetailPage />
    </DemoShell>
  ),
};

const longMain = Array.from({ length: 12 }, (_, i) => (
  <Card key={i} title={`Block ${i + 1}`}>
    <Text as="p">A block of a long record. The aside stays in view while this scrolls.</Text>
  </Card>
));

/** `stickyAside` on a long page: from `lg` the aside sticks under the header; taller than the room left, it scrolls itself. Below `lg` it stacks. */
export const StickyAside: S = {
  render: () => (
    <DemoShell>
      <DetailLayout
        title="Quote Q-1042"
        subtitle="Naledi Mokoena"
        actions={<Button variant="outline">Edit</Button>}
        stickyAside
        aside={
          <Card title="Details">
            <KeyValueList>
              <KeyValue label="Status">Sent</KeyValue>
              <KeyValue label="Premium">R 1 240 / mo</KeyValue>
            </KeyValueList>
          </Card>
        }
      >
        {longMain}
      </DetailLayout>
    </DemoShell>
  ),
};

const notes = Array.from({ length: 18 }, (_, i) => (
  <Text key={i} as="p">
    Note {i + 1}: the client asked for a call back about the cover, and for the quote to be sent by
    email, not post.
  </Text>
));

/**
 * A sticky aside of plain text, no links or fields: taller than the room left, it scrolls itself,
 * and since nothing in it takes the keyboard it takes a tab stop, so the arrow keys can scroll it.
 * `asideLabel` names the aside and that stop.
 */
export const StickyAsideText: S = {
  render: () => (
    <DemoShell>
      <DetailLayout
        title="Quote Q-1042"
        subtitle="Naledi Mokoena"
        actions={<Button variant="outline">Edit</Button>}
        stickyAside
        asideLabel="Quote notes"
        aside={notes}
      >
        {longMain}
      </DetailLayout>
    </DemoShell>
  ),
};

/** The record's content is the main column; the facts about it go in `aside`. */
export const DoRecord: S = {
  render: () => (
    <DetailLayout
      title="Quote Q-1042"
      subtitle="Naledi Mokoena"
      actions={<Button variant="outline">Edit</Button>}
      aside={
        <Card title="Details">
          <KeyValueList>
            <KeyValue label="Status">Sent</KeyValue>
            <KeyValue label="Premium">R 1 240 / mo</KeyValue>
          </KeyValueList>
        </Card>
      }
    >
      <Card title="Cover">
        <Text as="p">Life cover of R 1 500 000, to age 65.</Text>
      </Card>
    </DetailLayout>
  ),
};

/** `ListLayout` has no aside, so the facts become one more block under the content. Use `DetailLayout` for a record. */
export const DontRecord: S = {
  render: () => (
    <ListLayout
      title="Quote Q-1042"
      subtitle="Naledi Mokoena"
      actions={<Button variant="outline">Edit</Button>}
    >
      <Card title="Cover">
        <Text as="p">Life cover of R 1 500 000, to age 65.</Text>
      </Card>
      <Card title="Details">
        <KeyValueList>
          <KeyValue label="Status">Sent</KeyValue>
          <KeyValue label="Premium">R 1 240 / mo</KeyValue>
        </KeyValueList>
      </Card>
    </ListLayout>
  ),
};
