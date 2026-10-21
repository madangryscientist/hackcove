import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, buttonClass } from "@hackcove/ui";

const meta: Meta = { title: "UI/Button" };
export default meta;
type S = StoryObj;

export const Variants: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
    </div>
  ),
};
export const Disabled: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button disabled>Save</Button>
      <Button variant="outline" disabled>
        Cancel
      </Button>
      <Button variant="ghost" disabled>
        Skip
      </Button>
    </div>
  ),
};
export const AsLink: S = {
  render: () => (
    <a href="#" className={buttonClass("outline")}>
      List your shop
    </a>
  ),
};
