import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateField, DatePicker, fromISODate } from "@hackcove/ui";
import { type ReactNode, useEffect, useRef } from "react";

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
