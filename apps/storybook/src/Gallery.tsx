import { useId, useState } from "react";
import {
  Avatar,
  AvatarStack,
  Breadcrumbs,
  Button,
  Callout,
  Caption,
  Card,
  Checkbox,
  CopyButton,
  CopyLine,
  DateField,
  Dialog,
  Display,
  Drawer,
  Lightbox,
  EpicHeader,
  FieldDialog,
  FilterGroup,
  fromISODate,
  Kbd,
  KeyValue,
  KeyValueList,
  Lead,
  Markdown,
  Tabs,
  Overline,
  PageFade,
  PageHeading,
  PageHeader,
  SectionHeading,
  SegmentedControl,
  Select,
  startPageTransition,
  SubsectionHeading,
  Text,
  Textarea,
} from "@hackcove/ui";
import { GalleryBars } from "./GalleryBars";
import { GalleryControls } from "./GalleryControls";
import { GalleryButtons } from "./GalleryButtons";
import { GalleryChoice } from "./GalleryChoice";
import { GalleryData } from "./GalleryData";
import { GalleryForm, GalleryNameField } from "./GalleryForm";
import { GalleryContainer, GalleryLayout } from "./GalleryLayout";
import { GalleryPills } from "./GalleryPills";
import { GallerySwitchers } from "./GallerySwitchers";
import { GalleryText } from "./GalleryText";
import { GalleryLinkedRows } from "./GalleryLinkedRows";
import { GalleryLinks } from "./GalleryLinks";
import { GalleryPages } from "./GalleryPages";
import { samplePhoto } from "./samplePhoto";
import { sampleScenes } from "./sampleScene";

/** The page header block of the Gallery: a Display title, a PageHeader and a pill Tabs row of links. */
function GalleryHeader() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Display>Hack Cove</Display>
        <Lead>The supporting sentence that sits under a Display heading.</Lead>
      </div>

      <PageHeader title="Status" subtitle="what's happening now" />

      <Tabs
        variant="pill"
        label="Main"
        items={[
          { label: "Map", href: "/" },
          { label: "Directory", href: "/stores", active: true },
          { label: "Events", href: "/events" },
          { label: "About", href: "/about" },
          { label: "Traces", href: "https://example.com/traces", external: true },
        ]}
      />
    </>
  );
}

/** The filter chips block of the Gallery: four pressable outline Buttons, one pressed, in a FilterGroup. */
function GalleryChips() {
  return (
    <FilterGroup legend="Type of shop">
      <Button variant="outline" size="sm" pressed={false}>
        Charity
      </Button>
      <Button variant="outline" size="sm" pressed>
        Vintage
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Books
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Furniture
      </Button>
    </FilterGroup>
  );
}

/** The KeyValueList block of the Gallery: a label/value row with a value and a Kbd key, then the left-aligned variant. */
function GalleryKeyValues() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <KeyValueList>
        <KeyValue label="Size">1280×720</KeyValue>
        <KeyValue label="Next shot">
          <Kbd>j</Kbd>
        </KeyValue>
      </KeyValueList>
      <KeyValueList align="start">
        <KeyValue label="Size">1280×720</KeyValue>
        <KeyValue label="Changed pixels">0.4%</KeyValue>
      </KeyValueList>
    </div>
  );
}

/** The PageFade block of the Gallery: a content area that cross-fades when the page below it changes. */
function GalleryPageFade() {
  const [page, setPage] = useState("overview");
  // Overview / All themes draws the Gallery once per theme in one document: each needs its own name.
  const name = `hc-page-gallery${useId().replace(/\W/g, "")}`;
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <SegmentedControl
        label="Page"
        items={[
          { value: "overview", label: "Overview" },
          { value: "activity", label: "Activity" },
        ]}
        value={page}
        onChange={(next) => startPageTransition(() => setPage(next))}
      />
      <PageFade name={name}>
        <Text>The {page} page.</Text>
      </PageFade>
    </div>
  );
}

