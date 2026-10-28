import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Breadcrumbs,
  Button,
  Card,
  Cluster,
  Tabs,
  PageHeader,
  PageHeading,
  Stack,
  Text,
} from "@hackcove/ui";

/** The docs examples for `PageHeader`. */
const meta: Meta = { title: "Docs/PageHeader" };
export default meta;
type S = StoryObj;

/** Breadcrumbs, title, subtitle, actions and tabs are slots of one `PageHeader`; each is optional. */
export const DoSlots: S = {
  render: () => (
    <PageHeader
      breadcrumbs={
        <Breadcrumbs
          crumbs={[
            { label: "Hack Cove", href: "#project" },
            { label: "Builds", href: "#builds" },
            "Build 412",
          ]}
        />
      }
      title="Build 412"
      subtitle="main · 3 changed"
      actions={
        <>
          <Button variant="outline">Reject</Button>
          <Button>Accept all</Button>
        </>
      }
      tabs={
        <Tabs
          variant="pill"
          label="Build"
          items={[
            { label: "Changed", href: "#changed", active: true },
            { label: "New", href: "#new" },
          ]}
        />
      }
    />
  ),
};

/** A title row built from a heading, a subtitle and a `Cluster` is a second header that drifts from every other page's. Use `PageHeader`. */
export const DontSlots: S = {
  render: () => (
    <Cluster justify="between">
      <Stack gap="xs">
        <PageHeading>Build 412</PageHeading>
        <Text as="p">main · 3 changed</Text>
      </Stack>
      <Button>Accept all</Button>
    </Cluster>
  ),
};

/** As a direct child of a `Stack`, the header drops its own bottom margin, so the Stack's `gap` is the only space under it. */
export const DoInStack: S = {
  render: () => (
    <Stack gap="lg">
      <PageHeader title="Members" subtitle="Who can see this project." />
      <Card title="Active">
        <Text>3 members</Text>
      </Card>
    </Stack>
  ),
};

/** Wrapped in a `div`, the header is no longer a direct child of the Stack, keeps its margin and doubles the space. */
export const DontInStack: S = {
  render: () => (
    <Stack gap="lg">
      <div>
        <PageHeader title="Members" subtitle="Who can see this project." />
      </div>
      <Card title="Active">
        <Text>3 members</Text>
      </Card>
    </Stack>
  ),
};
