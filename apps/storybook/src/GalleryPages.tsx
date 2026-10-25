import type { ReactNode } from "react";
import {
  Body,
  Button,
  CenteredLayout,
  ErrorPage,
  Forbidden,
  FullBleedLayout,
  Maintenance,
  NavTabs,
  NotFound,
  Offline,
  Overline,
  SidebarLayout,
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

/** Every page layout in a shell box: the sequence, then the grid, sidebar, full-bleed and centred ones. */
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
      <PageBox label="SidebarLayout">
        <SidebarLayout
          rail={
            <NavTabs
              orientation="vertical"
              label="Organisations"
              items={[
                { label: "Hack Cove", href: "#hc", active: true },
                { label: "Acme", href: "#acme" },
              ]}
            />
          }
        >
          <Body as="p">The canvas.</Body>
        </SidebarLayout>
      </PageBox>
      <PageBox label="FullBleedLayout" bleed>
        <FullBleedLayout panel={<Body as="p">Panel</Body>}>
          <div className="flex h-full min-h-48 items-center justify-center bg-slate-100">
            <Body as="p">Fills the width</Body>
          </div>
        </FullBleedLayout>
      </PageBox>
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
