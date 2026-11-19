import { useState } from "react";
import { Card, ListRow } from "@slashsuite/ui-react";

export function Collapsible() {
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
