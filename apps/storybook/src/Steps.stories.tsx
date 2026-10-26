import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Step, Steps } from "@hackcove/ui";

const meta: Meta = { title: "UI/Steps" };
export default meta;
type S = StoryObj;

export const WithDetails: S = {
  render: () => (
    <div className="max-w-md">
      <Steps aria-label="Get started">
        <Step title="Install the CLI">
          Run <Code>bun add -d pixelslash</Code> in your repo.
        </Step>
        <Step title="Add a token">Create one in Settings and export it in CI.</Step>
        <Step title="Upload a build">
          Run <Code>pixelslash upload</Code>.
        </Step>
      </Steps>
    </div>
  ),
};

export const TitlesOnly: S = {
  render: () => (
    <div className="max-w-md">
      <Steps>
        <Step title="Sign in" />
        <Step title="Pick a project" />
        <Step title="Upload" />
      </Steps>
    </div>
  ),
};
