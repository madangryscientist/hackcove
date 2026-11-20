import type { ComponentPage } from "./types";

/** The pages for picking dates: they sit in the Forms section of the rail, after FormRow. */
export const datePages: ComponentPage[] = [
  {
    slug: "date-field",
    name: "DateField",
    summary: "A date in DD/MM/YYYY segments, with a calendar to pick from when `calendar` is set.",
    whenToUse:
      "Any date a person enters; leave `calendar` off for a date the person knows by heart.",
    pairs: ["DateField/Date", "DateField/Error", "DateField/Value", "DateField/TypedOnly"],
    usage: {
      do: [
        "A date is a `DateField`, never an `Input`. The format is always DD/MM/YYYY and weeks start on Monday, whatever the browser's locale.",
        "`calendar` adds a calendar button, and `defaultOpen` opens it on mount; without `calendar` the field is typed only, for a date the person knows by heart (a birthday).",
        "It draws its own label: give it `label` and `hint`, and do not wrap it in a `Field`.",
        "A message from outside, a server's say, is `error`: it marks the field invalid and replaces the hint. An impossible date, such as 31/02/1990, shows its own message.",
        "The value is a `CalendarDate` (`value`, `defaultValue`, `onChange`, `minValue`, `maxValue`). `fromISODate` reads a stored `YYYY-MM-DD` and `toISODate` writes one.",
        "`name` posts the date as `YYYY-MM-DD` in a form, or an empty string.",
        "`size` is `sm`, `md` (default) or `lg`, the same heights as `Input`. `disabled` and `required` work as on an `Input`; say why it is disabled in its `hint`.",
        "With `calendar`, `monthLabel` and `yearLabel` name the month and year dropdowns, for an app in another language.",
      ],
    },
    accessibility: [
      'The label names a `role="group"`; each of day, month and year is its own editable segment (`role="spinbutton"`), so a person can type digits or use the arrow keys.',
      'The `hint` is the field\'s `aria-describedby`; the `error` and the built-in messages replace it, and an `error` is `role="alert"`.',
      'With `calendar`, the calendar button is labelled "Calendar" and opens a popover dialog, with a month and a year select (named by `monthLabel` and `yearLabel`), arrow-key movement across days and a Clear button.',
      "Inside a `Dialog` or `Drawer` the calendar opens inside it, so it still takes focus.",
      "The focus ring comes from the component.",
    ],
    api: ["DateField"],
    functions: [
      {
        name: "fromISODate",
        text: 'Reads a stored `"YYYY-MM-DD"` into the `CalendarDate` a picker takes; `null` for an empty, malformed or impossible string.',
      },
      {
        name: "toISODate",
        text: 'Writes a `CalendarDate` as `"YYYY-MM-DD"`, or `""` for none, so it drops into a form field or storage.',
      },
    ],
  },
  {
    slug: "date-range-picker",
    name: "DateRangePicker",
    summary: "A from and to date in one field, typed or picked from a month or a preset.",
    whenToUse: "A from and to date: a report period, a timeline filter.",
    pairs: ["DateRangePicker/Presets"],
    usage: {
      do: [
        "A from and to date is one `DateRangePicker`, never two `DateField`s. A single date is a `DateField`.",
        "The value is `{ start, end }` of `CalendarDate`s, or `null`. It is reported only when both sides are complete, real dates within `minValue` and `maxValue` and the start is on or before the end; anything else reports `null` and the field says why. `startName` and `endName` post each side as `YYYY-MM-DD` in a form, or an empty string while there is no range.",
        'Presets come from the app: build "Last 7 days", "Last 30 days" and "Last 90 days" from the app\'s own today (`today(getLocalTimeZone())` from `@internationalized/date`) and pass them as `presets`. The picker has none of its own and never reads the clock. A preset sets the range and closes the calendar.',
        "It draws its own label: give it `label` and `hint`, and do not wrap it in a `Field`. `error`, `size`, `disabled`, `required`, `monthLabel` and `yearLabel` work as on `DateField`.",
      ],
    },
    accessibility: [
      'Each side is a `role="group"` named "Start date" and "End date", of DD, MM and YYYY segments (`role="spinbutton"`) that take digits or the arrow keys.',
      'The calendar button is labelled "Calendar" and opens a popover dialog: the arrow keys move across days, Enter on a day starts the range and Enter on a second ends it, and Escape closes it without a change.',
      'An impossible day, such as 31/02/2026, keeps what was typed and says which side and why: "End date: February 2026 has 28 days."',
      "Inside a `Dialog` or `Drawer` the calendar opens inside it, so it still takes focus. The focus ring comes from the component.",
    ],
    api: ["DateRangePicker"],
    types: ["DateRange", "DateRangePreset"],
  },
];
