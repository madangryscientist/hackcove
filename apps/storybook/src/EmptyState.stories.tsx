import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  Code,
  EmptyState,
  Section,
  Stack,
  Step,
  Steps,
  Text,
} from "@slashsuite/ui-react";

const meta: Meta = { title: "Feedback/EmptyState" };
export default meta;
type S = StoryObj;

/** On its own an empty state draws its dashed frame; `icon` sets a mark above the title. */
export const TitleAndBody: S = {
  render: () => (
    <EmptyState title="No builds yet" icon="capture">
      <Text>Builds appear here once a project has uploaded its first capture.</Text>
    </EmptyState>
  ),
};

/** The title's heading level comes from where it sits and the look stays the same: in a `Section` (an `h2`) it is an `h3`, so the outline does not skip or repeat. `level` sets it by hand. */
export const Level: S = {
  render: () => (
    <Section title="Builds">
      <EmptyState title="No builds yet">
        <Text>Builds appear here once a project has uploaded its first capture.</Text>
      </EmptyState>
    </Section>
  ),
};

export const WithActions: S = {
  render: () => (
    <EmptyState
      title="No projects yet"
      actions={
        <>
          <Button>Create a project</Button>
          <Button href="#docs" variant="outline">
            Read the docs
          </Button>
        </>
      }
    >
      <Text>A project holds the stories you compare from build to build.</Text>
    </EmptyState>
  ),
};

/** The get-your-first-build screen: the body, a numbered `Steps` list, then the actions. */
export const GetStarted: S = {
  render: () => (
    <Card>
      <EmptyState title="Get your first build" actions={<Button>Copy the token</Button>}>
        <Text>Three steps and the first comparison is on this page.</Text>
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
      <Text>Builds appear here once a project has uploaded its first capture.</Text>
    </EmptyState>
  ),
};

/** A bare "Nothing here" is a dead end: it does not say what belongs here or what to do next. */
export const DontNextStep: S = {
  render: () => <EmptyState title="Nothing here" />,
};

/** An empty list inside a card gives its `empty` slot an `EmptyState`, which the list draws as one muted line. */
export const DoInline: S = {
  render: () => (
    <Card title="Builds">
      <Stack as="ul" empty={<EmptyState title="No builds yet." />}>
        {[]}
      </Stack>
    </Card>
  ),
};

/** A muted `Text` written by hand is a second empty look, and it stays on screen when the list fills. */
export const DontInline: S = {
  render: () => (
    <Card title="Builds">
      <Text tone="muted">No builds yet.</Text>
    </Card>
  ),
};

/** `size="sm"` is one centred muted line with no heading: the form a table, a timeline or a list draws. */
export const Small: S = {
  render: () => (
    <div className="max-w-md">
      <Card>
        <EmptyState
          size="sm"
          title="No builds yet."
          actions={<Button size="sm">Upload a capture</Button>}
        >
          Builds appear here once a project has uploaded one.
        </EmptyState>
      </Card>
    </div>
  ),
};

/** `padding="inset"` pads all four sides, for an empty state in a `Card flush`, which has no padding of its own. */
export const InsetPadding: S = {
  render: () => (
    <Card flush>
      <EmptyState title="No forecast yet" padding="inset">
        <Text>Add an income and a bill to see the months ahead.</Text>
      </EmptyState>
    </Card>
  ),
};
