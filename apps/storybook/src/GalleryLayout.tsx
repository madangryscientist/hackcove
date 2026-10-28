import {
  AppShell,
  AppShellBrand,
  Avatar,
  Body,
  Button,
  Cluster,
  ClusterGrow,
  Card,
  ColourSchemeToggle,
  Container,
  Field,
  Input,
  NavTabs,
  PageHeader,
  Section,
  Stack,
  SubsectionHeading,
} from "@hackcove/ui";

/** AppShell (its brand, nav and controls slots, and the Container inside it), PageHeader, Section, Stack and Cluster, in a box that scrolls under the sticky header. */
export function GalleryLayout() {
  return (
    <div className="h-80 overflow-y-auto rounded-xl border border-slate-200">
      <AppShell
        brand={
          <AppShellBrand
            href="#"
            logo={<Avatar name="Hack Cove" size="sm" />}
            label="Hack Cove"
            collapse
          />
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
            <Body>Each Section stacks its children at gap md.</Body>
          </Section>
          <Stack gap="xs">
            <SubsectionHeading>Text block</SubsectionHeading>
            <Body as="p">A Stack at gap xs, in a narrow (max-w-3xl) column.</Body>
          </Stack>
          <Stack as="form" gap="sm" aria-label="Stack as form" onSubmit={(e) => e.preventDefault()}>
            <Field label="Stack as form" htmlFor="gallery-stack-form">
              <Input id="gallery-stack-form" placeholder="A form is a Stack" />
            </Field>
            <Button type="submit">Save</Button>
          </Stack>
          <Stack as="ul" gap="sm" aria-label="Stack as ul">
            <li>
              <Card>
                <Body>Stack as ul: each child is an li, no markers.</Body>
              </Card>
            </li>
            <li>
              <Card>
                <Body>Second item.</Body>
              </Card>
            </li>
          </Stack>
          <Cluster>
            <ClusterGrow>
              <Input aria-label="Cluster input" placeholder="Cluster: the input grows" />
            </ClusterGrow>
            <Button>Save</Button>
          </Cluster>
        </Stack>
        <div className="mt-8">
          <Stack gap="xl" width="narrow">
            <Section title="Gap section">
              <Body>The page rhythm between top-level blocks: gap-12, then sm:gap-16.</Body>
            </Section>
            <Section title="Next block">
              <Body>Sections inside keep their own gap.</Body>
            </Section>
          </Stack>
        </div>
      </AppShell>
    </div>
  );
}

/** A Container on its own, outside an AppShell: the page width and side padding. */
export function GalleryContainer() {
  return (
    <Container as="section" aria-label="Container">
      <Card title="Container">
        <Body>A Container on its own: the page width and side padding, outside an AppShell.</Body>
      </Card>
    </Container>
  );
}
