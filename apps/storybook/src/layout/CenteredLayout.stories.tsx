import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, CenteredLayout, Field, FormLayout, Input } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

/** The one layout whose width differs on purpose, so the no-jump title check skips it (e2e/layout.spec.ts). */
const meta: Meta = {
  title: "Layout/CenteredLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const SignIn: S = {
  render: () => (
    <DemoShell>
      <CenteredLayout title="Sign in" subtitle="Use your Hack Cove account.">
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
      <CenteredLayout title="Page not found" subtitle="It may have moved.">
        <Button variant="outline">Back to builds</Button>
      </CenteredLayout>
    </DemoShell>
  ),
};

/** Sign-in, landing, not-found and error pages are one narrow card, centred. */
export const DoPage: S = {
  render: () => (
    <CenteredLayout title="Sign in" subtitle="Use your Hack Cove account.">
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
      subtitle="Use your Hack Cove account."
      actions={<Button type="submit">Continue</Button>}
    >
      <Field label="Email" htmlFor="dont-page-email">
        <Input id="dont-page-email" type="email" placeholder="you@example.com" />
      </Field>
    </FormLayout>
  ),
};
