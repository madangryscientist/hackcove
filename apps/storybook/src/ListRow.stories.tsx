import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Avatar, Body, Button, Caption, Card, IconButton, ListRow, Pill } from "@hackcove/ui";
import { samplePhoto } from "./samplePhoto";

const meta: Meta = { title: "UI/ListRow" };
export default meta;
type S = StoryObj;

export const Rows: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        <div>
          <ListRow trailing="R 9 500">Rent</ListRow>
          <ListRow divided trailing={<Pill tone="amber">due</Pill>}>
            Insurance
          </ListRow>
          <ListRow divided href="#status" trailing="3">
            A link row
          </ListRow>
        </div>
      </Card>
    </div>
  ),
};

function Collapsible() {
  const [open, setOpen] = useState(true);
  return (
    <Card flush>
      <ListRow
        divided
        expanded={open}
        aria-controls="monthly-plan"
        trailing="R 15 550"
        onClick={() => setOpen(!open)}
      >
        Monthly plan
      </ListRow>
      <div
        id="monthly-plan"
        hidden={!open}
        className="border-t border-slate-200/70 px-4 py-3 text-sm"
      >
        Rent, groceries and transport.
      </div>
    </Card>
  );
}

export const CollapsibleHeader: S = {
  render: () => (
    <div className="max-w-md">
      <Collapsible />
    </div>
  ),
};

/** `size="sm"`: dense padding, for a list that must fit more rows. */
export const Small: S = {
  render: () => (
    <div className="max-w-md">
      <Card size="sm" flush>
        <ListRow size="sm" trailing="R 9 500">
          Rent
        </ListRow>
        <ListRow size="sm" divided trailing="R 1 850">
          Transport
        </ListRow>
        <ListRow size="sm" divided href="#status" trailing="3">
          A link row
        </ListRow>
      </Card>
    </div>
  ),
};

/** `leading` before the label, and `selected` on the row whose detail is open: a violet fill. */
export const LeadingAndSelected: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        <ListRow leading={<Avatar name="Ada Lovelace" size="sm" />} trailing="3 builds">
          Ada Lovelace
        </ListRow>
        <ListRow
          divided
          selected
          leading={<Avatar name="Grace Hopper" size="sm" />}
          trailing="1 build"
        >
          Grace Hopper
        </ListRow>
        <ListRow divided href="#linus" leading={<Avatar name="Linus T" size="sm" />}>
          Linus T
        </ListRow>
      </Card>
    </div>
  ),
};

/** `focused` marks the row the keyboard cursor is on in a list the app moves through itself (arrow keys): an inset violet ring, apart from `selected`'s fill. */
export const Focused: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        <ListRow trailing="R 9 500">Rent</ListRow>
        <ListRow divided focused trailing="R 1 850">
          Transport
        </ListRow>
        <ListRow divided selected focused trailing="R 4 100">
          Groceries
        </ListRow>
      </Card>
    </div>
  ),
};

/** `leadingWidth="thumbnail"` gives `leading` a fixed 8rem box that sizes its image to it, for a row that shows a screenshot. The label may be a block: a title over a caption. */
export const Thumbnail: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        {["Dashboard", "Settings"].map((name, index) => (
          <ListRow
            key={name}
            divided={index > 0}
            href={`#${name.toLowerCase()}`}
            leadingWidth="thumbnail"
            leading={<img alt="" src={samplePhoto} />}
            trailing={<Pill tone="amber">changed</Pill>}
          >
            <Body as="p">{name}</Body>
            <Caption as="p">0.4% of pixels differ</Caption>
          </ListRow>
        ))}
      </Card>
    </div>
  ),
};

/** `static`: a row that is not a button or a link, so it can hold its own buttons. */
export const StaticWithActions: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        <ListRow
          static
          leading={<Avatar name="Ada Lovelace" size="sm" />}
          trailing={<Pill tone="slate">admin</Pill>}
        >
          Ada Lovelace
        </ListRow>
        <ListRow
          static
          divided
          leading={<Avatar name="Grace Hopper" size="sm" />}
          actions={
            <>
              <Button size="sm" variant="outline">
                Reject
              </Button>
              <Button size="sm">Accept</Button>
            </>
          }
        >
          Grace Hopper
        </ListRow>
        <ListRow
          static
          divided
          selected
          leading={<Avatar name="Linus T" size="sm" />}
          trailing="invited"
          actions={<Button size="sm">Resend</Button>}
        >
          Linus T
        </ListRow>
      </Card>
    </div>
  ),
};

/** `revealOnHover`: the actions show on hover or when focus is inside the row, and always on a touch screen. */
export const RevealOnHover: S = {
  render: () => (
    <div className="max-w-md">
      <Card flush>
        {["Rent", "Insurance", "Transport"].map((name, index) => (
          <ListRow
            key={name}
            static
            revealOnHover
            divided={index > 0}
            trailing="R 1 850"
            actions={<IconButton label={`Remove ${name}`}>×</IconButton>}
          >
            {name}
          </ListRow>
        ))}
      </Card>
    </div>
  ),
};

/** Rows sit in a `Card flush`, and `divided` draws the line between them on every row after the first. */
export const DoList: S = {
  render: () => (
    <Card flush>
      <ListRow trailing="R 9 500">Rent</ListRow>
      <ListRow divided trailing="R 1 850">
        Transport
      </ListRow>
      <ListRow divided href="#bills" trailing="3">
        Bills
      </ListRow>
    </Card>
  ),
};

/** Rows in a Card that is not `flush` sit inside its padding, so the hover fill stops short of the edges and the lines do not run across. */
export const DontList: S = {
  render: () => (
    <Card>
      <ListRow trailing="R 9 500">Rent</ListRow>
      <ListRow divided trailing="R 1 850">
        Transport
      </ListRow>
    </Card>
  ),
};

/** A row that holds its own buttons is `static`, and the buttons go in `actions`. */
export const DoRowActions: S = {
  render: () => (
    <Card flush>
      <ListRow
        static
        actions={
          <>
            <Button size="sm" variant="outline">
              Reject
            </Button>
            <Button size="sm">Accept</Button>
          </>
        }
      >
        Grace Hopper
      </ListRow>
    </Card>
  ),
};
