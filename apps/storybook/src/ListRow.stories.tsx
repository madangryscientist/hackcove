import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Avatar, Button, Card, IconButton, ListRow, Pill } from "@hackcove/ui";

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
