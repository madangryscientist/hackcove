import type { Meta, StoryObj } from "@storybook/react-vite";
import { Overline, Prose, Stack } from "@hackcove/ui-react";
import { ProseDoc } from "./ProseDoc";

const meta: Meta = { title: "Text/Prose" };
export default meta;
type S = StoryObj;

/** A docs page or an article wraps its body in `Prose`: body 16, the h4 at body size in semibold, the h3 at 20 and the h2 at 24. */
export const DoDocs: S = {
  render: () => (
    <Prose>
      <ProseDoc />
    </Prose>
  ),
};

/** Without `Prose` the same page has the dense app sizes: the h2 and the h3 are one size, only 2px above the body. */
export const DontDocs: S = {
  render: () => <ProseDoc />,
};

/** The same short doc inside `Prose` (left) and without it (right). */
export const Compare: S = {
  render: () => (
    <div className="grid grid-cols-2 gap-10">
      <Stack gap="sm">
        <Overline>Inside Prose</Overline>
        <Prose>
          <ProseDoc />
        </Prose>
      </Stack>
      <Stack gap="sm">
        <Overline>Without Prose</Overline>
        <ProseDoc />
      </Stack>
    </div>
  ),
};
