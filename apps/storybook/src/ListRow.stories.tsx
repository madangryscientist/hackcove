import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Card, ListRow, Pill } from "@hackcove/ui";

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
