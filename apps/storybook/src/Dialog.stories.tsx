import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type MouseEvent, type ReactNode } from "react";
import {
  Button,
  Callout,
  Dialog,
  Field,
  Input,
  Kbd,
  KeyValue,
  KeyValueList,
  Stack,
  Text,
} from "@slashsuite/ui-react";
import { sampleScenes } from "./sampleScene";

const meta: Meta = { title: "Feedback/Dialog" };
export default meta;
type S = StoryObj;

/** Close through the `<dialog>` so it animates out; `onClose` then unmounts it. Setting the parent's state here would cut the exit animation short. */
const closeDialog = (event: MouseEvent<HTMLElement>) =>
  event.currentTarget.closest("dialog")?.close();

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
              <Button variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={closeDialog}>Delete</Button>
            </>
          }
        >
          <Text>There is no undo. Reviews already recorded stay in the audit log.</Text>
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
          width="sm"
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

/** A confirmation is a title that names the action, one line of consequence, and Cancel beside the action. It is rendered only while open. */
export const DoConfirm: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Delete build
        </Button>
        {open && (
          <Dialog
            title="Delete build"
            description="This removes the build and every snapshot in it."
            onClose={() => setOpen(false)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button tone="danger" onClick={() => setOpen(false)}>
                  Delete
                </Button>
              </>
            }
          />
        )}
      </>
    );
  },
};

/** With no Cancel and no consequence, the only way out of the dialog is the one button that destroys the build. */
export const DontConfirm: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Delete build
        </Button>
        {open && (
          <Dialog
            title="Are you sure?"
            onClose={() => setOpen(false)}
            footer={
              <Button tone="danger" onClick={() => setOpen(false)}>
                Delete
              </Button>
            }
          />
        )}
      </>
    );
  },
};

/** A result that needs no answer is a `Callout` in the page, where it does not take the page away. */
export const DoNotice: S = {
  render: () => (
    <Stack gap="sm">
      <Button variant="outline">Save</Button>
      <Callout tone="positive">Your review is saved.</Callout>
    </Stack>
  ),
};

/** A modal for a message makes the reader dismiss it before they can carry on. */
export const DontNotice: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Save
        </Button>
        {open && (
          <Dialog
            title="Saved"
            description="Your review is saved."
            onClose={() => setOpen(false)}
            footer={<Button onClick={() => setOpen(false)}>OK</Button>}
          />
        )}
      </>
    );
  },
};

/** The fields and buttons in one form, from the Dialog's `onSubmit`, Cancel then Create: Create or Enter in a field submits, and a failed submit is the Dialog's `error`, above the buttons. */
export const DoForm: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | undefined>();
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          New flag
        </Button>
        {open && (
          <Dialog
            title="New flag"
            onClose={() => setOpen(false)}
            onSubmit={() => setError("Could not create the flag: the key is taken.")}
            error={error}
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </>
            }
          >
            <Stack>
              <Field label="Key">
                <Input defaultValue="new-checkout" />
              </Field>
              <Field label="Name">
                <Input defaultValue="New checkout" />
              </Field>
            </Stack>
          </Dialog>
        )}
      </>
    );
  },
};

/** A form id in the body, a `form` attribute on the button, and a hand-made error line under the fields, away from the button that was pressed. */
export const DontForm: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          New flag
        </Button>
        {open && (
          <Dialog
            title="New flag"
            onClose={() => setOpen(false)}
            footer={
              <Button type="submit" form="new-flag-form">
                Create
              </Button>
            }
          >
            <form id="new-flag-form" onSubmit={(event) => event.preventDefault()}>
              <Stack>
                <Field label="Key">
                  <Input defaultValue="new-checkout" />
                </Field>
                <Text tone="danger">Could not create the flag: the key is taken.</Text>
              </Stack>
            </form>
          </Dialog>
        )}
      </>
    );
  },
};

/** `size="lg"` (640px): a wider form or a table. `sm` is 320px and `md`, the default, 440px. */
export const Large: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog
          title="Import statement"
          description="Check the rows before they are added."
          width="lg"
          onClose={close}
          footer={
            <>
              <Button variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={closeDialog}>Import</Button>
            </>
          }
        >
          <KeyValueList>
            <KeyValue label="Rows">42</KeyValue>
            <KeyValue label="Skipped">3</KeyValue>
          </KeyValueList>
        </Dialog>
      )}
    </Opened>
  ),
};

/**
 * `size="full"`: the whole screen, for media or a player. The body takes the height between the
 * header and the footer, and there is no backdrop to click, so the footer holds a close action
 * on a `method="dialog"` form.
 */
export const Full: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog
          title="Harbour at dusk"
          description="Anna · Today, 09:12"
          width="full"
          onClose={close}
          footer={
            <form method="dialog">
              <Button type="submit" variant="outline" autoFocus>
                Close
              </Button>
            </form>
          }
        >
          <Stack gap="sm">
            <img src={sampleScenes[0]?.src} alt={sampleScenes[0]?.alt} />
            <Text>{sampleScenes[0]?.caption}</Text>
          </Stack>
        </Dialog>
      )}
    </Opened>
  ),
};
