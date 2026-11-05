import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, Input, Textarea } from "@hackcove/ui-react";

const meta: Meta = { title: "Forms/Field" };
export default meta;
type S = StoryObj;

export const WithInput: S = {
  render: () => (
    <Field label="Display name" htmlFor="name" hint="Shown on your reviews.">
      <Input id="name" />
    </Field>
  ),
};
export const WithError: S = {
  render: () => (
    <Field
      label="Display name"
      htmlFor="name"
      hint="Shown on your reviews."
      error="Pick a shorter name."
    >
      <Input id="name" />
    </Field>
  ),
};
export const WithTextarea: S = {
  render: () => (
    <Field label="Review" htmlFor="review">
      <Textarea id="review" />
    </Field>
  ),
};

/** Every control sits in a `Field`: the label is tied to the control by `htmlFor`, and the hint sits under it. */
export const DoLabel: S = {
  render: () => (
    <Field label="Display name" htmlFor="do-label-name" hint="Shown on your reviews.">
      <Input id="do-label-name" />
    </Field>
  ),
};

/** A placeholder is not a label: it vanishes as soon as the person types, and it names nothing for a screen reader. */
export const DontLabel: S = {
  render: () => <Input placeholder="Display name" />,
};

/** `error` replaces the hint, in red, and is announced as an alert. */
export const DoError: S = {
  render: () => (
    <Field
      label="Display name"
      htmlFor="do-error-name"
      hint="Shown on your reviews."
      error="Pick a shorter name."
    >
      <Input id="do-error-name" defaultValue="A very long display name indeed" />
    </Field>
  ),
};

/** An error passed as the `hint` looks like help text: it is grey and is not announced. */
export const DontError: S = {
  render: () => (
    <Field label="Display name" htmlFor="dont-error-name" hint="Pick a shorter name.">
      <Input id="dont-error-name" defaultValue="A very long display name indeed" />
    </Field>
  ),
};

/** `layout="row"` puts the label beside the control, for a compact setting or a drawer row. The hint or error sits under the control. */
export const Row: S = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3">
      <Field label="Rank" htmlFor="row-rank" layout="row" hint="Lower numbers come first.">
        <Input id="row-rank" defaultValue="3" />
      </Field>
      <Field label="Owner" htmlFor="row-owner" layout="row" error="Pick an owner.">
        <Input id="row-owner" />
      </Field>
    </div>
  ),
};
