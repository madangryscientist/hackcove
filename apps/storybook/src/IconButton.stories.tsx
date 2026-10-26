import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton, type LinkRenderProps } from "@hackcove/ui";

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

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

/** `href` draws a link with the button's look; `render` draws the app's router `<Link>`. */
export const AsLink: S = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton href="#settings" label="Settings" variant="ghost">
        {moon}
      </IconButton>
      <IconButton render={(p) => <FakeLink to="/settings" {...p} />} label="Settings">
        {moon}
      </IconButton>
    </div>
  ),
};

/** `badge` pins a red count to the corner, on a button or a link; `label` names the count for a screen reader. Not shown at 0. */
export const Badged: S = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton label="Alerts" badge={3}>
        {moon}
      </IconButton>
      <IconButton href="#alerts" label="Alerts" variant="ghost" badge={120}>
        {moon}
      </IconButton>
      <IconButton href="#alerts" label="Alerts" badge={0}>
        {moon}
      </IconButton>
    </div>
  ),
};
