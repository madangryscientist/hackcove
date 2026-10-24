import type { Meta, StoryObj } from "@storybook/react-vite";
import { DemoShell, layoutPage } from "./DemoShell";
import { ProsePage } from "./pages";

/** The `max-w-3xl` reading column starts at the title's x, with the header inside it: the e2e's every-Layout-story check holds the title's x to the logo's. */
const meta: Meta = {
  title: "Layout/ProseLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const Privacy: S = {
  render: () => (
    <DemoShell>
      <ProsePage />
    </DemoShell>
  ),
};
