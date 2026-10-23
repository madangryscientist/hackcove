import type { Meta, StoryObj } from "@storybook/react-vite";
import { DemoShell, layoutPage } from "./DemoShell";
import { DetailPage } from "./pages";

/** Main two thirds and aside one third from `lg`; the aside stacks below main under it. */
const meta: Meta = {
  title: "Layout/DetailLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const MainAndAside: S = {
  render: () => (
    <DemoShell>
      <DetailPage />
    </DemoShell>
  ),
};
