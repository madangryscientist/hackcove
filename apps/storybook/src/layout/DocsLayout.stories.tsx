import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Breadcrumbs,
  DocsLayout,
  Overline,
  Prose,
  Section,
  SidebarLayout,
  Stack,
  Tabs,
  Text,
  TextLink,
} from "@hackcove/ui-react";
import { DemoShell, layoutPage } from "./DemoShell";

/**
 * A docs page: the docs nav as the rail (folded behind "Docs" below `md`), the page's title, its
 * "On this page" list (a disclosure below `xl`, a sticky column from `xl`), the article and the
 * previous and next links. The visual check shoots each at 1280, where the list is its column.
 */
const meta: Meta = {
  title: "Page layouts/DocsLayout",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A whole docs page in the shell: nav, breadcrumbs, a `Prose` article whose h2 and h3 ids match `contents`, the second heading `current`, and previous and next. */
export const FullPage: S = {
  render: () => (
    <DemoShell>
      <DocsLayout
        nav={[
          { items: [{ label: "All docs", href: "#docs" }] },
          {
            title: "Get started",
            items: [
              { label: "Install", href: "#install", selected: true },
              { label: "First build", href: "#first-build" },
            ],
          },
          {
            title: "Guides",
            items: [
              { label: "Baselines", href: "#baselines" },
              { label: "Ignore areas", href: "#ignore" },
              { label: "CI", href: "#ci" },
            ],
          },
        ]}
        navLabel="Docs"
        breadcrumbs={<Breadcrumbs items={[{ label: "Docs", href: "#docs" }, "Install"]} />}
        title="Install"
        description="Add the CLI to a project and run its first capture."
        contents={[
          { id: "requirements", label: "Requirements", level: 2 },
          { id: "package", label: "The package", level: 2 },
          { id: "token", label: "A token", level: 3 },
          { id: "check", label: "Check it works", level: 2 },
        ]}
        current="package"
        previous={{ label: "All docs", href: "#docs" }}
        next={{ label: "First build", href: "#first-build" }}
      >
        <Prose>
          <Section id="requirements" title="Requirements">
            <Text>Bun 1.3 or Node 24, and a Storybook that builds.</Text>
          </Section>
          <Section id="package" title="The package">
            <Text>Add the CLI as a dev dependency of the project that owns the stories.</Text>
            <Section id="token" title="A token">
              <Text>Create a token on the server and keep it in the CI secrets.</Text>
            </Section>
          </Section>
          <Section id="check" title="Check it works">
            <Text>Run a capture; the report lists every story it shot.</Text>
          </Section>
        </Prose>
      </DocsLayout>
    </DemoShell>
  ),
};

/** A page with one heading: there is no "On this page" list, and no neighbours. */
export const NoContents: S = {
  render: () => (
    <DemoShell>
      <DocsLayout
        nav={[{ items: [{ label: "All docs", href: "#docs", selected: true }] }]}
        navLabel="Docs"
        title="All docs"
        contents={[{ id: "start", label: "Start here", level: 2 }]}
      >
        <Prose>
          <Section id="start" title="Start here">
            <Text>Install the CLI, then run your first build.</Text>
          </Section>
        </Prose>
      </DocsLayout>
    </DemoShell>
  ),
};

/** A docs page is one `DocsLayout`: the nav, the title, `contents` and the neighbours are props, and the layout draws the list and the links. */
export const DoDocs: S = {
  render: () => (
    <DocsLayout
      nav={[{ title: "Guides", items: [{ label: "Install", href: "#install", selected: true }] }]}
      navLabel="Docs"
      title="Install"
      contents={[
        { id: "do-setup", label: "Setup", level: 2 },
        { id: "do-run", label: "Run", level: 2 },
      ]}
      next={{ label: "First build", href: "#first-build" }}
    >
      <Section id="do-setup" title="Setup">
        <Text>Add the package.</Text>
      </Section>
      <Section id="do-run" title="Run">
        <Text>Capture the stories.</Text>
      </Section>
    </DocsLayout>
  ),
};

/** A `SidebarLayout` with a hand-built contents list and pager: two copies of the rules every docs site must then keep in step. Use `DocsLayout`. */
export const DontDocs: S = {
  render: () => (
    <SidebarLayout
      aside={
        <Tabs
          orientation="vertical"
          label="Guides"
          items={[{ label: "Install", href: "#install", selected: true }]}
        />
      }
    >
      <Stack gap="md">
        <nav aria-label="Contents">
          <Overline>Contents</Overline>
          <TextLink href="#dont-setup">Setup</TextLink> <TextLink href="#dont-run">Run</TextLink>
        </nav>
        <Section id="dont-setup" title="Setup">
          <Text>Add the package.</Text>
        </Section>
        <TextLink href="#first-build">Next: First build</TextLink>
      </Stack>
    </SidebarLayout>
  ),
};
