import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Dialog, Field, FieldDialog, Input } from "@hackcove/ui-react";

const meta: Meta = { title: "Feedback/FieldDialog" };
export default meta;
type S = StoryObj;

/** A submit that never settles: the dialog stays on its busy state until Cancel or Esc. */
const never = () => new Promise<never>(() => {});

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

/** Empty: the Create button is blocked and the hint says why. A submit stays busy until Cancel. */
export const Default: S = {
  render: () => <Opened onSubmit={never} />,
};
/** A name typed and submitted, the submit still pending: the button shows its busy label. */
export const Pending: S = {
  render: () => <Opened onSubmit={never} />,
  play: async ({ canvasElement }) => {
    const field = canvasElement.ownerDocument.querySelector<HTMLInputElement>("dialog[open] input");
    if (!field) throw new Error("no open FieldDialog");
    Reflect.set(HTMLInputElement.prototype, "value", "my-project", field);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    // React flushes that input's update in a microtask queued before this one: the submit is enabled.
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    field.form?.requestSubmit();
  },
};
/** Type a name and submit: the dialog closes. */
export const Resolves: S = {
  render: () => <Opened onSubmit={() => Promise.resolve()} />,
};
/** Submit rejects: the message replaces the hint as the field's error and the dialog stays open. */
export const Rejects: S = {
  render: () => <Opened onSubmit={() => Promise.reject(new Error("That name is taken."))} />,
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
            onSubmit={() => Promise.resolve()}
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
