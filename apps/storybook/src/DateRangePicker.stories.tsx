import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Caption,
  Cluster,
  DateField,
  DateRangePicker,
  type DateRange,
  type DateRangePreset,
  Dialog,
  fromISODate,
  Stack,
  toISODate,
} from "@hackcove/ui-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * The calendar popover portals to <body>, outside the toolbar's theme frame. An app puts its theme's
 * scope class on <html>, so do the same here while a calendar story is mounted.
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
  title: "Forms/DateRangePicker",
  decorators: [
    (Story) => (
      <HtmlScope>
        <div className="flex max-w-sm flex-col gap-4">
          <Story />
        </div>
      </HtmlScope>
    ),
  ],
};
export default meta;
type S = StoryObj;

function range(start: string, end: string): DateRange {
  const [from, to] = [fromISODate(start), fromISODate(end)];
  if (!from || !to) throw new Error(`not a range: ${start} to ${end}`);
  return { start: from, end: to };
}

const october = range("2026-10-01", "2026-10-31");

/**
 * What an app builds from its own today. A story passes a fixed day so nothing here depends on the
 * clock; an app passes `today(getLocalTimeZone())`.
 */
function lastDays(today: DateRange["end"]): DateRangePreset[] {
  return [7, 30, 90].map((days) => ({
    label: `Last ${days} days`,
    value: { start: today.subtract({ days: days - 1 }), end: today },
  }));
}

const octoberPresets = lastDays(october.end);

/**
 * Type into the `index`th segment the way a browser does: one `beforeinput` per character, a
 * microtask apart so React renders between keystrokes.
 */
async function typeDigits(canvasElement: HTMLElement, index: number, digits: string) {
  canvasElement.querySelectorAll<HTMLElement>('[role="spinbutton"]')[index]?.focus();
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

export const Default: S = {
  render: () => <DateRangePicker label="Report period" defaultValue={october} />,
};

/** The calendar open: the two ends filled, the days between them a light band. */
export const Open: S = {
  render: () => (
    <div className="min-h-112">
      <DateRangePicker label="Report period" defaultValue={october} defaultOpen />
    </div>
  ),
};

/** The app's ready-made ranges above the month, built from a fixed day here. */
export const WithPresets: S = {
  render: () => (
    <div className="min-h-128">
      <DateRangePicker
        label="Report period"
        defaultValue={october}
        presets={octoberPresets}
        defaultOpen
      />
    </div>
  ),
};

/** 31/02/2026 does not exist: after focus leaves, the end keeps the typed day, with the message. */
export const Impossible: S = {
  render: () => (
    <DateRangePicker label="Report period" defaultValue={range("2026-02-01", "2026-02-28")} />
  ),
  play: async ({ canvasElement }) => {
    await typeDigits(canvasElement, 3, "31");
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  },
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

/** A range picker in a modal Dialog: the calendar must still open above it and pick a range. */
export const InDialog: S = {
  render: () => (
    <Opened>
      {(close) => (
        <Dialog title="Filter the timeline" onClose={close}>
          <DateRangePicker label="Period" defaultValue={october} />
        </Dialog>
      )}
    </Opened>
  ),
};

/** A from and to date is one `DateRangePicker`, with the app's presets built from its own today. */
export const DoPresets: S = {
  render: () => {
    // An app takes today from `today(getLocalTimeZone())`; a fixed day keeps the story still.
    const today = fromISODate("2026-10-31");
    const presets = today
      ? [7, 30, 90].map((days) => ({
          label: `Last ${days} days`,
          value: { start: today.subtract({ days: days - 1 }), end: today },
        }))
      : [];
    const [period, setPeriod] = useState<DateRange | null>(
      today ? { start: today.set({ day: 1 }), end: today } : null,
    );
    return (
      <Stack gap="xs">
        <DateRangePicker
          label="Report period"
          startName="from"
          endName="to"
          value={period}
          onChange={setPeriod}
          presets={presets}
        />
        <Caption>
          {period
            ? `From ${toISODate(period.start)} to ${toISODate(period.end)}.`
            : "No period yet."}
        </Caption>
      </Stack>
    );
  },
};

/** Two `DateField`s do not know about each other: nothing stops an end before the start, and there is no one press for "Last 30 days". */
export const DontPresets: S = {
  render: () => (
    <Cluster gap="sm">
      <DateField calendar label="From" defaultValue={fromISODate("2026-10-02")} />
      <DateField calendar label="To" defaultValue={fromISODate("2026-10-31")} />
    </Cluster>
  ),
};
