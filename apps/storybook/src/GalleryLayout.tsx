import {
  AppShell,
  AppShellBrand,
  Avatar,
  Button,
  Card,
  Cluster,
  ClusterGrow,
  ColourSchemeToggle,
  Container,
  Field,
  Input,
  NavTabs,
  PageHeader,
  Section,
  Stack,
  SubsectionHeading,
  Text,
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
            <Text>A Stack of Sections, gap md.</Text>
          </Section>
          <Section title="Another">
            <Text>Each Section stacks its children at gap md.</Text>
          </Section>
          <Stack gap="xs">
            <SubsectionHeading>Text block</SubsectionHeading>
            <Text as="p">A Stack at gap xs, in a narrow (max-w-3xl) column.</Text>
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
                <Text>Stack as ul: each child is an li, no markers.</Text>
              </Card>
            </li>
            <li>
              <Card>
                <Text>Second item.</Text>
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
              <Text>The page rhythm between top-level blocks: gap-12, then sm:gap-16.</Text>
            </Section>
            <Section title="Next block">
              <Text>Sections inside keep their own gap.</Text>
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
        <Text>A Container on its own: the page width and side padding, outside an AppShell.</Text>
      </Card>
    </Container>
  );
}
