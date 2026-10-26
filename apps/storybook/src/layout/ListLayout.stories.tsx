import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Body,
  Button,
  Card,
  EmptyState,
  FilterGroup,
  ListLayout,
  PageHeader,
  Pill,
  Stack,
  ToggleChip,
} from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";
import { ListPage } from "./pages";

/** Every story under `Layout/` is picked up by the no-jump e2e at 375, 768 and 1280. */
const meta: Meta = {
  title: "Layout/ListLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const WithRows: S = {
  render: () => (
    <DemoShell>
      <ListPage />
    </DemoShell>
  ),
};

/** `isEmpty` swaps the list for the `empty` slot; the header and filters stay. */
export const Empty: S = {
  render: () => (
    <DemoShell>
      <ListPage isEmpty />
    </DemoShell>
  ),
};

/** `filters` sit under the header, then the rows: one `Card` per item. */
export const DoRows: S = {
  render: () => (
    <ListLayout
      title="Quotes"
      subtitle="Every quote you have sent."
      actions={<Button>New quote</Button>}
      filters={
        <FilterGroup legend="Status">
          <ToggleChip pressed>All</ToggleChip>
          <ToggleChip pressed={false}>Sent</ToggleChip>
        </FilterGroup>
      }
    >
      <Card as="article" title="Naledi Mokoena" status={<Pill tone="emerald">Accepted</Pill>}>
        <Body as="p">Q-1042 · R 1 240 / mo</Body>
      </Card>
      <Card as="article" title="Pieter van Wyk" status={<Pill tone="slate">Sent</Pill>}>
        <Body as="p">Q-1041 · R 860 / mo</Body>
      </Card>
    </ListLayout>
  ),
};

/** A one-off header and stack drifts from every other list page; `ListLayout` is the one header, filters and list. */
export const DontRows: S = {
  render: () => (
    <Stack>
      <PageHeader title="Quotes" subtitle="Every quote you have sent." />
      <Card as="article" title="Naledi Mokoena">
        <Body as="p">Q-1042 · R 1 240 / mo</Body>
      </Card>
    </Stack>
  ),
};

/** `empty` takes the list's place when `isEmpty`: say what is missing and what to do. */
export const DoNothingYet: S = {
  render: () => (
    <ListLayout
      title="Quotes"
      subtitle="Every quote you have sent."
      isEmpty
      empty={
        <EmptyState title="No quotes yet" actions={<Button>New quote</Button>}>
          <Body as="p" color="secondary">
            Quotes you send show up here.
          </Body>
        </EmptyState>
      }
    />
  ),
};

/** `isEmpty` without `empty` leaves a blank page under the header. */
export const DontNothingYet: S = {
  render: () => <ListLayout title="Quotes" subtitle="Every quote you have sent." isEmpty />,
};
