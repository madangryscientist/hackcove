import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, Empty, EpicHeader, Markdown, PageTitle, Pill } from "@hackcove/ui";

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
  render: () => <EpicHeader color="#cba6f7" label="CUE-9388 · Voice Inbox" />,
};
export const Title: S = {
  render: () => <PageTitle title="Status" subtitle="what's happening now" />,
};
export const MarkdownStory: S = {
  render: () => <Markdown md={"## What I did\n- **CUE-9388** shipped\n- plain item"} />,
};
export const EmptyState: S = { render: () => <Empty>nothing here yet</Empty> };
