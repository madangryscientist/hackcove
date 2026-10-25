import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Body, Tabs, type LinkRenderProps } from "@hackcove/ui";

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
