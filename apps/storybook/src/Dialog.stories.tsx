import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { Body, Button, Dialog, Kbd, KeyValue, KeyValueList } from "@hackcove/ui";

const meta: Meta = { title: "UI/Dialog" };
export default meta;
type S = StoryObj;

/** Open when the story loads; Esc or the backdrop closes it, and the button opens it again. */
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

export const Default: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog
          title="Delete build"
          description="This removes the build and every snapshot in it."
          onClose={close}
          footer={
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>Delete</Button>
            </>
          }
        >
          <Body>There is no undo. Reviews already recorded stay in the audit log.</Body>
        </Dialog>
      )}
    </Opened>
  ),
};

/** The shortcut list: a small dialog with a body and one Close button on a `method="dialog"` form. */
export const Small: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog
          title="Keyboard shortcuts"
          size="sm"
          onClose={close}
          footer={
            <form method="dialog">
              <Button type="submit" variant="outline" autoFocus>
                Close
              </Button>
            </form>
          }
        >
          <KeyValueList>
            <KeyValue label="Next shot">
              <Kbd>j</Kbd>
            </KeyValue>
            <KeyValue label="Previous shot">
              <Kbd>k</Kbd>
            </KeyValue>
            <KeyValue label="Approve">
              <Kbd>a</Kbd>
            </KeyValue>
          </KeyValueList>
        </Dialog>
      )}
    </Opened>
  ),
};

export const TitleOnly: S = {
  render: () => <Opened>{(close) => <Dialog title="Saved" onClose={close} />}</Opened>,
};
