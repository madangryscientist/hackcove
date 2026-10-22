import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@hackcove/ui";

const meta: Meta = { title: "UI/Avatar" };
export default meta;
type S = StoryObj;

const names = ["ada", "grace", "linus", "margaret", "dennis", "ken", "barbara", "alan", "?"];

export const Colours: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {names.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </div>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="octocat" size="sm" />
      <Avatar name="octocat" size="md" />
      <Avatar name="octocat" size="lg" />
    </div>
  ),
};

export const RingedStack: S = {
  render: () => (
    <div className="flex bg-slate-50 p-4">
      {["ada", "grace", "linus", "margaret"].map((name) => (
        <Avatar key={name} name={name} ring />
      ))}
    </div>
  ),
};
