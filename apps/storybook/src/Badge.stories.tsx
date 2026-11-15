import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Cluster, IconButton, Pill } from "@hackcove/ui-react";

const meta: Meta = { title: "Content/Badge" };
export default meta;
type S = StoryObj;

export const Counts: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge count={1} />
      <Badge count={12} />
      <Badge count={99} />
      <Badge count={120} />
    </div>
  ),
};

export const OnAnIcon: S = {
  render: () => (
    <div className="flex items-center gap-4">
      <span className="relative inline-flex">
        <IconButton label="Alerts" icon="bell" />
        <Badge count={3} corner />
      </span>
      <span className="relative inline-flex">
        <IconButton label="Alerts" icon="bell" />
        <Badge count={120} corner />
      </span>
    </div>
  ),
};

/** `badge` on an `IconButton` pins the count to the corner and adds it to the button's name ("Alerts, 3"). */
export const DoOnIcon: S = {
  render: () => <IconButton label="Alerts" count={3} icon="bell" />,
};

/** A Pill beside the button is not pinned to it and a screen reader never hears it as part of the button. Use `badge`. */
export const DontOnIcon: S = {
  render: () => (
    <Cluster>
      <IconButton label="Alerts" icon="bell" />
      <Pill tone="danger" round>
        3
      </Pill>
    </Cluster>
  ),
};

/** On its own a Badge is a count; above 99 it reads `99+`. */
export const DoCount: S = {
  render: () => (
    <Cluster>
      <Badge count={7} />
      <Badge count={120} />
    </Cluster>
  ),
};

/** A count is not a `Pill`: a Pill is a status label, and it prints `120` where a Badge caps at `99+`. */
export const DontCount: S = {
  render: () => (
    <Cluster>
      <Pill>7</Pill>
      <Pill>120</Pill>
    </Cluster>
  ),
};
