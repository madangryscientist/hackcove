import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "@hackcove/ui";

const meta: Meta = { title: "UI/IconButton" };
export default meta;
type S = StoryObj;

const moon = (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);

export const Default: S = {
  render: () => <IconButton label="Switch to dark theme">{moon}</IconButton>,
};
export const Disabled: S = {
  render: () => (
    <IconButton label="Switch to dark theme" disabled>
      {moon}
    </IconButton>
  ),
};
/** `variant="ghost"` has no border until the hover fill; `tone="danger"` is red. */
export const GhostAndDanger: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton label="Switch to dark theme" variant="ghost">
        {moon}
      </IconButton>
      <IconButton label="Delete" tone="danger">
        {moon}
      </IconButton>
      <IconButton label="Delete" variant="ghost" tone="danger">
        {moon}
      </IconButton>
      <IconButton label="Delete" variant="ghost" tone="danger" disabled>
        {moon}
      </IconButton>
    </div>
  ),
};
