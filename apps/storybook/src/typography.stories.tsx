import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  Body,
  BodyStrong,
  Caption,
  Display,
  Lead,
  ModalHeading,
  Overline,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
  Subtitle,
  type TextTone,
  type TypographyColor,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Typography" };
export default meta;
type S = StoryObj;

const COLORS: TypographyColor[] = ["default", "secondary", "tertiary", "muted", "brand"];

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
  render: () => <PageHeading>Status — what's happening now</PageHeading>,
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
      <Body as="p">The rule and the space either side of it are built in.</Body>
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
      <SubsectionHeading size="sm">sm (default): form-group caption</SubsectionHeading>
      <SubsectionHeading size="base">base: card title in a header bar</SubsectionHeading>
      <SubsectionHeading size="lg">lg: drawer title</SubsectionHeading>
    </div>
  ),
};

export const ModalHeadingStory: S = {
  name: "ModalHeading",
  render: () => <ModalHeading>Close this ticket?</ModalHeading>,
};

export const SubtitleStory: S = {
  name: "Subtitle",
  render: () => <Subtitle>A short supporting line that sits under a heading.</Subtitle>,
};

export const OverlineStory: S = {
  name: "Overline",
  render: () => <Overline>Section label</Overline>,
};

export const BodyStory: S = {
  name: "Body",
  render: () => (
    <Body>
      Default running text. Inline by default, so an emphasised <BodyStrong>run of text</BodyStrong>{" "}
      composes right inside the sentence.
    </Body>
  ),
};

export const BodyPreserveNewlines: S = {
  name: "Body preserveNewlines",
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Body as="p">{"Collapsed (default):\nthe note's line break is lost."}</Body>
      <Body as="p" preserveNewlines>
        {"Preserved:\nthe note's line break is kept."}
      </Body>
    </div>
  ),
};

export const BodyTone: S = {
  name: "Body tone",
  render: () => (
    <div className="flex max-w-xl flex-col gap-1">
      <Body as="p" tone="positive">
        Saved.
      </Body>
      <Body as="p" tone="danger">
        Could not save: the name is taken.
      </Body>
      <Body as="p" tone="warn">
        This quote expires tomorrow.
      </Body>
      <Body as="p" tone="info">
        Changes sync in the background.
      </Body>
      <Body as="p" tone="muted">
        Nothing to show yet.
      </Body>
    </div>
  ),
};

export const InlineFigures: S = {
  name: "numeric, mono and truncate",
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Body as="p">
        Amount <BodyStrong numeric>1,111.11</BodyStrong> vs{" "}
        <BodyStrong numeric>8,888.88</BodyStrong> (tabular figures)
      </Body>
      <Body as="p">
        Commit <Body mono>c870e81</Body> on <Caption mono>packages/ui/src/typography.tsx</Caption>
      </Body>
      <Body as="p" truncate>
        A long line of body text that does not fit the width of its container and is cut off.
      </Body>
      <Caption as="p" truncate tone="muted">
        packages/ui/src/some/very/deeply/nested/path/typography.test.tsx
      </Caption>
    </div>
  ),
};

export const BodyStrongStory: S = {
  name: "BodyStrong",
  render: () => <BodyStrong>Emphasised body text</BodyStrong>,
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
      <Subtitle>Every semantic role in the design system, on the Catppuccin base surface.</Subtitle>
      <div className="flex flex-col gap-1">
        <Overline>Overline</Overline>
        <SectionHeading>Section heading</SectionHeading>
        <SubsectionHeading>Subsection heading</SubsectionHeading>
      </div>
      <Body as="p">
        This is a paragraph of <BodyStrong>body text</BodyStrong> rendered with <code>as="p"</code>{" "}
        so it takes block layout, while the default <Body>Body</Body> stays inline.
      </Body>
      <Caption as="p">Caption — fine print and metadata.</Caption>
    </div>
  ),
};

// Colour axis: each component × each colour --------------------------------

export const ColorAxis: S = {
  name: "Colour axis (component × color)",
  render: () => {
    const rows: Array<[string, (c: TypographyColor) => ReactNode]> = [
      ["PageHeading", (c) => <PageHeading color={c}>PageHeading</PageHeading>],
      ["SectionHeading", (c) => <SectionHeading color={c}>SectionHeading</SectionHeading>],
      [
        "SubsectionHeading",
        (c) => <SubsectionHeading color={c}>SubsectionHeading</SubsectionHeading>,
      ],
      ["ModalHeading", (c) => <ModalHeading color={c}>ModalHeading</ModalHeading>],
      ["Subtitle", (c) => <Subtitle color={c}>Subtitle</Subtitle>],
      ["Overline", (c) => <Overline color={c}>Overline</Overline>],
      ["Body", (c) => <Body color={c}>Body</Body>],
      ["BodyStrong", (c) => <BodyStrong color={c}>BodyStrong</BodyStrong>],
      ["Caption", (c) => <Caption color={c}>Caption</Caption>],
    ];
    return (
      <table className="border-separate border-spacing-x-6 border-spacing-y-3 text-left">
        <thead>
          <tr>
            <th>
              <Overline color="muted">component</Overline>
            </th>
            {COLORS.map((c) => (
              <th key={c}>
                <Overline color="muted">{c}</Overline>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, render]) => (
            <tr key={label}>
              <td className="align-middle">
                <Caption color="muted">{label}</Caption>
              </td>
              {COLORS.map((c) => (
                <td key={c} className="align-middle">
                  {render(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};

// Tone axis: each inline role × each tone ----------------------------------

const TONES: TextTone[] = ["muted", "positive", "warn", "danger", "info"];

export const ToneAxis: S = {
  name: "Tone axis (inline role × tone)",
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3 text-left">
      <thead>
        <tr>
          <th />
          {TONES.map((t) => (
            <th key={t}>
              <Overline color="muted">{t}</Overline>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(
          [
            ["Body", (t: TextTone) => <Body tone={t}>Body</Body>],
            ["BodyStrong", (t: TextTone) => <BodyStrong tone={t}>BodyStrong</BodyStrong>],
            ["Caption", (t: TextTone) => <Caption tone={t}>Caption</Caption>],
            ["Overline", (t: TextTone) => <Overline tone={t}>Overline</Overline>],
          ] satisfies Array<[string, (t: TextTone) => ReactNode]>
        ).map(([label, render]) => (
          <tr key={label}>
            <td>
              <Caption color="muted">{label}</Caption>
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
      <Caption color="muted">
        Same PageHeading style rendered as different elements via `as`:
      </Caption>
      <PageHeading>as="h1" (default)</PageHeading>
      <PageHeading as="h2">as="h2"</PageHeading>
      <PageHeading as="div">as="div"</PageHeading>
      <Caption color="muted">Inline roles turned into block elements:</Caption>
      <Body as="p">Body as="p" — now a block paragraph.</Body>
      <Caption as="p">Caption as="p" — now a block.</Caption>
      <Overline as="label" htmlFor="x">
        Overline as="label" (accepts label props like htmlFor)
      </Overline>
    </div>
  ),
};
