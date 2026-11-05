import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AppShell,
  Button,
  Card,
  CardGrid,
  ListLayout,
  Tabs,
  ProseLayout,
  SectionHeading,
  Text,
} from "@hackcove/ui-react";
import { DemoShell, layoutPage } from "./DemoShell";
import { ProsePage } from "./pages";

/** The `max-w-3xl` reading column starts at the title's x, with the header inside it: the e2e's every-Layout-story check holds the title's x to the logo's. */
const meta: Meta = {
  title: "Page layouts/ProseLayout",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole text page: the shell with its brand and nav, then one reading column with the header inside it. */
export const FullPage: S = {
  render: () => (
    <AppShell
      brand={<a href="#">Hack Cove</a>}
      nav={
        <Tabs
          variant="pill"
          label="Main"
          items={[
            { label: "Quotes", href: "#quotes", active: true },
            { label: "Clients", href: "#clients" },
          ]}
        />
      }
    >
      <ProseLayout title="Privacy" subtitle="How we handle your data.">
        <SectionHeading>What we keep</SectionHeading>
        <Text as="p">We keep your account details and the quotes you send, and nothing else.</Text>
        <SectionHeading>Who sees it</SectionHeading>
        <Text as="p">Only you and the people you invite to your organisation.</Text>
      </ProseLayout>
    </AppShell>
  ),
};

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
      <Text as="p">We keep your account details and the quotes you send, and nothing else.</Text>
      <SectionHeading>Who sees it</SectionHeading>
      <Text as="p">Only you and the people you invite to your organisation.</Text>
    </ProseLayout>
  ),
};

/** `width="wide"` is for a page that is not long prose, such as pricing: the column is `max-w-5xl`, so cards fill the width instead of leaving the right third empty. Paragraphs and the lede keep their reading measure. */
export const Wide: S = {
  render: () => (
    <DemoShell>
      <ProseLayout
        width="wide"
        title="Pricing"
        subtitle="Pay for what you review. Every plan includes unlimited projects."
        actions={<Button>Contact sales</Button>}
      >
        <CardGrid columns={3}>
          {["Free", "Team", "Business"].map((plan) => (
            <Card key={plan} title={plan}>
              <Text as="p">Everything you need to review a visual change before it ships.</Text>
            </Card>
          ))}
        </CardGrid>
      </ProseLayout>
    </DemoShell>
  ),
};

/** `ListLayout` is for lists: its content runs the full width, so lines of text get too long to read. Use `ProseLayout`. */
export const DontArticle: S = {
  render: () => (
    <ListLayout title="Privacy" subtitle="How we handle your data.">
      <Card>
        <Text as="p">
          We keep your account details and the quotes you send, and nothing else. Only you and the
          people you invite to your organisation can see them.
        </Text>
      </Card>
    </ListLayout>
  ),
};
