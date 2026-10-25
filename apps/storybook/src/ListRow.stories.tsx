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
          <ListRow
            className="border-t border-slate-200/70"
            trailing={<Pill tone="amber">due</Pill>}
          >
            Insurance
          </ListRow>
          <ListRow className="border-t border-slate-200/70" href="#status" trailing="3">
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
        className="border-t border-slate-200/70"
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
