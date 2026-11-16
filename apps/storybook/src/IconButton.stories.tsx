import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, IconButton } from "@hackcove/ui-react";

const meta: Meta = { title: "Actions/IconButton" };
export default meta;
type S = StoryObj;

/** `label` names the button for a screen reader and shows as its tooltip; the icon is only decoration. */
export const DoLabel: S = {
  render: () => <IconButton label="Delete quote" tone="danger" variant="ghost" icon="close" />,
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
  render: () => <IconButton label="Alerts" count={3} icon="bell" />,
};

/** A count typed into the label shows only in the tooltip, so a sighted user never sees it on the button. */
export const DontBadge: S = {
  render: () => <IconButton label="Alerts (3)" icon="bell" />,
};

/** Going to another page is `href`: the same look on a real anchor, with middle-click and the URL. */
export const DoNavigate: S = {
  render: () => <IconButton href="#settings" label="Settings" variant="ghost" icon="settings" />,
};

/** A button that sets `location` loses middle-click, the status-bar URL and crawlability. */
export const DontNavigate: S = {
  render: () => (
    <IconButton
      label="Settings"
      variant="ghost"
      onClick={() => location.assign("#settings")}
      icon="settings"
    />
  ),
};

export const Default: S = {
  render: () => <IconButton label="Switch to dark theme" icon="theme" />,
};
export const Disabled: S = {
  render: () => <IconButton label="Switch to dark theme" disabled icon="theme" />,
};
/** `variant="ghost"` has no border until the hover fill; `tone="danger"` is red. */
export const GhostAndDanger: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton label="Switch to dark theme" variant="ghost" icon="theme" />
      <IconButton label="Delete" tone="danger" icon="theme" />
      <IconButton label="Delete" variant="ghost" tone="danger" icon="theme" />
      <IconButton label="Delete" variant="ghost" tone="danger" disabled icon="theme" />
    </div>
  ),
};

/** `href` draws a link with the button's look; an in-app one goes through the app's router `<Link>`. */
export const AsLink: S = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton href="#settings" label="Settings" variant="ghost" icon="theme" />
      <IconButton href="/settings" label="Settings" icon="theme" />
    </div>
  ),
};

/** `badge` pins a red count to the corner, on a button or a link; `label` names the count for a screen reader. Not shown at 0. */
export const Badged: S = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton label="Alerts" count={3} icon="theme" />
      <IconButton href="#alerts" label="Alerts" variant="ghost" count={120} icon="theme" />
      <IconButton href="#alerts" label="Alerts" count={0} icon="theme" />
    </div>
  ),
};

/** `sm` 26px, `md` 38px (the default) and `lg` 46px: each as tall as a `Button` of the size. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <IconButton size={size} label={`Switch to dark theme, ${size}`} icon="theme" />
          <Button size={size} variant="outline">
            Button {size}
          </Button>
        </div>
      ))}
    </div>
  ),
};

/** The tooltip: `label` shows above the button on hover and on keyboard focus. Held open by focusing it. */
export const Tooltip: S = {
  render: () => (
    <div className="px-6 pt-14 pb-6">
      <IconButton label="Settings" variant="ghost" icon="settings" />
    </div>
  ),
  play: ({ canvasElement }) => {
    canvasElement.querySelector("button")?.focus();
  },
};
