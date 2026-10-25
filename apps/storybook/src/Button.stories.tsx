import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonGroup, ButtonLink, buttonClass, type LinkRenderProps } from "@hackcove/ui";

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

const meta: Meta = { title: "UI/Button" };
export default meta;
type S = StoryObj;

/** One primary action per view, with the quieter variants beside it. */
export const Default: S = {
  render: () => (
    <ButtonGroup label="Quote actions">
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
    </ButtonGroup>
  ),
};

/** One primary action per view: the quieter variants carry the rest. */
export const DoOnePrimary: S = {
  render: () => (
    <ButtonGroup>
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
    </ButtonGroup>
  ),
};

/** Two primaries compete for the eye, and nobody can tell which action the view is about. */
export const DontOnePrimary: S = {
  render: () => (
    <ButtonGroup>
      <Button>Save</Button>
      <Button>Save and close</Button>
    </ButtonGroup>
  ),
};

/** `disabledReason` greys the button and shows the reason on hover. */
export const DoDisabledReason: S = {
  render: () => <Button disabledReason="Pick a shop first">Save</Button>,
};

/** A bare `disabled` leaves the user guessing why nothing happens. */
export const DontDisabledReason: S = {
  render: () => <Button disabled>Save</Button>,
};

/** Going to another page is a link: `ButtonLink` keeps the anchor, middle-click and the URL. */
export const DoNavigate: S = {
  render: () => (
    <ButtonLink href="#quotes" variant="outline">
      Open quotes
    </ButtonLink>
  ),
};

/** A button that sets `location` loses middle-click, the status-bar URL and crawlability. */
export const DontNavigate: S = {
  render: () => (
    <Button variant="outline" onClick={() => location.assign("#quotes")}>
      Open quotes
    </Button>
  ),
};

export const Variants: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="link">Edit</Button>
    </div>
  ),
};
export const Small: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Save</Button>
      <Button size="sm" variant="outline">
        Cancel
      </Button>
      <Button size="sm" variant="ghost">
        Skip
      </Button>
      <Button size="sm" variant="link">
        Edit
      </Button>
      <Button size="sm" tone="danger" variant="outline">
        Remove
      </Button>
    </div>
  ),
};
export const Danger: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button tone="danger">Delete</Button>
      <Button tone="danger" variant="outline">
        Clear
      </Button>
      <Button tone="danger" variant="ghost">
        Remove
      </Button>
      <Button tone="danger" variant="link">
        Remove
      </Button>
      <Button tone="danger" size="sm">
        Delete
      </Button>
      <Button tone="danger" disabledReason="Nothing to delete">
        Blocked
      </Button>
      <Button tone="danger" busy busyLabel="Deleting…">
        Delete
      </Button>
    </div>
  ),
};
/** No box: text with an underline on hover, for an action inside a sentence or a table cell. */
export const LinkLook: S = {
  render: () => (
    <p className="max-w-xl text-sm text-slate-700">
      Row 14 of 90.{" "}
      <Button variant="link" size="sm">
        Edit
      </Button>{" "}
      <Button variant="link" size="sm" tone="danger">
        Remove
      </Button>{" "}
      <Button variant="link" size="sm" disabledReason="Already archived">
        Archive
      </Button>
    </p>
  ),
};
export const Disabled: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button disabled>Save</Button>
      <Button variant="outline" disabled>
        Cancel
      </Button>
      <Button variant="ghost" disabled>
        Skip
      </Button>
    </div>
  ),
};
export const Blocked: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button disabledReason="Pick a shop first">Save</Button>
      <Button variant="outline" disabledReason="Pick a shop first">
        Cancel
      </Button>
      <Button variant="ghost" disabledReason="Pick a shop first">
        Skip
      </Button>
    </div>
  ),
};
export const Busy: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button busy busyLabel="Saving…">
        Save
      </Button>
      <Button variant="outline" busy busyLabel="Cancelling…">
        Cancel
      </Button>
      <Button variant="ghost" busy>
        Skip
      </Button>
    </div>
  ),
};
export const AsLink: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <a href="#" className={buttonClass("outline")}>
        List your shop
      </a>
      <ButtonLink href="#" variant="outline" size="sm">
        List your shop
      </ButtonLink>
      <ButtonLink href="https://example.com" external tone="danger" variant="ghost">
        External
      </ButtonLink>
    </div>
  ),
};
/** `render` draws the app's own router Link; here a stand-in. No router lives in @hackcove/ui. */
export const WithRouterLink: S = {
  render: () => (
    <ButtonLink render={(props) => <FakeLink to="/quotes" {...props} />}>New quote</ButtonLink>
  ),
};
