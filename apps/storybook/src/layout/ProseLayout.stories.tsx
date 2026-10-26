import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Card, ListLayout, ProseLayout, SectionHeading } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";
import { ProsePage } from "./pages";

/** The `max-w-3xl` reading column starts at the title's x, with the header inside it: the e2e's every-Layout-story check holds the title's x to the logo's. */
const meta: Meta = {
  title: "Layout/ProseLayout",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const Privacy: S = {
  render: () => (
    <DemoShell>
      <ProsePage />
    </DemoShell>
  ),
};

/** Text pages (privacy, terms, help) are one reading column; the header sits inside it. */
export const DoArticle: S = {
  render: () => (
    <ProseLayout title="Privacy" subtitle="How we handle your data.">
      <SectionHeading>What we keep</SectionHeading>
      <Body as="p">We keep your account details and the quotes you send, and nothing else.</Body>
      <SectionHeading>Who sees it</SectionHeading>
      <Body as="p">Only you and the people you invite to your organisation.</Body>
    </ProseLayout>
  ),
};

/** `ListLayout` is for lists: its content runs the full width, so lines of text get too long to read. Use `ProseLayout`. */
export const DontArticle: S = {
  render: () => (
    <ListLayout title="Privacy" subtitle="How we handle your data.">
      <Card>
        <Body as="p">
          We keep your account details and the quotes you send, and nothing else. Only you and the
          people you invite to your organisation can see them.
        </Body>
      </Card>
    </ListLayout>
  ),
};
