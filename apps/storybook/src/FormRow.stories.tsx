import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Field,
  FormGrid,
  FormRow,
  FormRowField,
  Input,
  Select,
  Stack,
  Textarea,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/FormRow" };
export default meta;
type S = StoryObj;

/** Fields side by side, widths in proportion to `span` (1 to 4), the action after them. Under `md` they stack. */
export const InlineEdit: S = {
  render: () => (
    <FormRow action={<Button>Save</Button>}>
      <FormRowField label="Description" htmlFor="row-desc" span={2}>
        <Input id="row-desc" defaultValue="Kitchen renovation" />
      </FormRowField>
      <FormRowField label="Category" htmlFor="row-cat">
        <Select id="row-cat" defaultValue="home">
          <option value="home">Home</option>
          <option value="car">Car</option>
        </Select>
      </FormRowField>
      <FormRowField label="Amount" htmlFor="row-amount">
        <Input id="row-amount" defaultValue="12,400.00" align="end" />
      </FormRowField>
    </FormRow>
  ),
};

/** A `hint` or an `error` sits under the whole row, not under one field, so the controls stay level. */
export const NoteUnderTheRow: S = {
  render: () => (
    <Stack>
      <FormRow hint="Press Save to apply the change." action={<Button>Save</Button>}>
        <FormRowField label="Description" htmlFor="hint-desc" span={3}>
          <Input id="hint-desc" defaultValue="Kitchen renovation" />
        </FormRowField>
        <FormRowField label="Amount" htmlFor="hint-amount">
          <Input id="hint-amount" defaultValue="12,400.00" align="end" />
        </FormRowField>
      </FormRow>
      <FormRow error="Amount is required." action={<Button>Save</Button>}>
        <FormRowField label="Description" htmlFor="err-desc" span={3}>
          <Input id="err-desc" defaultValue="Kitchen renovation" />
        </FormRowField>
        <FormRowField label="Amount" htmlFor="err-amount">
          <Input id="err-amount" />
        </FormRowField>
      </FormRow>
    </Stack>
  ),
};

/** `span` 1 to 4 is the share of the row: a `span` 3 field is three times as wide as the `span` 1 beside it. */
export const Spans: S = {
  render: () => (
    <Stack>
      {([1, 2, 3, 4] as const).map((span) => (
        <FormRow key={span}>
          <FormRowField label="Span 1" htmlFor={`span-a-${span}`}>
            <Input id={`span-a-${span}`} />
          </FormRowField>
          <FormRowField label={`Span ${span}`} htmlFor={`span-b-${span}`} span={span}>
            <Input id={`span-b-${span}`} />
          </FormRowField>
        </FormRow>
      ))}
    </Stack>
  ),
};

/** `FormGrid` is two columns from `md`; a `Field` with `span="full"` and a `FormRow` run across both. */
export const TwoColumnForm: S = {
  render: () => (
    <FormGrid>
      <Field label="First name" htmlFor="grid-first">
        <Input id="grid-first" />
      </Field>
      <Field label="Last name" htmlFor="grid-last">
        <Input id="grid-last" />
      </Field>
      <Field label="Notes" htmlFor="grid-notes" span="full" hint="Only you see these.">
        <Textarea id="grid-notes" />
      </Field>
      <FormRow action={<Button variant="outline">Add</Button>}>
        <FormRowField label="Item" htmlFor="grid-item" span={3}>
          <Input id="grid-item" />
        </FormRowField>
        <FormRowField label="Qty" htmlFor="grid-qty">
          <Input id="grid-qty" align="end" />
        </FormRowField>
      </FormRow>
    </FormGrid>
  ),
};

/** A row of controls with proportional widths, an `action` after them, and one `hint` under the whole row. */
export const DoInlineEdit: S = {
  render: () => (
    <FormRow hint="Press Save to apply the change." action={<Button>Save</Button>}>
      <FormRowField label="Description" htmlFor="do-row-desc" span={3}>
        <Input id="do-row-desc" defaultValue="Kitchen renovation" />
      </FormRowField>
      <FormRowField label="Amount" htmlFor="do-row-amount">
        <Input id="do-row-amount" defaultValue="12,400.00" align="end" />
      </FormRowField>
    </FormRow>
  ),
};

/** A `Field` with its own hint inside a `FormRow` makes its column taller, so the controls drift out of line and the save button with them. */
export const DontInlineEdit: S = {
  render: () => (
    <FormRow action={<Button>Save</Button>}>
      <Field label="Description" htmlFor="dont-row-desc" hint="Shown on the invoice.">
        <Input id="dont-row-desc" defaultValue="Kitchen renovation" />
      </Field>
      <Field label="Amount" htmlFor="dont-row-amount">
        <Input id="dont-row-amount" defaultValue="12,400.00" align="end" />
      </Field>
    </FormRow>
  ),
};

/** A `FormGrid` is two columns from `md`; a long control takes `span="full"` so it runs across both. */
export const DoTwoColumns: S = {
  render: () => (
    <FormGrid>
      <Field label="First name" htmlFor="do-grid-first">
        <Input id="do-grid-first" />
      </Field>
      <Field label="Last name" htmlFor="do-grid-last">
        <Input id="do-grid-last" />
      </Field>
      <Field label="Notes" htmlFor="do-grid-notes" span="full">
        <Textarea id="do-grid-notes" />
      </Field>
    </FormGrid>
  ),
};

/** Without `span="full"` a `Textarea` takes half the width and leaves a hole beside it. */
export const DontTwoColumns: S = {
  render: () => (
    <FormGrid>
      <Field label="First name" htmlFor="dont-grid-first">
        <Input id="dont-grid-first" />
      </Field>
      <Field label="Last name" htmlFor="dont-grid-last">
        <Input id="dont-grid-last" />
      </Field>
      <Field label="Notes" htmlFor="dont-grid-notes">
        <Textarea id="dont-grid-notes" />
      </Field>
    </FormGrid>
  ),
};
