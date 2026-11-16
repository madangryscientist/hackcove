import { Button, ButtonGroup, ColourSchemeToggle, IconButton, Menu } from "@hackcove/ui-react";

const noop = () => undefined;

/** The full-width dashed Button, then buttons with a `count` chip: a ghost toggle that opens something, an outline and a pressed one. */
function DashedAndCountButtons() {
  return (
    <>
      <div className="max-w-sm">
        <Button variant="dashed" icon="plus">
          Add a line
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" count={3} aria-expanded={false}>
          Splits
        </Button>
        <Button variant="outline" count={12}>
          Comments
        </Button>
        <Button variant="outline" size="sm" pressed count={8}>
          Open
        </Button>
      </div>
    </>
  );
}

/** The Button rows of the Gallery: the variants, a full-width dashed one, the sizes, the positive and danger tones, a pressed toggle, buttons with a `count` chip, the blocked and busy states, a Button that is a link and a ButtonGroup, then an IconButton (ghost, danger), the ColourSchemeToggle and two closed Menus (the overflow icon and a button trigger). */
export function GalleryButtons() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="link">Edit</Button>
        <Button disabledReason="Pick a shop first">Blocked</Button>
        <Button variant="outline" busy="Saving…">
          Busy
        </Button>
        <IconButton label="Switch to dark theme" icon="theme" />
        <ColourSchemeToggle />
        <Menu
          label="More actions"
          items={[
            { label: "Favourite", onSelect: noop },
            { label: "Hide", tone: "danger", onSelect: noop },
          ]}
        />
        <Menu trigger="button" label="Export" items={[{ label: "As CSV", onSelect: noop }]} />
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
        <IconButton label="Switch to dark theme" variant="ghost" icon="theme" />
        <IconButton label="Delete" variant="ghost" tone="danger" icon="theme" />
        <IconButton label="Delete" tone="danger" icon="theme" />
      </div>
      <DashedAndCountButtons />
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
