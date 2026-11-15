import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Caption,
  Display,
  Lead,
  Overline,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
  Text,
  type TextTone,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Text/Headings" };
export default meta;
type S = StoryObj;

// One story per component --------------------------------------------------

export const DisplayStory: S = {
  name: "Display",
  render: () => <Display>Tools for people who build</Display>,
};

export const LeadStory: S = {
  name: "Lead",
  render: () => <Lead>The supporting sentence that sits under a Display heading.</Lead>,
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

export const OverlineStory: S = {
  name: "Overline",
  render: () => <Overline>Section label</Overline>,
};

export const TextStory: S = {
  name: "Text",
  render: () => (
    <Text>
      Default running text. Inline by default, so an emphasised{" "}
      <Text as="span" strong>
        run of text
      </Text>{" "}
      composes right inside the sentence.
    </Text>
  ),
};

export const TextPreserveNewlines: S = {
  name: "Text preserveNewlines",
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Text>{"Collapsed (default):\nthe note's line break is lost."}</Text>
      <Text preserveNewlines>{"Preserved:\nthe note's line break is kept."}</Text>
    </div>
  ),
};

export const TextToneStory: S = {
  name: "Text tone",
  render: () => (
    <div className="flex max-w-xl flex-col gap-1">
      <Text tone="positive">Saved.</Text>
      <Text tone="danger">Could not save: the name is taken.</Text>
      <Text tone="warn">This quote expires tomorrow.</Text>
      <Text tone="info">Changes sync in the background.</Text>
      <Text tone="muted">Nothing to show yet.</Text>
    </div>
  ),
};

export const InlineFigures: S = {
  name: "numeric, mono and truncate",
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Text>
        Amount{" "}
        <Text as="span" strong numeric>
          1,111.11
        </Text>{" "}
        vs{" "}
        <Text as="span" strong numeric>
          8,888.88
        </Text>{" "}
        (tabular figures)
      </Text>
      <Text>
        Commit{" "}
        <Text as="span" mono>
          c870e81
        </Text>{" "}
        on{" "}
        <Caption as="span" mono>
          packages/ui-react/src/typography.tsx
        </Caption>
      </Text>
      <Text truncate>
        A long line of body text that does not fit the width of its container and is cut off.
      </Text>
      <Caption truncate tone="muted">
        packages/ui-react/src/some/very/deeply/nested/path/typography.test.tsx
      </Caption>
    </div>
  ),
};

export const TextStrongStory: S = {
  name: "Text strong",
  render: () => <Text strong>Emphasised body text</Text>,
};

export const CaptionStory: S = {
  name: "Caption",
  render: () => <Caption>Updated 2 minutes ago · HC-42</Caption>,
};

// A realistic composition of the whole scale ------------------------------

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

// Tone axis: each inline role × each tone ----------------------------------

const TONES: TextTone[] = ["neutral", "muted", "accent", "info", "positive", "warn", "danger"];

export const ToneAxis: S = {
  name: "Tone axis (inline role × tone)",
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3 text-left">
      <thead>
        <tr>
          <th />
          {TONES.map((t) => (
            <th key={t}>
              <Overline tone="muted">{t}</Overline>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(
          [
            ["Text", (t: TextTone) => <Text tone={t}>Text</Text>],
            [
              "Text strong",
              (t: TextTone) => (
                <Text strong tone={t}>
                  Text strong
                </Text>
              ),
            ],
            ["Caption", (t: TextTone) => <Caption tone={t}>Caption</Caption>],
            ["Overline", (t: TextTone) => <Overline tone={t}>Overline</Overline>],
          ] satisfies Array<[string, (t: TextTone) => ReactNode]>
        ).map(([label, render]) => (
          <tr key={label}>
            <td>
              <Caption as="span" tone="muted">
                {label}
              </Caption>
            </td>
            {TONES.map((t) => (
              <td key={t}>{render(t)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

// `as` override ------------------------------------------------------------

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
