import type { ReactNode } from "react";
import {
  Button,
  Card,
  CardGrid,
  CenteredLayout,
  ErrorPage,
  Forbidden,
  FullBleedLayout,
  Maintenance,
  Tabs,
  NotFound,
  Offline,
  Overline,
  SidebarLayout,
  StickyBar,
  Text,
} from "@hackcove/ui";
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

/** The layouts for a `bleed` shell: FullBleedLayout, plain and padded, and a StickyBar on its own. */
function BleedPages() {
  return (
    <>
      <PageBox label="FullBleedLayout" bleed>
        <FullBleedLayout panel={<Text as="p">Panel</Text>}>
          <div className="flex h-full min-h-48 items-center justify-center bg-slate-100">
            <Text as="p">Fills the width</Text>
          </div>
        </FullBleedLayout>
      </PageBox>
      <PageBox label="FullBleedLayout padded" bleed>
        <FullBleedLayout padded panel={<Text as="p">Panel</Text>}>
          <Card title="Padded canvas">
            <Text as="p">Given the other layouts' page padding.</Text>
          </Card>
        </FullBleedLayout>
      </PageBox>
      <PageBox label="StickyBar" bleed>
        <StickyBar>
          <Text strong>Sticks under the header</Text>
        </StickyBar>
        <div className="p-4">
          <Text as="p">The page scrolls under the bar.</Text>
        </div>
      </PageBox>
    </>
  );
}

/** Every page layout in a shell box: the sequence, then the grid, sidebar, full-bleed, StickyBar and centred ones. */
export function GalleryPages() {
  return (
    <div className="flex flex-col gap-6">
      <PageSequence />
      <PageBox label="ProseLayout">
        <ProsePage />
      </PageBox>
      <PageBox label="CardGrid">
        <StatTiles columns={4} />
      </PageBox>
      <PageBox label="CardGrid columns auto, align start">
        <CardGrid columns="auto" minWidth="sm" align="start">
          <Card title="Dashboard">
            <Text as="p">One line.</Text>
          </Card>
          <Card title="Settings">
            <Text as="p">
              A longer note that wraps onto a few lines, so this card is taller than its neighbours.
            </Text>
          </Card>
          <Card title="Billing" footer={<Text as="p">Footer</Text>}>
            <Text as="p">One line.</Text>
          </Card>
        </CardGrid>
      </PageBox>
      <PageBox label="SidebarLayout">
        <SidebarLayout
          rail={
            <Tabs
              variant="pill"
              orientation="vertical"
              label="Organisations"
              items={[
                { label: "Hack Cove", href: "#hc", active: true },
                { label: "Acme", href: "#acme" },
              ]}
            />
          }
        >
          <Text as="p">The canvas.</Text>
        </SidebarLayout>
      </PageBox>
      <BleedPages />
      <PageBox label="CenteredLayout">
        <CenteredLayout title="Sign in" subtitle="Use your Hack Cove account.">
          <Button>Continue</Button>
        </CenteredLayout>
      </PageBox>
      <PageBox label="NotFound">
        <NotFound homeHref="#" />
      </PageBox>
      <PageBox label="ErrorPage">
        <ErrorPage detail="Request 4f2a91 failed" onRetry={() => {}} homeHref="#" />
      </PageBox>
      <PageBox label="Offline">
        <Offline onRetry={() => {}} />
      </PageBox>
      <PageBox label="Maintenance">
        <Maintenance />
      </PageBox>
      <PageBox label="Forbidden">
        <Forbidden homeHref="#" />
      </PageBox>
    </div>
  );
}
