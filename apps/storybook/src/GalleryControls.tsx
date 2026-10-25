import {
  Button,
  Checkbox,
  DateField,
  DatePicker,
  FileDrop,
  Input,
  Select,
  Textarea,
  type ControlWidth,
} from "@hackcove/ui";

const widths: ControlWidth[] = ["xs", "sm", "md", "lg"];

const searchIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 1 0 3.4 9.8l3.15 3.15a.75.75 0 1 0 1.06-1.06l-3.15-3.15A5.5 5.5 0 0 0 9 3.5Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
      clipRule="evenodd"
    />
  </svg>
);

/** The compact and fixed-width Input, Select, Textarea and Checkbox rows, the FileDrop and the date error of the Gallery. */
export function GalleryControls() {
  return (
    <div className="flex max-w-lg flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input size="sm" width="md" aria-label="Small, medium width" placeholder="Qty" />
        <Select size="sm" width="md" aria-label="Small select" defaultValue="monthly">
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </Select>
        <Input size="sm" width="auto" aria-label="Small, auto width" placeholder="Auto" />
        <Input
          size="sm"
          width="md"
          aria-label="Small, with icon"
          placeholder="Find"
          icon={searchIcon}
        />
        <Checkbox size="sm" label="Paid" defaultChecked />
        <Checkbox size="sm" aria-label="Select row" />
        <div className="max-w-xs">
          <Checkbox
            align="start"
            label="Email me when a shop I follow posts a new find, and a weekly summary of the best ones"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {widths.map((width) => (
          <Input key={width} width={width} aria-label={`Width ${width}`} placeholder={width} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input width="fill" aria-label="Fill width" placeholder="Fill" />
        <Select width="fill" aria-label="Fill select" defaultValue="monthly">
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </Select>
        <Input align="end" width="md" aria-label="Right-aligned" defaultValue="1 250" />
        <Button>Save</Button>
      </div>
      <Textarea size="sm" rows={2} aria-label="Small textarea" placeholder="Small note" />
      <Input prefix="R" placeholder="0.00" aria-label="Amount" width="lg" />
      <FileDrop accept=".csv" aria-label="Statement">
        Drop a statement here or click to choose
      </FileDrop>
      <FileDrop size="sm" accept=".png" aria-label="Photo">
        Add a photo
      </FileDrop>
      <DatePicker label="Paid on" error="That date is before the invoice." />
      <DateField label="Due on" isInvalid errorMessage="Pick a date." />
    </div>
  );
}
