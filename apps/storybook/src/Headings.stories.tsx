import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Caption,
  Display,
  Lead,
  Overline,
  PageHeading,
  SectionHeading,
  Stack,
  SubsectionHeading,
  Text,
} from "@slashsuite/ui-react";

import { CompactApp, TypeSpecimen } from "./typeSteps";

const meta: Meta = { title: "Text/Headings" };
export default meta;
type S = StoryObj;

/** One `PageHeading` names the page, `SectionHeading` its parts and `SubsectionHeading` what is inside a part. */
export const DoScale: S = {
  render: () => (
    <Stack gap="sm">
      <PageHeading>Quotes</PageHeading>
      <SectionHeading rule>Open</SectionHeading>
      <SubsectionHeading>Awaiting reply</SubsectionHeading>
      <Text>Three quotes are waiting on the customer.</Text>
    </Stack>
  ),
};

/** `PageHeading` is an `h1`, and a page has one. A second one for a section breaks the outline: use `SectionHeading`. */
export const DontScale: S = {
  render: () => (
    <Stack gap="sm">
      <PageHeading>Quotes</PageHeading>
      <Text>Three quotes are waiting on the customer.</Text>
      <PageHeading>Open</PageHeading>
      <Text>Two quotes are open.</Text>
    </Stack>
  ),
};

/** `truncate` cuts a `SubsectionHeading` that is too long for its column to one line with an ellipsis, and keeps the full text as its tooltip. */
export const Truncated: S = {
  render: () => (
    <div className="w-60">
      <SubsectionHeading truncate>
        Awaiting a reply from the customer about the revised scope
      </SubsectionHeading>
    </div>
  ),
};

/** `Display` is the one headline at the top of a public page, with a `Lead` under it. */
export const DoHero: S = {
  render: () => (
    <Stack gap="xs">
      <Display>Tools for people who build</Display>
      <Lead>The supporting sentence that sits under the headline.</Lead>
    </Stack>
  ),
};

/** `Display` is marketing scale, not a section title: inside a page it dwarfs everything around it. Use `SectionHeading`. */
export const DontHero: S = {
  render: () => (
    <Stack gap="sm">
      <PageHeading>Dashboard</PageHeading>
      <Display as="h2">Recent activity</Display>
      <Text>Nothing has changed since yesterday.</Text>
    </Stack>
  ),
};

/** `description` is a muted line under the heading. It is a paragraph beside the `<h2>`, so the heading's name stays the title. `rule` then sits under the description. */
export const SectionDescription: S = {
  render: () => (
    <Stack gap="lg">
      <SectionHeading description="What is due each month, before anything extra.">
        Monthly plan
      </SectionHeading>
      <SectionHeading rule description="Bills that repeat on a fixed day.">
        Recurring
      </SectionHeading>
    </Stack>
  ),
};

export const DisplayStory: S = {
  name: "Display",
  render: () => <Display>Tools for people who build</Display>,
};

export const PageHeadingStory: S = {
  name: "PageHeading",
  render: () => <PageHeading>Status: what's happening now</PageHeading>,
};

export const SectionHeadingStory: S = {
  name: "SectionHeading",
  render: () => <SectionHeading>In progress</SectionHeading>,
};

export const SectionHeadingRuleStory: S = {
  name: "SectionHeading rule",
  render: () => (
    <div className="max-w-xl">
      <SectionHeading rule>In progress</SectionHeading>
      <Text>The rule and the space either side of it are built in.</Text>
    </div>
  ),
};

export const SubsectionHeadingStory: S = {
  name: "SubsectionHeading",
  render: () => <SubsectionHeading>Blocked on review</SubsectionHeading>,
};

export const SubsectionHeadingSizes: S = {
  name: "SubsectionHeading size",
  render: () => (
    <div className="flex flex-col gap-2">
      <SubsectionHeading size="sm">sm: form-group caption</SubsectionHeading>
      <SubsectionHeading size="md">md (default): card title in a header bar</SubsectionHeading>
      <SubsectionHeading size="lg">lg: drawer title</SubsectionHeading>
    </div>
  ),
};

export const Specimen: S = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-4">
      <PageHeading>Typography specimen</PageHeading>
      <Text>Every semantic role in the design system, on the Catppuccin base surface.</Text>
      <div className="flex flex-col gap-1">
        <Overline>Overline</Overline>
        <SectionHeading>Section heading</SectionHeading>
        <SubsectionHeading>Subsection heading</SubsectionHeading>
      </div>
      <Text>
        This is a paragraph of{" "}
        <Text as="span" strong>
          body text
        </Text>{" "}
        a paragraph, the default, while <Text as="span">Text as="span"</Text> stays inline in a
        sentence.
      </Text>
      <Caption>Caption: fine print and metadata.</Caption>
    </div>
  ),
};

export const AsOverride: S = {
  name: "as override",
  render: () => (
    <div className="flex flex-col gap-3">
      <Caption as="span" tone="muted">
        Same PageHeading style rendered as different elements via `as`:
      </Caption>
      <PageHeading>as="h1" (default)</PageHeading>
      <PageHeading as="h2">as="h2"</PageHeading>
      <PageHeading as="div">as="div"</PageHeading>
      <Caption as="span" tone="muted">
        Text and Caption are paragraphs; as="span" is their inline form:
      </Caption>
      <Text>Text (default): a block paragraph.</Text>
      <Caption>Caption (default): a block.</Caption>
      <Overline as="label" htmlFor="x">
        Overline as="label" (accepts label props like htmlFor)
      </Overline>
    </div>
  ),
};

/** Every heading, `Text`, `Caption` and the controls at the default step: text is 16px. */
export const TypeSteps: S = {
  render: () => <TypeSpecimen />,
};

/** The same, in an app that set `AppShell density="compact"`: everything one step down. */
export const TypeStepsCompact: S = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <CompactApp>
      <TypeSpecimen />
    </CompactApp>
  ),
};

type Loading = StoryObj<{ loading: boolean }>;

/** A heading with no text yet is one bone at its own line height. */
export const Loading: Loading = {
  args: { loading: true },
  render: ({ loading }) => {
    const words = (text: string) => (loading ? undefined : text);
    return (
      <Stack gap="sm">
        <Display loading={loading}>{words("Display")}</Display>
        <Lead loading={loading}>{words("The supporting sentence under a display line.")}</Lead>
        <PageHeading loading={loading}>{words("PageHeading")}</PageHeading>
        <SectionHeading loading={loading}>{words("SectionHeading")}</SectionHeading>
        <SubsectionHeading loading={loading}>{words("SubsectionHeading")}</SubsectionHeading>
      </Stack>
    );
  },
};
