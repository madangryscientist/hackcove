import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Body,
  Button,
  Card,
  Empty,
  EmptyState,
  EpicHeader,
  Markdown,
  PageHeader,
  PageTitle,
  Pill,
  Stack,
  groupByEpic,
  type LinkRenderProps,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Primitives" };
export default meta;
type S = StoryObj;

export const Pills: S = {
  render: () => (
    <div className="flex gap-2">
      <Pill>slate</Pill>
      <Pill tone="amber">amber</Pill>
      <Pill tone="emerald">emerald</Pill>
      <Pill tone="blue">blue</Pill>
      <Pill tone="red">red</Pill>
      <Pill tone="violet">violet</Pill>
      <Pill tone="sky">sky</Pill>
    </div>
  ),
};
/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** `href` makes a Pill a link, `render` the app's router `<Link>`, `onClick` a button: all with a hover dim and the focus ring. */
export const PillsInteractive: S = {
  render: () => (
    <div className="flex items-center gap-2">
      <Pill href="#flakes" tone="amber" round>
        flaky
      </Pill>
      <Pill render={(p) => <FakeLink to="/flakes" {...p} />} tone="violet">
        router link
      </Pill>
      <Pill onClick={() => undefined} tone="sky" dot>
        button
      </Pill>
    </div>
  ),
};
export const PillsRound: S = {
  render: () => (
    <div className="flex gap-2">
      <Pill round>slate</Pill>
      <Pill tone="amber" round>
        amber
      </Pill>
      <Pill tone="emerald" round>
        emerald
      </Pill>
      <Pill tone="blue" round>
        blue
      </Pill>
      <Pill tone="red" round>
        red
      </Pill>
      <Pill tone="violet" round>
        violet
      </Pill>
      <Pill tone="sky" round dot>
        sky
      </Pill>
    </div>
  ),
};
export const PillsWithDot: S = {
  render: () => (
    <div className="flex gap-2">
      <Pill dot>slate</Pill>
      <Pill tone="amber" dot>
        amber
      </Pill>
      <Pill tone="emerald" dot>
        emerald
      </Pill>
      <Pill tone="blue" dot>
        blue
      </Pill>
      <Pill tone="red" dot>
        red
      </Pill>
      <Pill tone="violet" dot>
        violet
      </Pill>
      <Pill tone="sky" dot>
        sky
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
export const Header: S = {
  render: () => <EpicHeader color="#cba6f7" label="HC-42 · Voice Inbox" />,
};
export const Title: S = {
  render: () => <PageTitle title="Status" subtitle="what's happening now" />,
};
export const MarkdownStory: S = {
  render: () => <Markdown md={"## What I did\n- **HC-42** shipped\n- plain item"} />,
};
export const EmptyLine: S = { render: () => <Empty>nothing here yet</Empty> };

/** `Empty` is the one muted line inside a Card that has nothing to show yet. */
export const DoEmptyNote: S = {
  render: () => (
    <Card title="Done" count={0}>
      <Empty>Nothing finished yet.</Empty>
    </Card>
  ),
};

/** A bare `<p>` in a Card has its own colour and size, so it drifts from every other empty Card: use `Empty`. */
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
      <Body>Projects collect the shots you upload.</Body>
    </EmptyState>
  ),
};

/** `Empty` is one muted line, not a view: with a button under it nothing says what the page is for. Use `EmptyState`. */
export const DontEmptyView: S = {
  render: () => (
    <Stack>
      <Empty>No projects yet.</Empty>
      <Button>Create a project</Button>
    </Stack>
  ),
};

/** `groupByEpic` orders the groups, real epics first by ref and "No epic" last; an `EpicHeader` heads each one. */
export const DoEpicGroups: S = {
  render: () => (
    <Card title="Open work" count={3}>
      {groupByEpic(
        [
          { task: "Record a voice note", epic: "HC-42", colour: "#cba6f7" },
          { task: "Tidy the settings page", epic: null, colour: "#9399b2" },
          { task: "Transcribe the note", epic: "HC-42", colour: "#cba6f7" },
        ],
        (item) => item.epic,
      ).map(([epic, items]) => (
        <div key={epic ?? "none"}>
          <EpicHeader color={items[0]?.colour ?? "#9399b2"} label={epic ?? "No epic"} />
          {items.map((item) => (
            <Body as="p" key={item.task}>
              {item.task}
            </Body>
          ))}
        </div>
      ))}
    </Card>
  ),
};

/** `EpicHeader` is a row of epic data with a dot in the epic's own colour, not a heading: a section is titled with `SectionHeading` or a Card `title`. */
export const DontEpicGroups: S = {
  render: () => (
    <Stack>
      <EpicHeader color="#cba6f7" label="Settings" />
      <Body as="p">Choose how the site looks and what it tells you about.</Body>
    </Stack>
  ),
};

/** `PageHeader` is the top of a page: a title, a subtitle, and the fixed margin that puts every page's first block at the same height. */
export const DoPageHeader: S = {
  render: () => <PageHeader title="Status" subtitle="What is happening now" />,
};

/** `PageTitle` is deprecated and has no bottom margin, so a page that uses it sits at a different height. Use `PageHeader`. */
export const DontPageHeader: S = {
  render: () => <PageTitle title="Status" subtitle="What is happening now" />,
};
