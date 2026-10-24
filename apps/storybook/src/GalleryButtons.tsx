import { Button, ButtonGroup, ButtonLink, ColourSchemeToggle, IconButton } from "@hackcove/ui";

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

/** The Button rows of the Gallery: the variants, the sizes and the danger tone, the blocked and busy states, a ButtonLink and a ButtonGroup, then an IconButton and the ColourSchemeToggle. */
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
      </div>
      <ButtonGroup
        label="Quote actions"
        end={
          <ButtonLink href="#back" variant="ghost">
            Back
          </ButtonLink>
        }
      >
        <ButtonLink href="#new">New quote</ButtonLink>
        <ButtonLink href="#export" variant="outline" size="sm">
          Export
        </ButtonLink>
        <ButtonLink href="#discard" variant="outline" tone="danger" size="sm">
          Discard
        </ButtonLink>
      </ButtonGroup>
    </div>
  );
}
