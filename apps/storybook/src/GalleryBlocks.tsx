import { useId, useState } from "react";
import {
  Avatar,
  AvatarStack,
  Button,
  CopyButton,
  CopyLine,
  Dialog,
  Display,
  Drawer,
  Lightbox,
  FieldDialog,
  FilterGroup,
  Image,
  KeyValue,
  KeyValueList,
  Lead,
  MediaTile,
  ScrollStrip,
  Tabs,
  PageFade,
  PageHeader,
  SegmentedControl,
  startPageTransition,
  Text,
} from "@hackcove/ui-react";
import { samplePhoto } from "./samplePhoto";
import { sampleCode } from "./sampleCode";
import { samplePortrait, sampleScenes } from "./sampleScene";

/** The page header block of the Gallery: a Display title, a PageHeader and a pill Tabs row of links. */
export function GalleryHeader() {
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
export function GalleryChips() {
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

/** The PageFade block of the Gallery: a content area that cross-fades when the page below it changes. */
export function GalleryPageFade() {
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
export function GalleryDialogs() {
  const [open, setOpen] = useState<"dialog" | "full" | "field" | "drawer" | "lightbox" | null>(
    null,
  );
  const close = () => setOpen(null);
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setOpen("dialog")}>
        Open Dialog
      </Button>
      <Button variant="outline" onClick={() => setOpen("full")}>
        Open full-screen Dialog
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
      {open === "full" && (
        <Dialog
          title="Harbour at dusk"
          size="full"
          onClose={close}
          footer={<Button onClick={close}>Close</Button>}
        >
          <Text>Fills the screen.</Text>
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
export function GalleryCopy() {
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <CopyLine text="bun add @hackcove/ui-react" />
      <CopyLine text="bun add @hackcove/ui-react" disabled />
      <div className="self-start">
        <CopyButton text="bun add @hackcove/ui-react" />
      </div>
    </div>
  );
}

/** The Avatar set: the seven identity colours at md, an AvatarStack with a "+N", a square Avatar, then initials from xs to 3xl, a photo and a clickable one. */
export function GalleryAvatars() {
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
        <Avatar name="Ada Lovelace" size="xs" />
        <Avatar name="Ada Lovelace" size="xl" />
        <Avatar name="Ada Lovelace" src={samplePhoto} size="xl" />
        <Avatar name="Ada Lovelace" size="2xl" />
        <Avatar name="Ada Lovelace" size="3xl" />
        <Avatar name="Ada Lovelace" src={samplePhoto} size="3xl" />
        <Avatar name="Ada Lovelace" src={samplePhoto} size="2xl" onClick={() => undefined} />
      </div>
    </div>
  );
}

/** The media set: an Image in three shapes, a MediaTile with a label and caption, a natural-shaped tile and a removable one, a video tile and a placeholder tile in a ScrollStrip, then an Avatar strip. */
export function GalleryMedia() {
  const first = sampleScenes[0]?.src;
  const second = sampleScenes[1]?.src;
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-start gap-4">
        <Image src={first} alt="Harbour at dusk" aspect="3:2" width="md" />
        <Image src={first} alt="Harbour at dusk, whole" aspect="square" width="md" fit="contain" />
        <Image alt="No preview yet" aspect="square" width="sm" />
        <Image src={sampleCode} alt="Pairing code" aspect="square" width="sm" framed />
      </div>
      <div className="flex items-start gap-4">
        <MediaTile src={samplePortrait.src} alt={samplePortrait.alt} aspect="natural" width="sm" />
        <MediaTile
          src={first}
          alt="Slip from the shop"
          aspect="square"
          width="sm"
          label="Slip"
          onRemove={() => undefined}
        />
      </div>
      <ScrollStrip label="Recent statuses">
        <MediaTile src={first} alt="Harbour at dusk" label="Anna" caption="09:12" />
        <MediaTile src={second} alt="Video from Ben" label="Ben" caption="0:14" video />
        <MediaTile alt="Earlier statuses" label="Earlier" onClick={() => undefined} />
        <MediaTile src={first} alt="Harbour at dusk" label="Cleo" caption="08:40" />
      </ScrollStrip>
      <ScrollStrip label="People" gap="xs">
        {["ada", "grace", "linus", "margaret", "dennis", "ken", "barbara", "alan"].map((name) => (
          <Avatar key={name} name={name} size="lg" />
        ))}
      </ScrollStrip>
    </div>
  );
}
