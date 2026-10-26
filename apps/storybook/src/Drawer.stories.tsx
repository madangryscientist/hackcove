import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { Body, Button, Drawer, Field, Input, KeyValue, KeyValueList, Stack } from "@hackcove/ui";

const meta: Meta = { title: "UI/Drawer" };
export default meta;
type S = StoryObj;

/** Open when the story loads; Esc, the scrim or the close button closes it, and the button opens it again. */
function Opened({ children }: { children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open
      </Button>
      {open && children(() => setOpen(false))}
    </div>
  );
}

/** A record: facts in the body, with the actions pinned under it. */
export const Default: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Drawer
          title="HC-65 · Tabs"
          onClose={close}
          footer={
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>Save</Button>
            </>
          }
        >
          <KeyValueList>
            <KeyValue label="Status">In progress</KeyValue>
            <KeyValue label="Owner">Jacobus</KeyValue>
            <KeyValue label="Opened">24 Oct</KeyValue>
          </KeyValueList>
        </Drawer>
      )}
    </Opened>
  ),
};

/** A body taller than the screen scrolls between the header and the footer, which stay put. */
export const LongBody: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Drawer title="Activity" onClose={close} footer={<Button onClick={close}>Done</Button>}>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 40 }, (_, i) => (
              <Body key={i}>Entry {i + 1}: a line of activity in the log.</Body>
            ))}
          </div>
        </Drawer>
      )}
    </Opened>
  ),
};

export const Small: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Drawer title="Rename" size="sm" onClose={close}>
          <Field label="Name" htmlFor="drawer-name">
            <Input id="drawer-name" defaultValue="Hack Cove" />
          </Field>
        </Drawer>
      )}
    </Opened>
  ),
};

export const Large: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Drawer title="Compare" size="lg" onClose={close}>
          <Body>A wider panel for a table or a form with two columns.</Body>
        </Drawer>
      )}
    </Opened>
  ),
};

/** A record or a form beside the page: the title names it, the body scrolls and the actions stay pinned in `footer`. */
export const DoRecord: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open HC-65
        </Button>
        {open && (
          <Drawer
            title="HC-65 · Tabs"
            onClose={() => setOpen(false)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Save</Button>
              </>
            }
          >
            <KeyValueList>
              <KeyValue label="Status">In progress</KeyValue>
              <KeyValue label="Owner">Jacobus</KeyValue>
            </KeyValueList>
          </Drawer>
        )}
      </>
    );
  },
};

/** A yes-or-no question is a `Dialog`: a full-height panel for one confirmation is more than it asks. */
export const DontRecord: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Delete build
        </Button>
        {open && (
          <Drawer
            title="Delete build?"
            size="sm"
            onClose={() => setOpen(false)}
            footer={<Button onClick={() => setOpen(false)}>Delete</Button>}
          >
            <Body>This removes the build and every snapshot in it.</Body>
          </Drawer>
        )}
      </>
    );
  },
};

/** The actions go in `footer`, so Save stays in view while the body scrolls. */
export const DoFooter: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Rename
        </Button>
        {open && (
          <Drawer
            title="Rename"
            size="sm"
            onClose={() => setOpen(false)}
            footer={<Button onClick={() => setOpen(false)}>Save</Button>}
          >
            <Field label="Name" htmlFor="drawer-rename">
              <Input id="drawer-rename" defaultValue="Hack Cove" />
            </Field>
          </Drawer>
        )}
      </>
    );
  },
};

/** A Save in the body scrolls out of view with a long form and leaves the footer empty. */
export const DontFooter: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Rename
        </Button>
        {open && (
          <Drawer title="Rename" size="sm" onClose={() => setOpen(false)}>
            <Stack>
              <Field label="Name" htmlFor="drawer-rename-body">
                <Input id="drawer-rename-body" defaultValue="Hack Cove" />
              </Field>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </Stack>
          </Drawer>
        )}
      </>
    );
  },
};
