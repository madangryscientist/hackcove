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

/** `Steps` numbers itself: give each `Step` a `title` and a line of detail, in the order they are done. */
export const DoNumbers: S = {
  render: () => (
    <Steps aria-label="Get started">
      <Step title="Install the CLI">
        Run <Code>bun add -d pixelslash</Code> in your repo.
      </Step>
      <Step title="Upload a build">
        Run <Code>pixelslash upload</Code>.
      </Step>
    </Steps>
  ),
};

/** Typed numbers double up with the ones `Steps` draws, and drift when a step is added. Leave the numbering to `Steps`. */
export const DontNumbers: S = {
  render: () => (
    <Steps aria-label="Get started">
      <Step title="1. Install the CLI">Run bun add -d pixelslash in your repo.</Step>
      <Step title="2. Upload a build">Run pixelslash upload.</Step>
    </Steps>
  ),
};

/** `Steps` is for things done in order, from the first to the last. */
export const DoOrder: S = {
  render: () => (
    <Steps>
      <Step title="Sign in" />
      <Step title="Pick a project" />
      <Step title="Upload a build" />
    </Steps>
  ),
};

/** Numbering features that have no order tells the reader there is a sequence to follow. Use a `BulletList`. */
export const DontOrder: S = {
  render: () => (
    <Steps>
      <Step title="Light and dark themes" />
      <Step title="Keyboard shortcuts" />
      <Step title="Email digests" />
    </Steps>
  ),
};
