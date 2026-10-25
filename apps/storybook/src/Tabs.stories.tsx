import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Body, Breadcrumbs, Button, PageHeader, Tabs, type LinkRenderProps } from "@hackcove/ui";

const meta: Meta = { title: "UI/Tabs" };
export default meta;
type S = StoryObj;

const views = ["overview", "activity", "settings"].map((value) => ({
  value,
  label: value[0]?.toUpperCase() + value.slice(1),
  controls: "panel",
}));

/** The caller owns `value`; click a tab, or Tab in and use the arrow keys, Home and End. */
export const Default: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <Tabs label="Project views" items={views} value={value} onChange={setValue} />
        <Body id="panel" role="tabpanel">
          Showing {value}.
        </Body>
      </div>
    );
  },
};

export const WithDisabledTab: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    return (
      <Tabs
        label="Project views"
        items={[
          { value: "overview", label: "Overview" },
          { value: "activity", label: "Activity", disabled: true },
          { value: "settings", label: "Settings" },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** The current tab is a filled pill, as `NavTabs` draws it, with no rule under the row. */
export const Pill: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <Tabs
          variant="pill"
          label="Project views"
          items={views}
          value={value}
          onChange={setValue}
        />
        <Body id="panel" role="tabpanel">
          Showing {value}.
        </Body>
      </div>
    );
  },
};

/** A `count` sits muted after the label and is part of the tab's name ("Shots 12"), in both variants. */
export const WithCounts: S = {
  render: () => {
    const [value, setValue] = useState("shots");
    const items = [
      { value: "shots", label: "Shots", count: 12 },
      { value: "clips", label: "Clips", count: 0 },
      { value: "notes", label: "Notes" },
    ];
    return (
      <div className="flex max-w-xl flex-col gap-6">
        <Tabs label="Assets" items={items} value={value} onChange={setValue} />
        <Tabs variant="pill" label="Assets" items={items} value={value} onChange={setValue} />
      </div>
    );
  },
};

/** A disabled tab keeps its `title` on hover as the reason; the arrow keys skip it. */
export const WithDisabledReason: S = {
  render: () => {
    const [value, setValue] = useState("overview");
    const items = [
      { value: "overview", label: "Overview" },
      { value: "activity", label: "Activity", disabled: true, title: "No activity yet" },
      { value: "settings", label: "Settings" },
    ];
    return (
      <div className="flex max-w-xl flex-col gap-6">
        <Tabs label="Project views" items={items} value={value} onChange={setValue} />
        <Tabs
          variant="pill"
          label="Project views"
          items={items}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};

/** `disabled` on the row disables every tab, e.g. until the page has hydrated. */
export const Disabled: S = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <Tabs label="Project views" items={views} value="overview" onChange={() => {}} disabled />
      <Tabs
        variant="pill"
        label="Project views"
        items={views}
        value="overview"
        onChange={() => {}}
        disabled
      />
    </div>
  ),
};

/** The pill variant in `PageHeader`'s `tabs` slot, with counts, under the actions. */
export const InPageHeader: S = {
  render: () => {
    const [value, setValue] = useState("shots");
    return (
      <div className="max-w-3xl">
        <PageHeader
          breadcrumbs={<Breadcrumbs crumbs={["Projects", "Launch film"]} />}
          title="Launch film"
          subtitle="Updated 2 minutes ago"
          actions={<Button>Upload</Button>}
          tabs={
            <Tabs
              variant="pill"
              label="Assets"
              value={value}
              onChange={setValue}
              items={[
                { value: "shots", label: "Shots", count: 12 },
                { value: "clips", label: "Clips", count: 3 },
                {
                  value: "exports",
                  label: "Exports",
                  disabled: true,
                  title: "Nothing exported yet",
                },
              ]}
            />
          }
        />
        <Body as="p">Showing {value}.</Body>
      </div>
    );
  },
};

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** Each tab's `render` draws the app's own Link; `value` marks the current route and gets `aria-current`. */
export const WithRouterLink: S = {
  render: () => (
    <Tabs
      label="Business"
      value="quotes"
      items={[
        { value: "quotes", label: "Quotes", render: (p) => <FakeLink to="/quotes" {...p} /> },
        { value: "invoices", label: "Invoices", render: (p) => <FakeLink to="/invoices" {...p} /> },
        { value: "traces", label: "Traces", href: "https://example.com/traces", external: true },
      ]}
    />
  ),
};