/** The two dialogs, the Drawer and the Lightbox, shut: each button opens one over the page (open, they make the page inert). */
function GalleryDialogs() {
  const [open, setOpen] = useState<"dialog" | "field" | "drawer" | "lightbox" | null>(null);
  const close = () => setOpen(null);
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setOpen("dialog")}>
        Open Dialog
      </Button>
      <Button variant="outline" onClick={() => setOpen("field")}>
        Open FieldDialog
      </Button>
      <Button variant="outline" onClick={() => setOpen("drawer")}>
        Open Drawer
      </Button>
      <Button variant="outline" onClick={() => setOpen("lightbox")}>
        Open Lightbox
      </Button>
      {open === "dialog" && (
        <Dialog
          title="Delete build"
          description="This removes the build and every snapshot in it."
          onClose={close}
          footer={<Button onClick={close}>Delete</Button>}
        >
          <Text>There is no undo.</Text>
        </Dialog>
      )}
      {open === "drawer" && (
        <Drawer title="HC-65 · Tabs" onClose={close} footer={<Button onClick={close}>Save</Button>}>
          <KeyValueList>
            <KeyValue label="Status">In progress</KeyValue>
            <KeyValue label="Owner">Jacobus</KeyValue>
          </KeyValueList>
        </Drawer>
      )}
      {open === "lightbox" && sampleScenes[0] && (
        <Lightbox
          label="Photo from Anna"
          title="Anna"
          caption={sampleScenes[0].caption}
          onClose={close}
        >
          <img src={sampleScenes[0].src} alt={sampleScenes[0].alt} />
        </Lightbox>
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
      <CopyLine text="bun add @hackcove/ui" disabled />
      <div className="self-start">
        <CopyButton text="bun add @hackcove/ui" />
      </div>
    </div>
  );
}

/** The Avatar set: the seven identity colours at md, an AvatarStack with a "+N", a square Avatar, then initials and a photo at xl and 2xl. */
function GalleryAvatars() {
  const names = ["ada", "grace", "linus", "margaret", "dennis", "ken", "barbara"];
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex gap-2">
        {names.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </div>
      <AvatarStack
        people={["ada", "grace", "linus", "margaret", "dennis"].map((name) => ({ name }))}
        max={3}
        size="lg"
      />
      <Avatar name="Hack Cove" size="lg" shape="square" />
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
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <GalleryHeader />

      <div className="flex flex-col gap-2">
        <PageHeading>PageHeading</PageHeading>
        <SectionHeading>SectionHeading</SectionHeading>
        <SubsectionHeading>SubsectionHeading</SubsectionHeading>
        <Overline>Overline</Overline>
      </div>

      <div className="flex flex-col gap-2">
        <Text as="p">
          Text with a <Text strong>strong run</Text> inside it.
        </Text>
        <Caption as="p">Caption — fine print and metadata.</Caption>
      </div>

      <GalleryText />

      <GalleryPills />

      <GalleryBars />

      <Card title="Section" count={3}>
        <div className="flex flex-col gap-4">
          <EpicHeader color="#cba6f7" label="HC-42 · Voice Inbox" />
          <Markdown md={"## What I did\n- **HC-42** shipped\n- plain item"} />
        </div>
      </Card>

      <GalleryData />

      <GalleryButtons />

      <GalleryAvatars />

      <GalleryCopy />

      <div className="flex max-w-sm flex-col gap-3">
        <GalleryNameField />
        <Textarea placeholder="What did you find? How were the prices?" />
        <Select defaultValue={5}>
          <option value={5}>★★★★★ (5)</option>
          <option value={4}>★★★★ (4)</option>
          <option value={3}>★★★ (3)</option>
          <option value={2}>★★ (2)</option>
          <option value={1}>★ (1)</option>
        </Select>
        <Checkbox label="Open now" defaultChecked />
        <DateField calendar label="Date of birth" defaultValue={fromISODate("1990-05-17")} />
        <DateField label="Visited on" description="DD/MM/YYYY" />
      </div>

      <GalleryForm />

      <GalleryControls />

      <GalleryChoice />

      <Breadcrumbs
        crumbs={[
          { label: "Org", href: "#org" },
          { label: "Project", href: "#project" },
          "Build",
          "Snapshot",
        ]}
      />

      <Callout tone="warn" title="Draft.">
        This page has not yet been reviewed by a lawyer.
      </Callout>

      <GalleryLinks />

      <GalleryLinkedRows />

      <GalleryChips />

      <GallerySwitchers />

      <GalleryKeyValues />

      <GalleryPageFade />

      <GalleryDialogs />

      <GalleryLayout />

      <GalleryContainer />

      <GalleryPages />

      <Text as="p" color="muted">
        nothing here yet
      </Text>
    </div>
  );
}
