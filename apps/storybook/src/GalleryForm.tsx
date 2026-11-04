import { useId, useRef } from "react";
import {
  Button,
  Field,
  FormGrid,
  FormRow,
  FormRowField,
  Input,
  Textarea,
} from "@hackcove/ui-react";

const searchIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 1 0 3.4 9.8l3.15 3.15a.75.75 0 1 0 1.06-1.06l-3.15-3.15A5.5 5.5 0 0 0 9 3.5Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
      clipRule="evenodd"
    />
  </svg>
);

/** The search Field of the Gallery's control column. */
export function GalleryNameField() {
  const nameId = useId();
  return (
    <Field label="Display name" htmlFor={nameId} hint="Shown on your reviews.">
      <Input
        id={nameId}
        type="search"
        placeholder="Search by name, suburb or tag…"
        icon={searchIcon}
      />
    </Field>
  );
}

const statementCsv =
  "Date,Description,Amount\n2026-10-01,Groceries,-84.20\n2026-10-03,Salary,3200.00";

/** A pasted statement in `mono`, and a note whose ref lets a button move focus into it. */
export function GalleryPaste() {
  const note = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="flex flex-col items-start gap-2">
      <Textarea mono rows={3} defaultValue={statementCsv} aria-label="Pasted statement" />
      <Textarea ref={note} rows={2} aria-label="Note" placeholder="A note" />
      <Button size="sm" onClick={() => note.current?.focus()}>
        Focus the note
      </Button>
    </div>
  );
}

/** The Gallery's notes: a plain Textarea, then a pasted statement and a ref-focused note. */
export function GalleryNotes() {
  return (
    <>
      <Textarea placeholder="What did you find? How were the prices?" />
      <GalleryPaste />
    </>
  );
}

/** The two-column form: Fields, a full-width Field and a FormRow with a trailing action and a hint under the row. */
export function GalleryForm() {
  return (
    <div className="max-w-xl">
      <FormGrid>
        <Field label="First name" htmlFor="gallery-first">
          <Input id="gallery-first" />
        </Field>
        <Field label="Last name" htmlFor="gallery-last">
          <Input id="gallery-last" />
        </Field>
        <Field label="Notes" htmlFor="gallery-notes" span="full">
          <Textarea id="gallery-notes" />
        </Field>
        <FormRow hint="Press Save to apply." action={<Button size="sm">Save</Button>}>
          <FormRowField label="Item" htmlFor="gallery-item" span={3}>
            <Input id="gallery-item" size="sm" defaultValue="Kitchen renovation" />
          </FormRowField>
          <FormRowField label="Amount" htmlFor="gallery-amount">
            <Input id="gallery-amount" size="sm" align="end" defaultValue="12,400.00" />
          </FormRowField>
        </FormRow>
      </FormGrid>
    </div>
  );
}
