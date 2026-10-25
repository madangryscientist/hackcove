import {
  AppShell,
  AppShellBrand,
  Avatar,
  Body,
  Button,
  ColourSchemeToggle,
  NavTabs,
  PageHeader,
  Section,
  Stack,
  SubsectionHeading,
} from "@hackcove/ui";

/** AppShell (its brand, nav and controls slots, and the Container inside it), PageHeader, Section and Stack, in a box that scrolls under the sticky header. */
export function GalleryLayout() {
  return (
    <div className="h-80 overflow-y-auto rounded-xl border border-slate-200">
      <AppShell
        brand={
          <AppShellBrand href="#" logo={<Avatar name="Hack Cove" size="sm" />} label="Hack Cove" />
        }
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
        <Stack width="narrow">
          <Section title="Section">
            <Body>A Stack of Sections, gap md.</Body>
          </Section>
          <Section title="Another">
            <Body>Each Section stacks its children at gap sm.</Body>
          </Section>
          <Stack gap="xs">
            <SubsectionHeading>Text block</SubsectionHeading>
            <Body as="p">A Stack at gap xs, in a narrow (max-w-3xl) column.</Body>
          </Stack>
        </Stack>
      </AppShell>
    </div>
  );
}
