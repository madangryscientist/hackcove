import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Cluster, IconButton, Pill } from "@hackcove/ui";

const meta: Meta = { title: "UI/Badge" };
export default meta;
type S = StoryObj;

const bellIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
    <path
      d="M10 2a5 5 0 0 0-5 5v2.6c0 .5-.2 1-.5 1.4L3.3 12.5a.75.75 0 0 0 .55 1.25
      h12.3a.75.75 0 0 0 .55-1.25L15.5 11a2 2 0 0 1-.5-1.4V7a5 5 0 0 0-5-5Z
      m-1.9 13.5a2 2 0 0 0 3.8 0H8.1Z"
    />
  </svg>
);

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
        <IconButton label="Alerts">{bellIcon}</IconButton>
        <Badge count={3} corner />
      </span>
      <span className="relative inline-flex">
        <IconButton label="Alerts">{bellIcon}</IconButton>
        <Badge count={120} corner />
      </span>
    </div>
  ),
};

/** `badge` on an `IconButton` pins the count to the corner and adds it to the button's name ("Alerts, 3"). */
export const DoOnIcon: S = {
  render: () => (
    <IconButton label="Alerts" badge={3}>
      <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path
          d="M10 2a5 5 0 0 0-5 5v2.6c0 .5-.2 1-.5 1.4L3.3 12.5a.75.75 0 0 0 .55 1.25
          h12.3a.75.75 0 0 0 .55-1.25L15.5 11a2 2 0 0 1-.5-1.4V7a5 5 0 0 0-5-5Z
          m-1.9 13.5a2 2 0 0 0 3.8 0H8.1Z"
        />
      </svg>
    </IconButton>
  ),
};

/** A Pill beside the button is not pinned to it and a screen reader never hears it as part of the button. Use `badge`. */
export const DontOnIcon: S = {
  render: () => (
    <Cluster>
      <IconButton label="Alerts">
        <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path
            d="M10 2a5 5 0 0 0-5 5v2.6c0 .5-.2 1-.5 1.4L3.3 12.5a.75.75 0 0 0 .55 1.25
            h12.3a.75.75 0 0 0 .55-1.25L15.5 11a2 2 0 0 1-.5-1.4V7a5 5 0 0 0-5-5Z
            m-1.9 13.5a2 2 0 0 0 3.8 0H8.1Z"
          />
        </svg>
      </IconButton>
      <Pill tone="red" round>
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
