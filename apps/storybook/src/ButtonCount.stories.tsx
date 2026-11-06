import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@hackcove/ui-react";

const meta: Meta = { title: "Actions/Button" };
export default meta;
type S = StoryObj;

function SplitsToggle() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="ghost"
        size="sm"
        count={3}
        aria-expanded={open}
        aria-controls="splits-panel"
        onClick={() => setOpen(!open)}
      >
        Splits
      </Button>
      {open && (
        <p id="splits-panel" className="text-sm text-slate-600">
          Groceries R 220.00 · Household R 99.00 · Fuel R 30.00
        </p>
      )}
    </div>
  );
}

/** `count` puts a number chip after the label, in the button's own colour: how many are behind it. The chip is part of the name ("Splits, 3"); a button that opens something also takes `aria-expanded` and `aria-controls`, the caller owning the state. */
export const WithCount: S = {
  render: () => (
    <div className="flex flex-col gap-4">
      <SplitsToggle />
      <div className="flex flex-wrap items-center gap-2">
        <Button count={12}>Review</Button>
        <Button variant="outline" count={3}>
          Comments
        </Button>
        <Button variant="ghost" count={0}>
          Splits
        </Button>
        <Button variant="outline" size="sm" tone="danger" count={2}>
          Failed
        </Button>
        <Button variant="outline" size="sm" pressed count={8}>
          Open
        </Button>
        <Button variant="link" count={5}>
          Notes
        </Button>
        <Button size="lg" variant="outline" count={4}>
          Drafts
        </Button>
        <Button href="#comments" variant="outline" size="sm" count={7}>
          Comments
        </Button>
      </div>
    </div>
  ),
};
