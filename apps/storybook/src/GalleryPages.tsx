import type { ReactNode } from "react";
import {
  Button,
  Card,
  CardGrid,
  CenteredLayout,
  DocsLayout,
  ErrorPage,
  Forbidden,
  FullBleedLayout,
  Maintenance,
  Tabs,
  NotFound,
  Offline,
  Overline,
  ProseLayout,
  SidebarLayout,
  SideColumn,
  StickyBar,
  Text,
} from "@slashsuite/ui-react";
import { DemoShell } from "./layout/DemoShell";
import { DetailPage, FormPage, ListPage, ProsePage, StatTiles } from "./layout/pages";

/** An AppShell in a box that scrolls under its sticky header; `bleed` is for the full-height layouts. */
function PageBox({
  label,
  bleed = false,
  children,
}: {
  label: string;
  bleed?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Overline>{label}</Overline>
      <div className="h-96 overflow-y-auto rounded-xl border border-slate-200">
        <DemoShell bleed={bleed}>{children}</DemoShell>
      </div>
    </div>
  );
}

/** A list page, its detail page, then a form: they share one left edge and one first-block y. */
export function PageSequence() {
  return (
    <div className="flex flex-col gap-6">
      <PageBox label="List">
        <ListPage />
      </PageBox>
      <PageBox label="Detail">
        <DetailPage />
      </PageBox>
      <PageBox label="Form">
        <FormPage />
      </PageBox>
    </div>
  );
}

/** The layouts for a `bleed` shell: FullBleedLayout, plain and padded, a StickyBar on its own and CenteredLayout. */
export function GalleryBleedPages() {
  return (
    <div className="flex flex-col gap-6">
      <PageBox label="FullBleedLayout" bleed>
        <FullBleedLayout aside={<Text>Panel</Text>}>
          <div className="flex h-full min-h-48 items-center justify-center bg-slate-100">
            <Text>Fills the width</Text>
          </div>
        </FullBleedLayout>
      </PageBox>
      <PageBox label="FullBleedLayout padded" bleed>
        <FullBleedLayout padded aside={<Text>Panel</Text>}>
          <Card title="Padded canvas">
            <Text>Given the other layouts' page padding.</Text>
          </Card>
        </FullBleedLayout>
      </PageBox>
      <PageBox label="StickyBar" bleed>
        <StickyBar>
          <Text strong>Sticks under the header</Text>
        </StickyBar>
        <div className="p-4">
          <Text>The page scrolls under the bar.</Text>
        </div>
      </PageBox>
      <PageBox label="CenteredLayout">
        <CenteredLayout title="Sign in" description="Use your Hack Cove account.">
          <Button>Continue</Button>
        </CenteredLayout>
      </PageBox>
    </div>
  );
}

/** The page sequence, then ProseLayout in its two widths. */
export function GalleryPages() {
  return (
    <div className="flex flex-col gap-6">
      <PageSequence />
      <PageBox label="ProseLayout">
        <ProsePage />
      </PageBox>
      <PageBox label="ProseLayout width wide">
        <ProseLayout width="wide" title="Pricing" description="Pay for what you review.">
          <StatTiles columns={3} />
        </ProseLayout>
      </PageBox>
    </div>
  );
}

/** SideColumn at its default width with a folded aside, and at `asideWidth="third"`. */
function SideColumnBoxes() {
  return (
    <>
      <PageBox label="SideColumn">
        <SideColumn
          aside={
            <Card title="Reply agent">
              <Text>A 24rem column from lg.</Text>
            </Card>
          }
          asideLabel="Ask the reply agent"
        >
          <Card title="Thread">
            <Text>The main area takes the room left.</Text>
          </Card>
        </SideColumn>
      </PageBox>
      <PageBox label="SideColumn third">
        <SideColumn
          asideWidth="third"
          aside={
            <Card title="Facts">
              <Text>One third from lg.</Text>
            </Card>
          }
        >
          <Card title="Record">
            <Text>Two thirds from lg.</Text>
          </Card>
        </SideColumn>
      </PageBox>
    </>
  );
}

/** The CardGrid layouts and SidebarLayout, each in a shell box. */
export function GalleryGridPages() {
  return (
    <div className="flex flex-col gap-6">
      <PageBox label="CardGrid">
        <StatTiles columns={4} />
      </PageBox>
      <PageBox label="CardGrid columns auto, align start">
        <CardGrid columns="auto" minWidth="sm" align="start">
          <Card title="Dashboard">
            <Text>One line.</Text>
          </Card>
          <Card title="Settings">
            <Text>
              A longer note that wraps onto a few lines, so this card is taller than its neighbours.
            </Text>
          </Card>
          <Card title="Billing" footer={<Text>Footer</Text>}>
            <Text>One line.</Text>
          </Card>
        </CardGrid>
      </PageBox>
      <PageBox label="SidebarLayout">
        <SidebarLayout
          aside={
            <Tabs
              orientation="vertical"
              label="Organisations"
              items={[
                { label: "Hack Cove", href: "#hc", selected: true },
                { label: "Acme", href: "#acme" },
              ]}
            />
          }
        >
          <Text>The canvas.</Text>
        </SidebarLayout>
      </PageBox>
      <PageBox label="SidebarLayout, current link low in a long rail">
        <SidebarLayout
          asideLabel="All sections"
          aside={
            <Tabs
              orientation="vertical"
              label="Sections"
              items={Array.from({ length: 60 }, (_, i) => ({
                label: `Section ${i + 1}`,
                href: `#section-${i + 1}`,
                selected: i === 44,
              }))}
            />
          }
        >
          <Text>Section 45, scrolled into view in the rail.</Text>
        </SidebarLayout>
      </PageBox>
      <PageBox label="DocsLayout">
        <DocsLayout
          nav={[
            { title: "Guides", items: [{ label: "Install", href: "#install", selected: true }] },
          ]}
          navLabel="Docs"
          title="Install"
          contents={[
            { id: "gallery-setup", label: "Setup", level: 2 },
            { id: "gallery-keys", label: "Keys", level: 3 },
          ]}
          current="gallery-setup"
          next={{ label: "First build", href: "#first-build" }}
        >
          <Text>The article.</Text>
        </DocsLayout>
      </PageBox>
      <SideColumnBoxes />
    </div>
  );
}

/** The status pages: NotFound, ErrorPage, Offline, Maintenance and Forbidden. */
export function GalleryStatusPages() {
  return (
    <div className="flex flex-col gap-6">
      <PageBox label="NotFound">
        <NotFound />
      </PageBox>
      <PageBox label="ErrorPage">
        <ErrorPage detail="Request 4f2a91 failed" onRetry={() => {}} />
      </PageBox>
      <PageBox label="Offline">
        <Offline onRetry={() => {}} />
      </PageBox>
      <PageBox label="Maintenance">
        <Maintenance />
      </PageBox>
      <PageBox label="Forbidden">
        <Forbidden />
      </PageBox>
    </div>
  );
}
