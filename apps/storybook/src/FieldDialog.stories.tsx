import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Dialog, Field, FieldDialog, Input } from "@hackcove/ui";

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

/** One value to ask for is a `FieldDialog`: it blocks an empty submit, shows the busy state and puts a rejection under the field. */
export const DoOneField: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          New project
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
            onSubmit={() => new Promise((resolve) => setTimeout(resolve, 600))}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  },
};

/** A `Dialog` with a hand-built field has no empty check, no busy state and no error line, and each copy drifts from the next. */
export const DontOneField: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          New project
        </Button>
        {open && (
          <Dialog
            title="New project"
            onClose={() => setOpen(false)}
            footer={<Button onClick={() => setOpen(false)}>Create</Button>}
          >
            <Field label="Name" htmlFor="project-name">
              <Input id="project-name" placeholder="my-project" />
            </Field>
          </Dialog>
        )}
      </>
    );
  },
};
