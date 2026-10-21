import {
  Body,
  Button,
  BodyStrong,
  Caption,
  Card,
  Display,
  Empty,
  EpicHeader,
  IconButton,
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

      <div className="flex flex-wrap gap-2">
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="ghost">Skip</Button>
        <IconButton label="Switch to dark theme">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          </svg>
        </IconButton>
      </div>

      <Empty>nothing here yet</Empty>
    </div>
  );
}
