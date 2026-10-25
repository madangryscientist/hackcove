import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, CodeExample } from "@hackcove/ui";

const meta: Meta = { title: "UI/CodeExample" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => (
    <div className="max-w-xl">
      <CodeExample code={'<Button variant="primary">Save</Button>'}>
        <Button variant="primary">Save</Button>
      </CodeExample>
    </div>
  ),
};

/** Side by side in a grid, each frame is its own height: the preview is never padded to match its neighbour. */
export const SideBySide: S = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 items-start gap-4">
      <CodeExample code={'<Button variant="primary">Save</Button>'}>
        <Button variant="primary">Save</Button>
      </CodeExample>
      <CodeExample
        code={"<Stack>\n  <Button>One</Button>\n  <Button>Two</Button>\n</Stack>"}
        caption="A caption is the last band of the frame."
      >
        <div className="flex flex-col gap-6">
          <Button>One</Button>
          <Button>Two</Button>
        </div>
      </CodeExample>
    </div>
  ),
};

/** A long line of code scrolls sideways inside the frame; it does not wrap or widen the page. */
export const LongCode: S = {
  render: () => (
    <div className="max-w-sm">
      <CodeExample
        code={
          '<Button variant="outline" tone="danger" size="sm" busyLabel="Deleting the build…">Delete build</Button>'
        }
      >
        <Button variant="outline" tone="danger" size="sm">
          Delete build
        </Button>
      </CodeExample>
    </div>
  ),
};
