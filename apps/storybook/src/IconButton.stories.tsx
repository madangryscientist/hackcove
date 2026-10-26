import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, IconButton, type LinkRenderProps } from "@hackcove/ui";

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

const meta: Meta = { title: "UI/IconButton" };
export default meta;
type S = StoryObj;

/** `label` names the button for a screen reader and shows as its tooltip; the icon is only decoration. */
export const DoLabel: S = {
  render: () => (
    <IconButton label="Delete quote" tone="danger" variant="ghost">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </IconButton>
  ),
};

/** A `Button` holding a glyph has no accessible name, no tooltip and the wrong box; an icon-only action is an `IconButton`. */
export const DontLabel: S = {
  render: () => (
    <Button variant="ghost" tone="danger" size="sm">
      <span aria-hidden="true">x</span>
    </Button>
  ),
};

/** `badge` pins the count to the corner and adds it to the accessible name ("Alerts, 3"). */
export const DoBadge: S = {
  render: () => (
    <IconButton label="Alerts" badge={3}>
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2ZM10 21h4" />
      </svg>
    </IconButton>
  ),
};

/** A count typed into the label shows only in the tooltip, so a sighted user never sees it on the button. */
export const DontBadge: S = {
  render: () => (
    <IconButton label="Alerts (3)">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2ZM10 21h4" />
      </svg>
    </IconButton>
  ),
};

/** Going to another page is `href`: the same look on a real anchor, with middle-click and the URL. */
export const DoNavigate: S = {
  render: () => (
    <IconButton href="#settings" label="Settings" variant="ghost">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="8" cy="16" r="2" />
      </svg>
    </IconButton>
  ),
};

/** A button that sets `location` loses middle-click, the status-bar URL and crawlability. */
export const DontNavigate: S = {
  render: () => (
    <IconButton label="Settings" variant="ghost" onClick={() => location.assign("#settings")}>
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="8" cy="16" r="2" />
      </svg>
    </IconButton>
  ),
};

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
