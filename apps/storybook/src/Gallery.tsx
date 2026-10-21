import {
  Body,
  BodyStrong,
  Caption,
  Card,
  Display,
  Empty,
  EpicHeader,
  Lead,
  Markdown,
  ModalHeading,
  Overline,
  PageHeading,
  PageTitle,
  Pill,
  SectionHeading,
  SubsectionHeading,
  Subtitle,
} from "@hackcove/ui";

/** Every component in @hackcove/ui, once each. Colour comes from the components and the theme only. */
export function Gallery() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Display>Hack Cove</Display>
        <Lead>The supporting sentence that sits under a Display heading.</Lead>
      </div>

      <PageTitle title="Status" subtitle="what's happening now" />

      <div className="flex flex-col gap-2">
        <PageHeading>PageHeading</PageHeading>
        <SectionHeading>SectionHeading</SectionHeading>
        <SubsectionHeading>SubsectionHeading</SubsectionHeading>
        <ModalHeading>ModalHeading</ModalHeading>
        <Subtitle>Subtitle</Subtitle>
        <Overline>Overline</Overline>
      </div>

      <div className="flex flex-col gap-2">
        <Body as="p">
          Body text with a <BodyStrong>BodyStrong run</BodyStrong> inside it.
        </Body>
        <Caption as="p">Caption — fine print and metadata.</Caption>
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill>slate</Pill>
        <Pill tone="amber">amber</Pill>
        <Pill tone="emerald">emerald</Pill>
        <Pill tone="blue">blue</Pill>
        <Pill tone="red">red</Pill>
      </div>

      <Card title="Section" count={3}>
        <div className="flex flex-col gap-4">
          <EpicHeader color="#cba6f7" label="CUE-9388 · Voice Inbox" />
          <Markdown md={"## What I did\n- **CUE-9388** shipped\n- plain item"} />
        </div>
      </Card>

      <Empty>nothing here yet</Empty>
    </div>
  );
}
