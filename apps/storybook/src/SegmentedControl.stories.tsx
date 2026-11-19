import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SegmentedControl } from "@hackcove/ui-react";

const meta: Meta = { title: "Forms/SegmentedControl" };
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

/** An option with `disabledReason` shows the reason as its tooltip; the arrow keys reach it and choose nothing. */
export const WithDisabledReason: S = {
  render: () => {
    const [value, setValue] = useState("split");
    return (
      <SegmentedControl
        label="Split"
        items={[
          { value: "split", label: "Split" },
          { value: "even", label: "Even" },
          { value: "custom", label: "Custom", disabledReason: "Needs two or more people" },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** A `count` sits muted after the label and is part of the option's name ("Shots 12"). */
export const WithCounts: S = {
  render: () => {
    const [value, setValue] = useState("shots");
    return (
      <SegmentedControl
        label="Assets"
        items={[
          { value: "shots", label: "Shots", count: 12 },
          { value: "clips", label: "Clips", count: 3 },
          { value: "notes", label: "Notes", count: 0 },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** `disabled` on the group disables every option, e.g. until the page has hydrated. */
export const Disabled: S = {
  render: () => (
    <SegmentedControl
      label="Range"
      items={[
        { value: "day", label: "Daily" },
        { value: "week", label: "Weekly" },
      ]}
      value="week"
      onChange={() => {}}
      disabled
    />
  ),
};

/** Each option's `href` is drawn by the app's own Link through `LinkProvider`; `value` marks the current route and gets `aria-current`. */
export const WithRouterLink: S = {
  render: () => (
    <SegmentedControl
      label="Journal"
      value="daily"
      items={[
        { value: "daily", label: "Daily", href: "/daily" },
        { value: "weekly", label: "Weekly", href: "/weekly" },
      ]}
    />
  ),
};

/** A mode or a range chosen in place: the caller owns `value`, and `label` names the group. */
export const DoMode: S = {
  render: () => {
    const [value, setValue] = useState("week");
    return (
      <SegmentedControl
        label="Range"
        items={[
          { value: "day", label: "Daily" },
          { value: "week", label: "Weekly" },
          { value: "month", label: "Monthly" },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** An on/off setting is a `Checkbox`, not a two-option SegmentedControl. */
export const DontMode: S = {
  render: () => {
    const [value, setValue] = useState("on");
    return (
      <SegmentedControl
        label="Email me"
        items={[
          { value: "on", label: "On" },
          { value: "off", label: "Off" },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** An option that cannot be chosen yet stays in the group with a `disabledReason` that says why. */
export const DoDisabledReason: S = {
  render: () => {
    const [value, setValue] = useState("split");
    return (
      <SegmentedControl
        label="Split"
        items={[
          { value: "split", label: "Split" },
          { value: "even", label: "Even" },
          { value: "custom", label: "Custom", disabledReason: "Needs two or more people" },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** A bare `disabled` option leaves the person guessing why it is greyed out. */
export const DontDisabledReason: S = {
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

/** Options that go to another page are links: `href` on each, and `value` marks the current page. */
export const DoLinks: S = {
  render: () => (
    <SegmentedControl
      label="Journal"
      value="daily"
      items={[
        { value: "daily", label: "Daily", href: "#daily" },
        { value: "weekly", label: "Weekly", href: "#weekly" },
      ]}
    />
  ),
};

/** Buttons that navigate from `onChange` are not links: they cannot be opened in a new tab or copied, and the current page is not marked as one. */
export const DontLinks: S = {
  render: () => (
    <SegmentedControl
      label="Journal"
      value="daily"
      items={[
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
      ]}
      onChange={(value) => window.location.assign(`#${value}`)}
    />
  ),
};

/** `sm`, `md` (the default, 38px) and `lg`: the control scale. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SegmentedControl
          key={size}
          size={size}
          label={`Range, ${size}`}
          items={[
            { value: "day", label: "Daily" },
            { value: "week", label: "Weekly" },
          ]}
          value="week"
          onChange={() => {}}
        />
      ))}
    </div>
  ),
};

/** `fill`: the group takes its parent's width and the options share it, so the border ends at the last option. */
export const Fill: S = {
  render: () => {
    const [value, setValue] = useState("active");
    return (
      <div className="w-96">
        <SegmentedControl
          fill
          label="Status"
          items={[
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
            { value: "sold", label: "Sold" },
          ]}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};

const conditions = [
  { value: "new", label: "New with tags" },
  { value: "mint", label: "Like new, unworn" },
  { value: "good", label: "Good, light wear" },
  { value: "fair", label: "Fair, visible wear" },
  { value: "worn", label: "Worn, needs repair" },
];

/** `wrap`: five options wrap into full rows of 3 and 2 in a box, with a line between options. */
export const Wrap: S = {
  render: () => {
    const [value, setValue] = useState("good");
    return (
      <div className="w-80">
        <SegmentedControl
          wrap
          label="Condition"
          items={conditions}
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};

/** `wrap="narrow"`: the box while the group is under 32rem wide, a filled pill from 32rem up. */
export const WrapNarrow: S = {
  render: () => {
    const [value, setValue] = useState("good");
    return (
      <div className="flex flex-col items-start gap-6">
        <div className="w-80">
          <SegmentedControl
            wrap="narrow"
            label="Condition, narrow"
            items={conditions}
            value={value}
            onChange={setValue}
          />
        </div>
        <div className="w-[40rem]">
          <SegmentedControl
            wrap="narrow"
            label="Condition, wide"
            items={conditions}
            value={value}
            onChange={setValue}
          />
        </div>
      </div>
    );
  },
};
