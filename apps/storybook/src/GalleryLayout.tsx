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
  ListRow,
  Tabs,
  PageHeader,
  Pill,
  Section,
  Stack,
  SubsectionHeading,
  Text,
  Show,
} from "@hackcove/ui-react";

/** The header's controls: a viewer chip that hides below `sm`, then the scheme toggle. */
const galleryControls = (
  <>
    <Show from="sm">
      <Cluster gap="xs">
        <Avatar name="Ada Lovelace" size="sm" />
        <Text as="span">Ada Lovelace</Text>
      </Cluster>
    </Show>
    <ColourSchemeToggle />
  </>
);

/** Cluster and ClusterGrow (also with `minWidth`), Cluster as ul, and Show `from` and `below`, and Stack `rowFrom`, `width="compact"`, `align="start"` and `divided`. */
function ClusterAndStackOptions() {
  return (
    <>
      <Cluster>
        <ClusterGrow>
          <Input aria-label="Cluster input" placeholder="Cluster: the input grows" />
        </ClusterGrow>
        <Button>Save</Button>
      </Cluster>
      <Cluster wrap gap="sm">
        <Button variant="outline">Copy</Button>
        <ClusterGrow minWidth="md">
          <Text>ClusterGrow minWidth md: wraps under rather than squashing.</Text>
        </ClusterGrow>
      </Cluster>
      <Stack rowFrom="md" gap="sm">
        <ClusterGrow>
          <Card title="Stack rowFrom md">
            <Text>A column on a phone, a row from md.</Text>
          </Card>
        </ClusterGrow>
        <Card title="Side" size="sm">
          <Text>Side column.</Text>
        </Card>
      </Stack>
      <Stack width="compact">
        <Card title="Stack width compact">
          <Text>One card's width, at the left edge.</Text>
        </Card>
      </Stack>
      <Stack align="start" gap="sm">
        <Input aria-label="Stack align start" placeholder="Stack align start" />
        <Button>Keeps its width</Button>
      </Stack>
      <Cluster as="ul" aria-label="Cluster as ul">
        <li>
          <Pill>Cluster as ul</Pill>
        </li>
        <li>
          <Pill>One li</Pill>
        </li>
        <li>
          <Pill>Per item</Pill>
        </li>
      </Cluster>
      <Cluster gap="sm">
        <Show below="sm">
          <Text>Show below sm: only on a phone.</Text>
        </Show>
        <Show from="sm">
          <Text>Show from sm: gone on a phone.</Text>
        </Show>
      </Cluster>
      <Card flush>
        <Stack as="ul" divided aria-label="Stack divided">
          {["Stack divided", "Rows touch", "A line between"].map((label) => (
            <li key={label}>
              <ListRow secondary="ListRow">{label}</ListRow>
            </li>
          ))}
        </Stack>
      </Card>
    </>
  );
}

/** Sections at md (plain, a second, with a rule) and at size sm, with and without actions. */
function SectionOptions() {
  return (
    <>
      <Section title="Section">
        <Text>A Stack of Sections, gap md.</Text>
      </Section>
      <Section title="Another">
        <Text>Each Section stacks its children at gap md.</Text>
      </Section>
      <Section rule title="With a rule" actions={<Button variant="outline">Action</Button>}>
        <Text>A hairline under the title row.</Text>
      </Section>
      <Card>
        <Stack gap="sm">
          <Section size="sm" title="Section size sm">
            <Text>A small titled group, xs apart.</Text>
          </Section>
          <Section
            size="sm"
            title="With actions"
            actions={
              <Button variant="ghost" size="sm">
                Rerun
              </Button>
            }
          >
            <Text>The action at the end of the small title row.</Text>
          </Section>
        </Stack>
      </Card>
    </>
  );
}

/** AppShell (its brand, nav and controls slots, a Show viewer chip, and the Container inside it), PageHeader, Section, Stack and Cluster, in a box that scrolls under the sticky header. */
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
          <Tabs
            label="Gallery shell"
            items={[
              { label: "Builds", href: "#builds", selected: true },
              { label: "Settings", href: "#settings" },
            ]}
          />
        }
        controls={galleryControls}
        footer="Hack Cove · MIT"
      >
        <PageHeader
          title="PageHeader"
          description="in an AppShell"
          actions={<Button>Action</Button>}
        />
        <Stack width="narrow">
          <SectionOptions />
          <Stack gap="xs">
            <SubsectionHeading>Text block</SubsectionHeading>
            <Text>A Stack at gap xs, in a narrow (max-w-3xl) column.</Text>
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
          <ClusterAndStackOptions />
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
