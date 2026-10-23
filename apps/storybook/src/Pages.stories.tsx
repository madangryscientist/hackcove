import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageSequence } from "./GalleryPages";

const meta: Meta = { title: "Pages" };
export default meta;
type S = StoryObj;

/** List → Detail → Form, each in its own shell: the title and the first block sit in the same place on all three. */
export const ListDetailForm: S = {
  render: () => <PageSequence />,
};
