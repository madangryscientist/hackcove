import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileDrop } from "@hackcove/ui";

const meta: Meta = { title: "UI/FileDrop" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => <FileDrop accept=".csv">Drop a bank statement here or click to choose</FileDrop>,
};
export const Disabled: S = {
  render: () => (
    <FileDrop accept=".csv" disabled>
      Drop a bank statement here or click to choose
    </FileDrop>
  ),
};
