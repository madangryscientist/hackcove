import { useId, useState } from "react";
import {
  Avatar,
  Body,
  Button,
  BodyStrong,
  Breadcrumbs,
  Callout,
  Caption,
  Card,
  ColourSchemeToggle,
  CopyButton,
  CopyLine,
  Checkbox,
  DateField,
  DatePicker,
  Dialog,
  Display,
  Empty,
  EpicHeader,
  Field,
  FieldDialog,
  FilterGroup,
  fromISODate,
  IconButton,
  Input,
  Kbd,
  KeyValue,
  KeyValueList,
  Lead,
  Markdown,
  ModalHeading,
  NavTabs,
  Overline,
  PageHeading,
  PageTitle,
  Pill,
  Select,
  SectionHeading,
  SubsectionHeading,
  Subtitle,
  Textarea,
  ToggleChip,
} from "@hackcove/ui";
import { GalleryLayout } from "./GalleryLayout";
import { GalleryPages } from "./GalleryPages";
import { samplePhoto } from "./samplePhoto";

const searchIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 1 0 3.4 9.8l3.15 3.15a.75.75 0 1 0 1.06-1.06l-3.15-3.15A5.5 5.5 0 0 0 9 3.5Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const moonIcon = (
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
);

/** The page header block of the Gallery: a Display title, a PageTitle and a NavTabs row. */
function GalleryHeader() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Display>Hack Cove</Display>
        <Lead>The supporting sentence that sits under a Display heading.</Lead>
      </div>

      <PageTitle title="Status" subtitle="what's happening now" />

      <NavTabs
        label="Main"
        items={[
          { label: "Map", href: "/" },
          { label: "Directory", href: "/stores", active: true },
          { label: "Events", href: "/events" },
          { label: "About", href: "/about" },
        ]}
      />
    </>
  );
}

/** The filter chips block of the Gallery: four ToggleChips with category dots, one pressed, in a FilterGroup. */
function GalleryChips() {
  return (
    <FilterGroup legend="Type of shop">
      <ToggleChip pressed={false} dot="#e11d48">
        Charity
      </ToggleChip>
      <ToggleChip pressed dot="#7c3aed">
        Vintage
      </ToggleChip>
      <ToggleChip pressed={false} dot="#0891b2">
        Books
      </ToggleChip>
      <ToggleChip pressed={false} dot="#ca8a04">
        Furniture
      </ToggleChip>
    </FilterGroup>
  );
}

/** The dot Pill row of the Gallery: the five tones, each with a leading dot. */
function GalleryPillsWithDot() {
  return (
    <div className="flex flex-wrap gap-2">
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
  );
}

/** The KeyValueList block of the Gallery: a label/value row with a value and a Kbd key. */
function GalleryKeyValues() {
  return (
    <div className="max-w-sm">
      <KeyValueList>
        <KeyValue label="Size">1280×720</KeyValue>
        <KeyValue label="Next shot">
          <Kbd>j</Kbd>
        </KeyValue>
      </KeyValueList>
    </div>
  );
}

/** The two dialogs, shut: each button opens one over the page (open, they make the page inert). */
function GalleryDialogs() {
  const [open, setOpen] = useState<"dialog" | "field" | null>(null);
  const close = () => setOpen(null);
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setOpen("dialog")}>
        Open Dialog
      </Button>
      <Button variant="outline" onClick={() => setOpen("field")}>
        Open FieldDialog
      </Button>
      {open === "dialog" && (
        <Dialog
          title="Delete build"
          description="This removes the build and every snapshot in it."
          onClose={close}
          footer={<Button onClick={close}>Delete</Button>}
        >
          <Body>There is no undo.</Body>
        </Dialog>
      )}
      {open === "field" && (
        <FieldDialog
          title="New project"
          label="Name"
          inputLabel="Project name"
          placeholder="my-project"
          hint="Letters, numbers and dashes."
          emptyReason="Type a name first."
          submit="Create"
          busyLabel="Creating…"
          onSubmit={() => Promise.resolve()}
          onClose={close}
        />
      )}
    </div>
  );
}

/** The copy pair: a CopyLine (with its own CopyButton) and a bare CopyButton. */
function GalleryCopy() {
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <CopyLine text="bun add @hackcove/ui" />
      <CopyButton text="bun add @hackcove/ui" className="self-start" />
    </div>
  );
}

/** The Button row of the Gallery: the three variants, then the blocked and busy states, then an IconButton and the ColourSchemeToggle. */
function GalleryButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button disabledReason="Pick a shop first">Blocked</Button>
      <Button variant="outline" busy busyLabel="Saving…">
        Busy
      </Button>
      <IconButton label="Switch to dark theme">{moonIcon}</IconButton>
      <ColourSchemeToggle />
    </div>
  );
}

/** The Avatar set: the seven identity colours at md, a ringed stack, then initials and a photo at xl and 2xl. */
function GalleryAvatars() {
  const names = ["ada", "grace", "linus", "margaret", "dennis", "ken", "barbara"];
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex gap-2">
        {names.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </div>
      <div className="flex items-center">
        <Avatar name="ada" size="lg" ring />
        <Avatar name="grace" size="lg" ring />
        <Avatar name="linus" size="lg" ring />
      </div>
      <div className="flex items-center gap-3">
        <Avatar name="Ada Lovelace" size="xl" />
        <Avatar name="Ada Lovelace" src={samplePhoto} size="xl" />
        <Avatar name="Ada Lovelace" size="2xl" />
        <Avatar name="Ada Lovelace" src={samplePhoto} size="2xl" />
      </div>
    </div>
  );
}

/** Every component in @hackcove/ui, once each. Colour comes from the components and the theme only. */
export function Gallery() {
  const nameId = useId();
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <GalleryHeader />

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

      <GalleryPillsWithDot />

      <Card title="Section" count={3}>
        <div className="flex flex-col gap-4">
          <EpicHeader color="#cba6f7" label="HC-42 · Voice Inbox" />
          <Markdown md={"## What I did\n- **HC-42** shipped\n- plain item"} />
        </div>
      </Card>

      <GalleryButtons />

      <GalleryAvatars />

      <GalleryCopy />

      <div className="flex max-w-sm flex-col gap-3">
        <Field label="Display name" htmlFor={nameId} hint="Shown on your reviews.">
          <Input
            id={nameId}
            type="search"
            placeholder="Search by name, suburb or tag…"
            icon={searchIcon}
          />
        </Field>
        <Textarea placeholder="What did you find? How were the prices?" />
        <Select defaultValue={5}>
          <option value={5}>★★★★★ (5)</option>
          <option value={4}>★★★★ (4)</option>
          <option value={3}>★★★ (3)</option>
          <option value={2}>★★ (2)</option>
          <option value={1}>★ (1)</option>
        </Select>
        <Checkbox label="Open now" defaultChecked />
        <DatePicker label="Date of birth" defaultValue={fromISODate("1990-05-17")} />
        <DateField label="Visited on" description="DD/MM/YYYY" />
      </div>

      <Breadcrumbs crumbs={["Org", "Project", "Build", "Snapshot"]} />

      <Callout tone="warn" title="Draft.">
        This page has not yet been reviewed by a lawyer.
      </Callout>

      <GalleryChips />

      <GalleryKeyValues />

      <GalleryDialogs />

      <GalleryLayout />

      <GalleryPages />

      <Empty>nothing here yet</Empty>
    </div>
  );
}
