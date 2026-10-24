import {
  AppShell,
  Body,
  Button,
  ColourSchemeToggle,
  NavTabs,
  PageHeader,
  Section,
  Stack,
} from "@hackcove/ui";

/** AppShell (its brand, nav and controls slots, and the Container inside it), PageHeader, Section and Stack, in a box that scrolls under the sticky header. */
export function GalleryLayout() {
  return (
    <div className="h-80 overflow-y-auto rounded-xl border border-slate-200">
      <AppShell
        brand="Hack Cove"
        nav={
          <NavTabs
            label="Gallery shell"
            items={[
              { label: "Builds", href: "#builds", active: true },
              { label: "Settings", href: "#settings" },
            ]}
          />
        }
        controls={<ColourSchemeToggle />}
        footer="Hack Cove · MIT"
      >
        <PageHeader
          title="PageHeader"
          subtitle="in an AppShell"
          actions={<Button>Action</Button>}
        />
        <Stack>
          <Section title="Section">
            <Body>A Stack of Sections, gap md.</Body>
          </Section>
          <Section title="Another">
            <Body>Each Section stacks its children at gap sm.</Body>
          </Section>
        </Stack>
      </AppShell>
    </div>
  );
}
