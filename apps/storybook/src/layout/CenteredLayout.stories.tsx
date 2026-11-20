import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Button,
  CenteredLayout,
  Field,
  FormLayout,
  Icon,
  Input,
  Tabs,
  Text,
} from "@slashsuite/ui-react";
import { DemoShell, layoutPage } from "./DemoShell";

/** The one layout whose width differs on purpose: a narrow centred card, asserted on its own terms (e2e/layout.spec.ts). */
const meta: Meta = {
  title: "Page layouts/CenteredLayout",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole sign-in page: the shell with its brand and nav, then one narrow card, centred. */
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
      <CenteredLayout title="Sign in" description="Use your Hack Cove account.">
        <Field label="Email" htmlFor="full-page-email">
          <Input id="full-page-email" type="email" placeholder="you@example.com" />
        </Field>
        <Button>Continue</Button>
      </CenteredLayout>
    </AppShell>
  ),
};

export const SignIn: S = {
  render: () => (
    <DemoShell>
      <CenteredLayout title="Sign in" description="Use your Hack Cove account.">
        <Field label="Email" htmlFor="sign-in-email">
          <Input id="sign-in-email" type="email" placeholder="you@example.com" />
        </Field>
        <Button>Continue</Button>
      </CenteredLayout>
    </DemoShell>
  ),
};

export const NotFound: S = {
  render: () => (
    <DemoShell>
      <CenteredLayout title="Page not found" description="It may have moved.">
        <Button variant="outline">Back to builds</Button>
      </CenteredLayout>
    </DemoShell>
  ),
};

/** `mark` is drawn first in the card, above the title: an icon or a large status numeral. It is not a heading. */
export const Mark: S = {
  render: () => (
    <DemoShell>
      <CenteredLayout
        mark={<Icon name="check" size="feature" tone="positive" />}
        title="Email confirmed"
        description="Your Hack Cove account is ready."
      >
        <Button>Continue</Button>
      </CenteredLayout>
    </DemoShell>
  ),
};

/** Sign-in, landing, not-found and error pages are one narrow card, centred. */
export const DoPage: S = {
  render: () => (
    <CenteredLayout title="Sign in" description="Use your Hack Cove account.">
      <Field label="Email" htmlFor="do-page-email">
        <Input id="do-page-email" type="email" placeholder="you@example.com" />
      </Field>
      <Button>Continue</Button>
    </CenteredLayout>
  ),
};

/** `FormLayout` is for a form inside the app: its wide column hangs off the left edge, which is wrong for a sign-in. Use `CenteredLayout`. */
export const DontPage: S = {
  render: () => (
    <FormLayout
      title="Sign in"
      description="Use your Hack Cove account."
      actions={<Button type="submit">Continue</Button>}
    >
      <Field label="Email" htmlFor="dont-page-email">
        <Input id="dont-page-email" type="email" placeholder="you@example.com" />
      </Field>
    </FormLayout>
  ),
};

/** While `loading` the layout owns the wait: the header draws as itself and every part inside waits with it. */
export const Loading: StoryObj<{ loading: boolean }> = {
  args: { loading: true },
  render: ({ loading }) => (
    <DemoShell>
      <CenteredLayout title="Your invite" loading={loading}>
        <Text>{loading ? null : "Mia Botha asked you to join Cove Hardware."}</Text>
      </CenteredLayout>
    </DemoShell>
  ),
};
