import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { Body, Button, Drawer, Field, Input, KeyValue, KeyValueList } from "@hackcove/ui";

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
