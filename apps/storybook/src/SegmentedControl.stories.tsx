import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SegmentedControl, type LinkRenderProps } from "@hackcove/ui";

const meta: Meta = { title: "UI/SegmentedControl" };
export default meta;
type S = StoryObj;

/** The caller owns `value`; click an option, or Tab in and use the arrow keys, Home and End. */
export const Default: S = {
  render: () => {
    const [value, setValue] = useState("week");
    return (
      <SegmentedControl
        label="Range"
        items={[
          { value: "day", label: "Daily" },
          { value: "week", label: "Weekly" },
          { value: "dream", label: "Dream" },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithDisabledOption: S = {
  render: () => {
    const [value, setValue] = useState("split");
    return (
      <SegmentedControl
        label="Split"
        items={[
          { value: "split", label: "Split" },
          { value: "even", label: "Even" },
          { value: "custom", label: "Custom", disabled: true },
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

/** Each option's `render` draws the app's own Link; `value` marks the current route and gets `aria-current`. */
export const WithRouterLink: S = {
  render: () => (
    <SegmentedControl
      label="Journal"
      value="daily"
      items={[
        { value: "daily", label: "Daily", render: (p) => <FakeLink to="/daily" {...p} /> },
        { value: "weekly", label: "Weekly", render: (p) => <FakeLink to="/weekly" {...p} /> },
      ]}
    />
  ),
};
