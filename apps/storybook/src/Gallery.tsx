import { Fragment, type ReactNode } from "react";
import {
  Breadcrumbs,
  Callout,
  Caption,
  Card,
  Checkbox,
  DateField,
  EpicHeader,
  fromISODate,
  Markdown,
  Overline,
  PageHeading,
  SectionHeading,
  SiteSearch,
  Select,
  SubsectionHeading,
  Text,
} from "@hackcove/ui-react";
import { GalleryBars } from "./GalleryBars";
import { GalleryControls } from "./GalleryControls";
import { GalleryButtons } from "./GalleryButtons";
import { GalleryChat } from "./GalleryChat";
import { GalleryChoice } from "./GalleryChoice";
import { GalleryData } from "./GalleryData";
import { GalleryKeyValues } from "./GalleryKeyValues";
import { GalleryForm, GalleryNameField, GalleryNotes } from "./GalleryForm";
import { GalleryContainer, GalleryLayout } from "./GalleryLayout";
import { GalleryPills } from "./GalleryPills";
import { GallerySwitchers } from "./GallerySwitchers";
import { GalleryText } from "./GalleryText";
import { GalleryLinkedRows } from "./GalleryLinkedRows";
import { GalleryLinks } from "./GalleryLinks";
import {
  GalleryBleedPages,
  GalleryGridPages,
  GalleryPages,
  GalleryStatusPages,
} from "./GalleryPages";

import {
  GalleryAvatars,
  GalleryMedia,
  GalleryChips,
  GalleryCopy,
  GalleryDialogs,
  GalleryHeader,
  GalleryPageFade,
} from "./GalleryBlocks";

/**
 * One slice of the Gallery: a few blocks that sit together on the page. Overview / Gallery and
 * Overview / All themes draw them all in one page for people; the visual check shoots each slice on
 * its own (Overview / Gallery sections), because PixelSlash ends a build on a shot over 24.5 Mpx
 * (19140px tall at 1280 wide) and the whole page passed that. A new block goes into the slice it
 * belongs with; when a slice grows tall (the visual run names any shot near the limit), split it.
 */
export type GallerySection = { id: string; title: string; render: () => ReactNode };

export const gallerySections: GallerySection[] = [
  {
    id: "headings",
    title: "Headings",
    render: () => (
      <>
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
      </>
    ),
  },
  { id: "text", title: "Text", render: () => <GalleryText /> },
  {
    id: "pills-and-bars",
    title: "Pills and bars",
    render: () => (
      <>
        <GalleryPills />

        <GalleryBars />
      </>
    ),
  },
  {
    id: "data",
    title: "Data",
    render: () => (
      <>
        <Card title="Section" count={3}>
          <div className="flex flex-col gap-4">
            <EpicHeader color="#cba6f7" label="HC-42 · Voice Inbox" />
            <Markdown md={"## What I did\n- **HC-42** shipped\n- plain item"} />
          </div>
        </Card>

        <GalleryData />
      </>
    ),
  },
  {
    id: "buttons",
    title: "Buttons and avatars",
    render: () => (
      <>
        <GalleryButtons />

        <GalleryAvatars />

        <GalleryMedia />

        <GalleryCopy />
      </>
    ),
  },
  {
    id: "fields",
    title: "Fields",
    render: () => (
      <>
        <div className="flex max-w-sm flex-col gap-3">
          <GalleryNameField />
          <GalleryNotes />
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
      </>
    ),
  },
  {
    id: "choices",
    title: "Controls and choices",
    render: () => (
      <>
        <GalleryControls />

        <GalleryChoice />
      </>
    ),
  },
  {
    id: "navigation",
    title: "Navigation and notices",
    render: () => (
      <>
        <Breadcrumbs
          crumbs={[
            { label: "Org", href: "#org" },
            { label: "Project", href: "#project" },
            "Build",
            "Snapshot",
          ]}
        />

        <SiteSearch
          label="Search components"
          items={[
            { label: "Dialog", description: "A modal window.", href: "#dialog" },
            { label: "Tabs", description: "Switch a view in place.", href: "#tabs" },
          ]}
        />

        <Callout tone="warn" title="Draft.">
          This page has not yet been reviewed by a lawyer.
        </Callout>

        <GalleryLinks />

        <GalleryLinkedRows />

        <GalleryChips />

        <GallerySwitchers />
      </>
    ),
  },
  {
    id: "details",
    title: "Details and overlays",
    render: () => (
      <>
        <GalleryKeyValues />

        <GalleryChat />

        <GalleryPageFade />

        <GalleryDialogs />
      </>
    ),
  },
  {
    id: "layout",
    title: "Layout",
    render: () => (
      <>
        <GalleryLayout />

        <GalleryContainer />
      </>
    ),
  },
  { id: "page-layouts", title: "Page layouts", render: () => <GalleryPages /> },
  { id: "page-grids", title: "Grids and sidebars", render: () => <GalleryGridPages /> },
  { id: "page-bleed", title: "Full-bleed pages", render: () => <GalleryBleedPages /> },
  {
    id: "status-pages",
    title: "Status pages",
    render: () => (
      <>
        <GalleryStatusPages />

        <Text as="p" color="muted">
          nothing here yet
        </Text>
      </>
    ),
  },
];

/** Every component in @hackcove/ui-react, once each. Colour comes from the components and the theme only. */
export function Gallery() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {gallerySections.map((section) => (
        <Fragment key={section.id}>{section.render()}</Fragment>
      ))}
    </div>
  );
}

/** One slice of the Gallery on its own, at the Gallery's width. */
export function GallerySlice({ id }: { id: string }) {
  const section = gallerySections.find((candidate) => candidate.id === id);
  if (section === undefined) throw new Error(`the Gallery has no section "${id}"`);
  return <div className="flex max-w-3xl flex-col gap-6">{section.render()}</div>;
}
