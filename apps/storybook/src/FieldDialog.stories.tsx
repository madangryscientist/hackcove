import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, FieldDialog } from "@hackcove/ui";

const meta: Meta = { title: "UI/FieldDialog" };
export default meta;
type S = StoryObj;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Open when the story loads; the button opens it again after it closes. */
function Opened({ onSubmit }: { onSubmit: (value: string) => Promise<unknown> }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open
      </Button>
      {open && (
        <FieldDialog
          title="New project"
          description="Projects hold your builds and their reviews."
          label="Name"
          inputLabel="Project name"
          placeholder="my-project"
          hint="Letters, numbers and dashes."
          emptyReason="Type a name first."
          submit="Create"
          busyLabel="Creating…"
          onSubmit={onSubmit}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/** Empty: the Create button is blocked and the hint says why. */
export const Default: S = {
  render: () => <Opened onSubmit={() => wait(600)} />,
};
/** Type a name and submit: the button shows its busy label, then the dialog closes. */
export const Resolves: S = {
  render: () => <Opened onSubmit={() => wait(1500)} />,
};
/** Submit rejects: the message replaces the hint as the field's error and the dialog stays open. */
export const Rejects: S = {
  render: () => (
    <Opened
      onSubmit={() => wait(300).then(() => Promise.reject(new Error("That name is taken.")))}
    />
  ),
};
