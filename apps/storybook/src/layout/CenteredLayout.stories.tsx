import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, CenteredLayout, Field, Input } from "@hackcove/ui";
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
