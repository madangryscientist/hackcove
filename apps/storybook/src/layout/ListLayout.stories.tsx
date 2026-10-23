import type { Meta, StoryObj } from "@storybook/react-vite";
import { DemoShell, layoutPage } from "./DemoShell";
import { ListPage } from "./pages";

/** Every story under `Layout/` is picked up by the no-jump e2e at 375, 768 and 1280. */
const meta: Meta = {
  title: "Layout/ListLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const WithRows: S = {
  render: () => (
    <DemoShell>
      <ListPage />
    </DemoShell>
  ),
};

/** `isEmpty` swaps the list for the `empty` slot; the header and filters stay. */
export const Empty: S = {
  render: () => (
    <DemoShell>
      <ListPage isEmpty />
    </DemoShell>
  ),
};
