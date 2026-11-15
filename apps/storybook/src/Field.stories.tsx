import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, Input, Textarea } from "@hackcove/ui-react";

const meta: Meta = { title: "Forms/Field" };
export default meta;
type S = StoryObj;

export const WithInput: S = {
  render: () => (
    <Field label="Display name" hint="Shown on your reviews.">
      <Input />
    </Field>
  ),
};
export const WithError: S = {
  render: () => (
    <Field label="Display name" hint="Shown on your reviews." error="Pick a shorter name.">
      <Input />
    </Field>
  ),
};
export const WithTextarea: S = {
  render: () => (
    <Field label="Review">
      <Textarea />
    </Field>
  ),
};

/** Every control sits in a `Field`, with no `htmlFor` and no `id`: the Field ties its label and hint to the control itself. */
export const DoLabel: S = {
  render: () => (
    <Field label="Display name" hint="Shown on your reviews.">
      <Input />
    </Field>
  ),
};

/** A placeholder is not a label: it vanishes as soon as the person types, and it names nothing for a screen reader. */
export const DontLabel: S = {
  render: () => <Input placeholder="Display name" />,
};

/** `error` replaces the hint, in red, and is announced as an alert; the control's edge turns red and it is marked `aria-invalid`. */
export const DoError: S = {
  render: () => (
    <Field label="Display name" hint="Shown on your reviews." error="Pick a shorter name.">
      <Input defaultValue="A very long display name indeed" />
    </Field>
  ),
};

/** An error passed as the `hint` looks like help text: it is grey and is not announced. */
export const DontError: S = {
  render: () => (
    <Field label="Display name" hint="Pick a shorter name.">
      <Input defaultValue="A very long display name indeed" />
    </Field>
  ),
};

/** `layout="row"` puts the label beside the control, for a compact setting or a drawer row. The hint or error sits under the control. */
export const Row: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <Field label="Rank" layout="row" hint="Lower numbers come first.">
        <Input defaultValue="3" />
      </Field>
      <Field label="Owner" layout="row" error="Pick an owner.">
        <Input />
      </Field>
      <Field label="Notification frequency for shared projects" layout="row">
        <Input />
      </Field>
    </div>
  ),
};

/** `hideLabel` keeps the label for assistive tech and draws no text, for a control whose purpose is plain from what surrounds it. */
export const HiddenLabel: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <Field label="Search shops" hideLabel>
        <Input type="search" placeholder="Search shops" />
      </Field>
      <Field label="Search shops" hideLabel layout="row" hint="By name or town.">
        <Input type="search" placeholder="Search shops" />
      </Field>
    </div>
  ),
};
