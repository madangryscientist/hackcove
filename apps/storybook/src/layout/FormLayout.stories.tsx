import type { Meta, StoryObj } from "@storybook/react-vite";
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
