import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Button,
  Card,
  Field,
  FormLayout,
  Input,
  ListLayout,
  Tabs,
  Stack,
} from "@hackcove/ui-react";
import { DemoShell, layoutPage } from "./DemoShell";
import { FormPage } from "./pages";

/** The `max-w-3xl` column starts at the title's x: the e2e checks it against the list page's. */
const meta: Meta = {
  title: "Page layouts/FormLayout",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole form page: the shell with its brand and nav, then the layout with the fields in `children` and Save and Cancel in `actions`. */
export const FullPage: S = {
  render: () => (
    <AppShell
      brand={<a href="#">Hack Cove</a>}
      nav={
        <Tabs
          label="Main"
          items={[
            { label: "Quotes", href: "#quotes", selected: true },
            { label: "Clients", href: "#clients" },
          ]}
        />
      }
    >
      <FormLayout
        title="New client"
        description="Who is the quote for?"
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
            <Field label="Full name">
              <Input placeholder="Naledi Mokoena" />
            </Field>
            <Field label="Email">
              <Input type="email" />
            </Field>
          </Stack>
        </Card>
      </FormLayout>
    </AppShell>
  ),
};

export const NewQuote: S = {
  render: () => (
    <DemoShell>
      <FormPage />
    </DemoShell>
  ),
};

/** A failed save is the layout's `error`: an alert directly above Save and Cancel. */
export const WithError: S = {
  render: () => (
    <FormLayout
      title="New client"
      description="Who is the quote for?"
      onSubmit={(event) => event.preventDefault()}
      error="Could not save the client: you are offline."
      actions={
        <>
          <Button type="submit">Save client</Button>
          <Button variant="ghost">Cancel</Button>
        </>
      }
    >
      <Card title="Client">
        <Stack>
          <Field label="Full name">
            <Input placeholder="Naledi Mokoena" />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="naledi@example.com" />
          </Field>
        </Stack>
      </Card>
    </FormLayout>
  ),
};

/** The fields go in `children`; Save and Cancel go in `actions`, at the end of the form. */
export const DoForm: S = {
  render: () => (
    <FormLayout
      title="New client"
      description="Who is the quote for?"
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
          <Field label="Full name">
            <Input placeholder="Naledi Mokoena" />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="naledi@example.com" />
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
      description="Who is the quote for?"
      actions={<Button>Save client</Button>}
    >
      <Card title="Client">
        <Stack>
          <Field label="Full name">
            <Input placeholder="Naledi Mokoena" />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="naledi@example.com" />
          </Field>
        </Stack>
      </Card>
    </ListLayout>
  ),
};

/** While `loading` the layout owns the wait: the header draws as itself and every part inside waits with it. */
export const Loading: StoryObj<{ loading: boolean }> = {
  args: { loading: true },
  render: ({ loading }) => (
    <DemoShell>
      <FormLayout title="Edit quote" loading={loading}>
        <Field label="Customer">
          <Input defaultValue="Cove Hardware" />
        </Field>
      </FormLayout>
    </DemoShell>
  ),
};
