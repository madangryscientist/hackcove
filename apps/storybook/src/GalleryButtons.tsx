import { Button, ButtonGroup, ColourSchemeToggle, IconButton } from "@hackcove/ui";

const moonIcon = (
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

/** The Button rows of the Gallery: the variants, a full-width dashed one, the sizes, the positive and danger tones, a pressed toggle, the blocked and busy states, a Button that is a link and a ButtonGroup, then an IconButton (ghost, danger) and the ColourSchemeToggle. */
export function GalleryButtons() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="link">Edit</Button>
        <Button disabledReason="Pick a shop first">Blocked</Button>
        <Button variant="outline" busy busyLabel="Saving…">
          Busy
        </Button>
        <IconButton label="Switch to dark theme">{moonIcon}</IconButton>
        <ColourSchemeToggle />
      </div>
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
        <Button tone="danger">Delete</Button>
        <Button tone="danger" variant="outline">
          Clear
        </Button>
        <Button tone="danger" variant="ghost">
          Remove
        </Button>
        <Button size="sm" tone="danger" variant="link">
          Remove
        </Button>
        <Button tone="positive">Accept</Button>
        <Button tone="positive" variant="outline">
          Accept
        </Button>
        <Button variant="outline" pressed>
          Pressed
        </Button>
        <Button variant="outline" tone="danger" pressed>
          Pressed
        </Button>
        <IconButton label="Switch to dark theme" variant="ghost">
          {moonIcon}
        </IconButton>
        <IconButton label="Delete" variant="ghost" tone="danger">
          {moonIcon}
        </IconButton>
        <IconButton label="Delete" tone="danger">
          {moonIcon}
        </IconButton>
      </div>
      <div className="max-w-sm">
        <Button variant="dashed">
          <span aria-hidden="true">+</span> Add a line
        </Button>
      </div>
      <ButtonGroup
        label="Quote actions"
        end={
          <Button href="#back" variant="ghost">
            Back
          </Button>
        }
      >
        <Button href="#new">New quote</Button>
        <Button href="#export" variant="outline" size="sm">
          Export
        </Button>
        <Button href="#discard" variant="outline" tone="danger" size="sm">
          Discard
        </Button>
      </ButtonGroup>
    </div>
  );
}
