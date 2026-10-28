import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ButtonGroup, type LinkRenderProps } from "@hackcove/ui";

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

/** Going to another page is a link: `Button` with `href` keeps the anchor, middle-click and the URL. */
export const DoNavigate: S = {
  render: () => (
    <Button href="#quotes" variant="outline">
      Open quotes
    </Button>
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

/** A destructive action is `tone="danger"`, so the red says what the button does before it is read. */
export const DoDestructive: S = {
  render: () => (
    <ButtonGroup>
      <Button tone="danger">Delete quote</Button>
      <Button variant="outline">Cancel</Button>
    </ButtonGroup>
  ),
};

/** A delete in the primary look reads as the safe, expected action; the tone is what warns. */
export const DontDestructive: S = {
  render: () => (
    <ButtonGroup>
      <Button>Delete quote</Button>
      <Button variant="outline">Cancel</Button>
    </ButtonGroup>
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
/** `variant="dashed"`: a dashed outline in muted text that fills its container, like a dashed Card: the "add another" row at the foot of a list. A leading icon is just a child. */
export const Dashed: S = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-2">
      <Button variant="dashed">Add a budget line</Button>
      <Button variant="dashed" size="sm">
        <span aria-hidden="true">+</span> Add a category
      </Button>
      <Button variant="dashed" disabledReason="Pick a month first">
        Add a line
      </Button>
      <Button variant="dashed" busy busyLabel="Adding…">
        Add a line
      </Button>
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
/** `tone="positive"` is green, for accept and approve. Pair it with a red-outline reject. */
export const Positive: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button tone="positive">Accept</Button>
      <Button tone="positive" variant="outline">
        Accept
      </Button>
      <Button tone="positive" variant="ghost">
        Accept
      </Button>
      <Button tone="positive" variant="link">
        Accept
      </Button>
      <Button tone="positive" size="sm">
        Accept
      </Button>
      <Button tone="positive" disabledReason="Nothing to accept">
        Blocked
      </Button>
      <Button tone="positive" busy busyLabel="Accepting…">
        Accept
      </Button>
    </div>
  ),
};
/** The review bar: Accept and Reject side by side. */
export const ReviewBar: S = {
  render: () => (
    <ButtonGroup label="Review">
      <Button tone="positive" size="sm">
        Accept
      </Button>
      <Button tone="danger" variant="outline" size="sm">
        Reject
      </Button>
    </ButtonGroup>
  ),
};
/** `pressed` makes a toggle on the outline and ghost variants: `aria-pressed`, neutral when off and the tone's primary fill when on. */
export const Pressed: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" pressed={false}>
        Flag
      </Button>
      <Button variant="outline" pressed>
        Flag
      </Button>
      <Button variant="ghost" pressed>
        Flag
      </Button>
      <Button variant="outline" tone="positive" pressed>
        Accepted
      </Button>
      <Button variant="outline" tone="danger" pressed>
        Rejected
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
    <div className="flex flex-col gap-3">
      {(["default", "positive", "danger"] as const).map((tone) => (
        <div key={tone} className="flex flex-wrap items-center gap-2">
          <Button tone={tone} disabled>
            Save
          </Button>
          <Button tone={tone} variant="outline" disabled>
            Cancel
          </Button>
          <Button tone={tone} variant="ghost" disabled>
            Skip
          </Button>
          <Button tone={tone} variant="link" disabled>
            Edit
          </Button>
        </div>
      ))}
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
      <Button href="#" variant="outline">
        List your shop
      </Button>
      <Button href="#" variant="outline" size="sm">
        List your shop
      </Button>
      <Button href="https://example.com" external tone="danger" variant="ghost">
        External
      </Button>
    </div>
  ),
};
/** `render` draws the app's own router Link; here a stand-in. No router lives in @hackcove/ui. */
export const WithRouterLink: S = {
  render: () => <Button render={(props) => <FakeLink to="/quotes" {...props} />}>New quote</Button>,
};

/** `sm`, `md` (the default) and `lg`: the one size scale every control shares. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Button key={size} size={size}>
          Save {size}
        </Button>
      ))}
      {(["sm", "md", "lg"] as const).map((size) => (
        <Button key={size} href="#quotes" size={size} variant="outline">
          Quotes {size}
        </Button>
      ))}
    </div>
  ),
};
