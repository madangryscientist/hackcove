import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Caption,
  DateField,
  DatePicker,
  Dialog,
  Drawer,
  fromISODate,
  Input,
  Stack,
  toISODate,
} from "@hackcove/ui";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * The calendar popover portals to <body>, outside the toolbar's theme frame. An app puts its theme's
 * scope class on <html>, so do the same here while a picker story is mounted.
 */
function HtmlScope({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const classes = [...(ref.current?.closest("[data-theme]")?.classList ?? [])];
    document.documentElement.classList.add(...classes);
    return () => document.documentElement.classList.remove(...classes);
  });
  return <div ref={ref}>{children}</div>;
}

const meta: Meta = {
  title: "UI/DatePicker",
  decorators: [
    (Story) => (
      <HtmlScope>
        <div className="flex max-w-xs flex-col gap-4">
          <Story />
        </div>
      </HtmlScope>
    ),
  ],
};
export default meta;
type S = StoryObj;

const birthday = fromISODate("1990-05-17");

/**
 * Type into the first segment the way a browser does: one `beforeinput` per character, a microtask
 * apart so React renders between keystrokes. Not a frame: the visual capture freezes the page's
 * `requestAnimationFrame`.
 */
async function typeDigits(canvasElement: HTMLElement, digits: string): Promise<void> {
  canvasElement.querySelector<HTMLElement>('[role="spinbutton"]')?.focus();
  for (const data of digits) {
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    document.activeElement?.dispatchEvent(
      new InputEvent("beforeinput", {
        data,
        inputType: "insertText",
        bubbles: true,
        cancelable: true,
      }),
    );
  }
}

export const Empty: S = {
  render: () => <DatePicker label="Date of birth" description="As on your ID document." />,
};

export const Filled: S = {
  render: () => <DatePicker label="Date of birth" defaultValue={birthday} />,
};

/** The day is typed and the month segment is active. */
export const FocusedWhileTyping: S = {
  render: () => <DatePicker label="Date of birth" />,
  play: ({ canvasElement }) => typeDigits(canvasElement, "17"),
};

/** 31/02/1990 does not exist: after focus leaves it stays as typed, with the error. */
export const Invalid: S = {
  render: () => <DatePicker label="Date of birth" />,
  play: async ({ canvasElement }) => {
    await typeDigits(canvasElement, "31021990");
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  },
};

/** An error from outside, a server's say: shown in place of the description, and the field is invalid. */
export const ExternalError: S = {
  render: () => (
    <DatePicker
      label="Paid on"
      description="The day the money moved."
      error="That date is before the invoice."
    />
  ),
};

export const Disabled: S = {
  render: () => <DatePicker label="Date of birth" defaultValue={birthday} isDisabled />,
};

/** The calendar open: Monday-first, outside days dimmed, the selected day filled. */
export const Open: S = {
  render: () => (
    <div className="min-h-112">
      <DatePicker label="Date of birth" defaultValue={birthday} defaultOpen />
    </div>
  ),
};

/** The field alone, with no calendar. */
export const FieldOnly: S = {
  render: () => <DateField label="Date of birth" description="DD/MM/YYYY" />,
};

/** Open when the story loads; the button opens it again. */
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

/** A picker in a modal Dialog: the calendar must still open, take focus and pick a day. */
export const InDialog: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog title="Mark as paid" onClose={close}>
          <DatePicker label="Paid on" />
        </Dialog>
      )}
    </Opened>
  ),
};

/** A picker in a modal Drawer: the calendar must still open, take focus and pick a day. */
export const InDrawer: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Drawer title="Mark as paid" onClose={close}>
          <DatePicker label="Paid on" />
        </Drawer>
      )}
    </Opened>
  ),
};

/** A date is a `DatePicker`: DD/MM/YYYY segments the person can type, and a calendar button for the rest. */
export const DoDate: S = {
  render: () => <DatePicker label="Date of birth" description="As on your ID document." />,
};

/** A text input takes any characters, so 17/5/90, 1990-05-17 and "May" all arrive, and nothing says which is meant. */
export const DontDate: S = {
  render: () => <Input aria-label="Date of birth" placeholder="DD/MM/YYYY" />,
};

/** A message from outside the field, a server's say, is `error`: it replaces the description and is announced as an alert. */
export const DoError: S = {
  render: () => (
    <DatePicker
      label="Paid on"
      description="The day the money moved."
      error="That date is before the invoice."
    />
  ),
};

/** `isInvalid` alone turns the field red and says nothing about why. */
export const DontError: S = {
  render: () => <DatePicker label="Paid on" description="The day the money moved." isInvalid />,
};

/** The value is a `CalendarDate`. `fromISODate` reads a stored `YYYY-MM-DD`, `toISODate` writes it back, and `name` posts the same string in a form. */
export const DoValue: S = {
  render: () => {
    const [paid, setPaid] = useState(fromISODate("2026-10-26"));
    return (
      <Stack gap="xs">
        <DatePicker label="Paid on" name="paidOn" value={paid} onChange={setPaid} />
        <Caption>Stored as {toISODate(paid) || "nothing yet"}.</Caption>
      </Stack>
    );
  },
};

/** `DateField` is the same input without the calendar button, for a date the person knows by heart. */
export const DoTypedOnly: S = {
  render: () => <DateField label="Date of birth" description="DD/MM/YYYY" />,
};

/** `sm`, `md` (the default) and `lg`, on the picker and the bare field. */
export const Sizes: S = {
  render: () => (
    <>
      {(["sm", "md", "lg"] as const).map((size) => (
        <DatePicker key={size} label={`Picker, ${size}`} size={size} defaultValue={birthday} />
      ))}
      {(["sm", "md", "lg"] as const).map((size) => (
        <DateField key={size} label={`Field, ${size}`} size={size} defaultValue={birthday} />
      ))}
    </>
  ),
};
