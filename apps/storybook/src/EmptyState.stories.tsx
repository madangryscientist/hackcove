import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ButtonLink,
  Card,
  Code,
  EmptyState,
  SectionHeading,
  Stack,
  Step,
  Steps,
  Text,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/EmptyState" };
export default meta;
type S = StoryObj;

export const TitleAndBody: S = {
  render: () => (
    <EmptyState title="No builds yet">
      <Text as="p">Builds appear here once a project has uploaded its first capture.</Text>
    </EmptyState>
  ),
};

/** `level` is the heading level of the title and the look stays the same: under a page's `h2` section it is `3`, so the outline does not skip or repeat. Default `2`. */
export const Level: S = {
  render: () => (
    <Stack gap="xl">
      <SectionHeading as="h2">Builds</SectionHeading>
      <EmptyState title="No builds yet" level={3}>
        <Text as="p">Builds appear here once a project has uploaded its first capture.</Text>
      </EmptyState>
    </Stack>
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
      <Text as="p">A project holds the stories you compare from build to build.</Text>
    </EmptyState>
  ),
};

/** The get-your-first-build screen: the body, a numbered `Steps` list, then the actions. */
export const GetStarted: S = {
  render: () => (
    <Card>
      <EmptyState title="Get your first build" actions={<Button>Copy the token</Button>}>
        <Text as="p">Three steps and the first comparison is on this page.</Text>
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

/** An empty page says what belongs here and offers the first step as the primary action. */
export const DoNextStep: S = {
  render: () => (
    <EmptyState title="No builds yet" actions={<Button>Create a project</Button>}>
      <Text as="p">Builds appear here once a project has uploaded its first capture.</Text>
    </EmptyState>
  ),
};

/** A bare "Nothing here" is a dead end: it does not say what belongs here or what to do next. */
export const DontNextStep: S = {
  render: () => <EmptyState title="Nothing here" />,
};

/** An empty list inside a card is one muted line: `Text as="p" color="muted"`. */
export const DoInline: S = {
  render: () => (
    <Card title="Builds">
      <Text as="p" color="muted">
        No builds yet.
      </Text>
    </Card>
  ),
};

/** `EmptyState` is for a whole page or list; inside a small card it is a block that dwarfs the card. */
export const DontInline: S = {
  render: () => (
    <Card title="Builds">
      <EmptyState title="No builds yet">
        <Text as="p">Builds appear here once a project has uploaded its first capture.</Text>
      </EmptyState>
    </Card>
  ),
};
