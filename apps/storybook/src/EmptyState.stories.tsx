import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Button, ButtonLink, Card, Code, EmptyState, Step, Steps } from "@hackcove/ui";

const meta: Meta = { title: "UI/EmptyState" };
export default meta;
type S = StoryObj;

export const TitleAndBody: S = {
  render: () => (
    <EmptyState title="No builds yet">
      <Body as="p">Builds appear here once a project has uploaded its first capture.</Body>
    </EmptyState>
  ),
};

export const WithActions: S = {
  render: () => (
    <EmptyState
      title="No projects yet"
      actions={
        <>
          <Button>Create a project</Button>
          <ButtonLink href="#docs" variant="outline">
            Read the docs
          </ButtonLink>
        </>
      }
    >
      <Body as="p">A project holds the stories you compare from build to build.</Body>
    </EmptyState>
  ),
};

/** The get-your-first-build screen: the body, a numbered `Steps` list, then the actions. */
export const GetStarted: S = {
  render: () => (
    <Card>
      <EmptyState title="Get your first build" actions={<Button>Copy the token</Button>}>
        <Body as="p">Three steps and the first comparison is on this page.</Body>
        <Steps>
          <Step title="Install the CLI">
            Run <Code>bun add -d pixelslash</Code> in your repo.
          </Step>
          <Step title="Add a token">Create one in Settings and export it as PIXELSLASH_TOKEN.</Step>
          <Step title="Upload a build">
            Run <Code>pixelslash upload</Code> from CI or your laptop.
          </Step>
        </Steps>
      </EmptyState>
    </Card>
  ),
};
