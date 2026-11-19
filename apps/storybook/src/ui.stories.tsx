import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Card, EmptyState, Markdown, Pill, Stack, Text } from "@slashsuite/ui-react";

const meta: Meta = { title: "Text/Body text" };
export default meta;
type S = StoryObj;

export const Pills: S = {
  render: () => (
    <div className="flex gap-2">
      <Pill>neutral</Pill>
      <Pill tone="warn">warn</Pill>
      <Pill tone="positive">positive</Pill>
      <Pill tone="info">info</Pill>
      <Pill tone="danger">danger</Pill>
      <Pill tone="accent">accent</Pill>
    </div>
  ),
};
/** `href` makes a Pill a link (an in-app one through the app's router `<Link>`), `onClick` a button: all with a hover dim and the focus ring. */
export const PillsInteractive: S = {
  render: () => (
    <div className="flex items-center gap-2">
      <Pill href="#flakes" tone="warn" round>
        flaky
      </Pill>
      <Pill href="/flakes" tone="accent">
        router link
      </Pill>
      <Pill onClick={() => undefined} tone="info" dot>
        button
      </Pill>
    </div>
  ),
};
export const PillsRound: S = {
  render: () => (
    <div className="flex gap-2">
      <Pill round>neutral</Pill>
      <Pill tone="warn" round>
        warn
      </Pill>
      <Pill tone="positive" round>
        positive
      </Pill>
      <Pill tone="info" round>
        info
      </Pill>
      <Pill tone="danger" round>
        danger
      </Pill>
      <Pill tone="accent" round>
        accent
      </Pill>
      <Pill tone="info" round dot>
        sky
      </Pill>
    </div>
  ),
};
export const PillsWithDot: S = {
  render: () => (
    <div className="flex gap-2">
      <Pill dot>neutral</Pill>
      <Pill tone="warn" dot>
        warn
      </Pill>
      <Pill tone="positive" dot>
        positive
      </Pill>
      <Pill tone="info" dot>
        info
      </Pill>
      <Pill tone="danger" dot>
        danger
      </Pill>
      <Pill tone="accent" dot>
        accent
      </Pill>
    </div>
  ),
};
export const CardStory: S = {
  render: () => (
    <Card title="Section" count={3}>
      body content
    </Card>
  ),
};
export const CardAsArticle: S = {
  render: () => (
    <Card as="article" title="Article card">
      body
    </Card>
  ),
};
export const MarkdownStory: S = {
  render: () => <Markdown md={"## What I did\n- **HC-42** shipped\n- plain item"} />,
};
export const EmptyLine: S = {
  render: () => <Text tone="muted">nothing here yet</Text>,
};

/** A Card with nothing to show yet holds one muted line, `Text tone="muted"`. */
export const DoEmptyNote: S = {
  render: () => (
    <Card title="Done" count={0}>
      <Text tone="muted">Nothing finished yet.</Text>
    </Card>
  ),
};

/** A bare `<p>` in a Card has its own colour and size, so it drifts from every other empty Card: use `Text tone="muted"`. */
export const DontEmptyNote: S = {
  render: () => (
    <Card title="Done" count={0}>
      <p>Nothing finished yet.</p>
    </Card>
  ),
};

/** A whole view with nothing in it, and a way forward, is an `EmptyState` with its `actions`. */
export const DoEmptyView: S = {
  render: () => (
    <EmptyState title="No projects yet" actions={<Button>Create a project</Button>}>
      <Text>Projects collect the shots you upload.</Text>
    </EmptyState>
  ),
};

/** One muted line is not a view: with a button under it nothing says what the page is for. Use `EmptyState`. */
export const DontEmptyView: S = {
  render: () => (
    <Stack>
      <Text tone="muted">No projects yet.</Text>
      <Button>Create a project</Button>
    </Stack>
  ),
};
