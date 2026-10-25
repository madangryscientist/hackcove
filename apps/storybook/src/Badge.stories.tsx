import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, IconButton } from "@hackcove/ui";

const meta: Meta = { title: "UI/Badge" };
export default meta;
type S = StoryObj;

const bellIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
    <path d="M10 2a5 5 0 0 0-5 5v2.6c0 .5-.2 1-.5 1.4L3.3 12.5a.75.75 0 0 0 .55 1.25h12.3a.75.75 0 0 0 .55-1.25L15.5 11a2 2 0 0 1-.5-1.4V7a5 5 0 0 0-5-5Zm-1.9 13.5a2 2 0 0 0 3.8 0H8.1Z" />
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
