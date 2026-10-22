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
export const Blocked: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button disabledReason="Pick a shop first">Save</Button>
      <Button variant="outline" disabledReason="Pick a shop first">
        Cancel
      </Button>
      <Button variant="ghost" disabledReason="Pick a shop first">
        Skip
      </Button>
    </div>
  ),
};
export const Busy: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button busy busyLabel="Saving…">
        Save
      </Button>
      <Button variant="outline" busy busyLabel="Cancelling…">
        Cancel
      </Button>
      <Button variant="ghost" busy>
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
