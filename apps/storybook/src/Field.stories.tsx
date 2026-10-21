import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, Input, Textarea } from "@hackcove/ui";

const meta: Meta = { title: "UI/Field" };
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
