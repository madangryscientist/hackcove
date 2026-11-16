import {
  Button,
  Checkbox,
  DateField,
  DateRangePicker,
  FileDrop,
  fromISODate,
  Input,
  Select,
  Textarea,
  type ControlWidth,
} from "@hackcove/ui-react";

const [octoberStart, octoberEnd] = [fromISODate("2026-10-01"), fromISODate("2026-10-31")];
const october = octoberStart && octoberEnd ? { start: octoberStart, end: octoberEnd } : null;

const widths: ControlWidth[] = ["xs", "sm", "md", "lg"];

/** The compact and fixed-width Input, Select, Textarea and Checkbox rows, the FileDrop, the date errors and the date range of the Gallery. */
export function GalleryControls() {
  return (
    <div className="flex max-w-lg flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input size="sm" width="md" aria-label="Small, medium width" placeholder="Qty" />
        <Select
          size="sm"
          width="md"
          aria-label="Small select"
          defaultValue="monthly"
          items={[
            { value: "monthly", label: "Monthly" },
            { value: "weekly", label: "Weekly" },
          ]}
        />
        <Input size="sm" width="auto" aria-label="Small, auto width" placeholder="Auto" />
        <Input
          size="sm"
          width="md"
          aria-label="Small, with icon"
          placeholder="Find"
          icon="search"
        />
        <Checkbox size="sm" label="Paid" defaultChecked />
        <Checkbox size="sm" aria-label="Select row" />
        <Checkbox label="With description" hint="A muted line under the label." />
        <div className="max-w-xs">
          <Checkbox label="Email me when a shop I follow posts a new find, and a weekly summary of the best ones" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {widths.map((width) => (
          <Input key={width} width={width} aria-label={`Width ${width}`} placeholder={width} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input width="fill" aria-label="Fill width" placeholder="Fill" />
        <Select
          width="fill"
          aria-label="Fill select"
          defaultValue="monthly"
          items={[
            { value: "monthly", label: "Monthly" },
            { value: "weekly", label: "Weekly" },
          ]}
        />
        <Input numeric width="md" aria-label="Quantity" defaultValue="1 250" />
        <Button>Save</Button>
      </div>
      <Textarea size="sm" rows={2} aria-label="Small textarea" placeholder="Small note" />
      <Input prefix="R" numeric placeholder="0.00" aria-label="Amount" width="lg" />
      <FileDrop accept=".csv" aria-label="Statement">
        Drop a statement here or click to choose
      </FileDrop>
      <FileDrop size="sm" accept=".png" aria-label="Photo">
        Add a photo
      </FileDrop>
      <DateField calendar label="Paid on" error="That date is before the invoice." />
      <DateField label="Due on" error="Pick a date." />
      <DateRangePicker label="Report period" defaultValue={october} />
    </div>
  );
}
