import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, Field, FormLayout, Input, ListLayout, Stack } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";
import { FormPage } from "./pages";

/** The `max-w-3xl` column starts at the title's x: the e2e checks it against the list page's. */
const meta: Meta = {
  title: "Layout/FormLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const NewQuote: S = {
  render: () => (
    <DemoShell>
      <FormPage />
    </DemoShell>
  ),
};

/** The fields go in `children`; Save and Cancel go in `actions`, at the end of the form. */
export const DoForm: S = {
  render: () => (
    <FormLayout
      title="New client"
      subtitle="Who is the quote for?"
      onSubmit={(event) => event.preventDefault()}
      actions={
        <>
          <Button type="submit">Save client</Button>
          <Button variant="ghost">Cancel</Button>
        </>
      }
    >
      <Card title="Client">
        <Stack>
          <Field label="Full name" htmlFor="do-form-name">
            <Input id="do-form-name" placeholder="Naledi Mokoena" />
          </Field>
          <Field label="Email" htmlFor="do-form-email">
            <Input id="do-form-email" type="email" placeholder="naledi@example.com" />
          </Field>
        </Stack>
      </Card>
    </FormLayout>
  ),
};

/** `ListLayout` is not a form: Save sits in the header, away from the fields, and nothing submits on Enter. Use `FormLayout`. */
export const DontForm: S = {
  render: () => (
    <ListLayout
      title="New client"
      subtitle="Who is the quote for?"
      actions={<Button>Save client</Button>}
    >
      <Card title="Client">
        <Stack>
          <Field label="Full name" htmlFor="dont-form-name">
            <Input id="dont-form-name" placeholder="Naledi Mokoena" />
          </Field>
          <Field label="Email" htmlFor="dont-form-email">
            <Input id="dont-form-email" type="email" placeholder="naledi@example.com" />
          </Field>
        </Stack>
      </Card>
    </ListLayout>
  ),
};
