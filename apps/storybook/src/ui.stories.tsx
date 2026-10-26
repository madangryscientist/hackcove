import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  Empty,
  EpicHeader,
  Markdown,
  PageTitle,
  Pill,
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
