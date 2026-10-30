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
} from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";
import { DetailPage } from "./pages";

/** Main two thirds and aside one third from `lg`; the aside stacks below main under it. */
const meta: Meta = {
  title: "Layout/DetailLayout",
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
