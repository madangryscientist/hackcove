import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { Button, Dialog, Field, Input, Stack, Text } from "@hackcove/ui-react";

const meta: Meta = { title: "Feedback/Dialog" };
export default meta;
type S = StoryObj;

/** Close through the `<dialog>` so it animates out; `onClose` then unmounts it. */
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

/** A tall body of plain text. */
const terms = Array.from(
  { length: 14 },
  (_, i) =>
    `${i + 1}. A build keeps its snapshots until it is deleted, and a review is recorded against the snapshot it was made on. Deleting a project removes its builds, and the audit log keeps who did it and when.`,
);

const cancelAndAccept = (
  <>
    <Button variant="ghost" onClick={closeDialog}>
      Cancel
    </Button>
    <Button onClick={closeDialog}>Accept</Button>
  </>
);

/**
 * A tall body scrolls inside the dialog: the title, description and footer stay on screen, and the
 * body takes a tab stop (it holds nothing focusable) so the arrow keys scroll it.
 */
export const Tall: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog
          title="Terms of service"
          description="Read to the end before you accept."
          onClose={close}
          footer={cancelAndAccept}
        >
          <Stack gap="sm">
            {terms.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </Stack>
        </Dialog>
      )}
    </Opened>
  ),
};

/** A tall form: the first field still has focus on open, and the body scrolls to the rest. */
export const TallForm: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog
          title="New segment"
          description="A segment is a saved filter over your users."
          onClose={close}
          footer={cancelAndAccept}
        >
          <Stack gap="sm">
            {["Name", "Owner", "Country", "Plan", "Source", "Campaign", "Medium", "Notes"].map(
              (label) => (
                <Field key={label} label={label} htmlFor={`segment-${label}`}>
                  <Input id={`segment-${label}`} />
                </Field>
              ),
            )}
          </Stack>
        </Dialog>
      )}
    </Opened>
  ),
};

/**
 * Focus a field once the dialog is open and the fonts have settled: `autoFocus` runs before
 * `showModal()`, which then focuses the first field, and a text reflow after the scroll would
 * leave the field short of the body's edge.
 */
function FocusOnOpen({ label }: { label: string }) {
  useEffect(() => {
    void document.fonts.ready.then(() =>
      document.querySelector<HTMLElement>(`dialog [aria-label="${label}"]`)?.focus(),
    );
  }, [label]);
  return null;
}

/**
 * The last field of the scrolling body is focused, so the body is scrolled to its bottom edge. The
 * body clips what paints outside it, so its padding keeps the whole outline in view.
 */
export const FocusAtTheBottom: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog title="Rename" onClose={close} footer={cancelAndAccept}>
          <Stack gap="sm">
            <Input aria-label="First name" />
            {terms.slice(0, 5).map((line) => (
              <Text key={line}>{line}</Text>
            ))}
            <Input aria-label="Last name" />
            <FocusOnOpen label="Last name" />
          </Stack>
        </Dialog>
      )}
    </Opened>
  ),
};

/** The first field is focused: its outline against the top edge of the scrolling body. */
export const FocusAtTheTop: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog title="Rename" onClose={close} footer={cancelAndAccept}>
          <Stack gap="sm">
            <Input aria-label="First name" />
            {terms.slice(0, 5).map((line) => (
              <Text key={line}>{line}</Text>
            ))}
            <Input aria-label="Last name" />
          </Stack>
        </Dialog>
      )}
    </Opened>
  ),
};
