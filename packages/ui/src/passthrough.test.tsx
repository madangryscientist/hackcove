// @vitest-environment jsdom
import { CalendarDate } from "@internationalized/date";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mount, stubDialog, unmount } from "./dom.harness.js";
import * as ui from "./index.js";

// Every exported component passes `data-*` and `aria-*` through: a consumer hangs an e2e hook
// (`data-testid`) or a description on the part itself and never wraps it in an element of its own.
// Each case renders one component with both attributes; the last test fails for an export that has
// no case, so a new component adds its own.

const A = { "data-testid": "probe", "aria-describedby": "described" } as const;
const noop = () => undefined;
const ITEMS = [<li key="x">x</li>];

const CASES: Record<string, () => ReactElement> = {
  AppShell: () => <ui.AppShell {...A}>x</ui.AppShell>,
  AppShellBrand: () => <ui.AppShellBrand label="Brand" href="/" {...A} />,
  Avatar: () => <ui.Avatar name="Ada Lovelace" {...A} />,
  Badge: () => <ui.Badge count={3} {...A} />,
  Breadcrumbs: () => <ui.Breadcrumbs crumbs={["Home", "Page"]} {...A} />,
  BulletList: () => <ui.BulletList {...A} />,
  Button: () => <ui.Button {...A}>x</ui.Button>,
  ButtonGroup: () => <ui.ButtonGroup {...A}>x</ui.ButtonGroup>,
  ButtonLink: () => (
    <ui.ButtonLink href="/x" {...A}>
      x
    </ui.ButtonLink>
  ),
  Callout: () => <ui.Callout {...A}>x</ui.Callout>,
  Caption: () => <ui.Caption {...A}>x</ui.Caption>,
  Card: () => <ui.Card {...A}>x</ui.Card>,
  CardGrid: () => <ui.CardGrid {...A}>x</ui.CardGrid>,
  CenteredLayout: () => <ui.CenteredLayout title="T" {...A} />,
  Checkbox: () => <ui.Checkbox {...A} />,
  Cluster: () => <ui.Cluster {...A}>x</ui.Cluster>,
  ClusterGrow: () => <ui.ClusterGrow {...A}>x</ui.ClusterGrow>,
  Code: () => <ui.Code {...A}>x</ui.Code>,
  CodeBlock: () => <ui.CodeBlock {...A}>x</ui.CodeBlock>,
  CodeExample: () => (
    <ui.CodeExample code="x" {...A}>
      x
    </ui.CodeExample>
  ),
  ColourSchemeToggle: () => <ui.ColourSchemeToggle {...A} />,
  Container: () => <ui.Container {...A}>x</ui.Container>,
  CopyButton: () => <ui.CopyButton text="x" {...A} />,
  CopyLine: () => <ui.CopyLine text="x" {...A} />,
  DateField: () => <ui.DateField label="Day" defaultValue={new CalendarDate(2026, 1, 2)} {...A} />,
  DatePicker: () => (
    <ui.DatePicker label="Day" defaultValue={new CalendarDate(2026, 1, 2)} {...A} />
  ),
  DetailLayout: () => (
    <ui.DetailLayout title="T" aside="a" {...A}>
      x
    </ui.DetailLayout>
  ),
  Dialog: () => <ui.Dialog title="T" onClose={noop} {...A} />,
  Display: () => <ui.Display {...A}>x</ui.Display>,
  Disclosure: () => (
    <ui.Disclosure summary="S" {...A}>
      x
    </ui.Disclosure>
  ),
  Divider: () => <ui.Divider {...A} />,
  Drawer: () => <ui.Drawer title="T" onClose={noop} {...A} />,
  EpicHeader: () => <ui.EpicHeader color="#000" label="Epic" {...A} />,
  ErrorPage: () => <ui.ErrorPage {...A} />,
  Field: () => (
    <ui.Field label="L" htmlFor="f" {...A}>
      <ui.Input id="f" />
    </ui.Field>
  ),
  FieldDialog: () => (
    <ui.FieldDialog
      title="T"
      label="L"
      inputLabel="I"
      placeholder="p"
      hint="h"
      emptyReason="e"
      submit="s"
      busyLabel="b"
      onSubmit={async () => undefined}
      onClose={noop}
      {...A}
    />
  ),
  FileDrop: () => <ui.FileDrop {...A}>x</ui.FileDrop>,
  FilterGroup: () => <ui.FilterGroup legend="L" {...A} />,
  Forbidden: () => <ui.Forbidden {...A} />,
  FormGrid: () => <ui.FormGrid {...A}>x</ui.FormGrid>,
  FormLayout: () => (
    <ui.FormLayout title="T" {...A}>
      x
    </ui.FormLayout>
  ),
  FormRow: () => <ui.FormRow {...A}>x</ui.FormRow>,
  FormRowField: () => (
    <ui.FormRowField label="L" htmlFor="f" {...A}>
      <ui.Input id="f" />
    </ui.FormRowField>
  ),
  FullBleedLayout: () => <ui.FullBleedLayout {...A}>x</ui.FullBleedLayout>,
  Icon: () => (
    <ui.Icon {...A}>
      <svg />
    </ui.Icon>
  ),
  IconButton: () => (
    <ui.IconButton label="L" {...A}>
      x
    </ui.IconButton>
  ),
  InlineLinks: () => <ui.InlineLinks {...A}>{ITEMS}</ui.InlineLinks>,
  Input: () => <ui.Input {...A} />,
  Kbd: () => <ui.Kbd {...A}>k</ui.Kbd>,
  KeyValue: () => (
    <ui.KeyValueList>
      <ui.KeyValue label="K" {...A}>
        v
      </ui.KeyValue>
    </ui.KeyValueList>
  ),
  KeyValueList: () => <ui.KeyValueList {...A}>x</ui.KeyValueList>,
  Lead: () => <ui.Lead {...A}>x</ui.Lead>,
  ListLayout: () => (
    <ui.ListLayout title="T" {...A}>
      x
    </ui.ListLayout>
  ),
  ListRow: () => <ui.ListRow {...A}>x</ui.ListRow>,
  Maintenance: () => <ui.Maintenance {...A} />,
  Markdown: () => <ui.Markdown md="x" {...A} />,
  MetaList: () => <ui.MetaList {...A}>{ITEMS}</ui.MetaList>,
  NavTabs: () => <ui.NavTabs label="L" items={[{ label: "A", href: "/a", active: true }]} {...A} />,
  NotFound: () => <ui.NotFound {...A} />,
  Offline: () => <ui.Offline {...A} />,
  Overline: () => <ui.Overline {...A}>x</ui.Overline>,
  PageFade: () => <ui.PageFade {...A}>x</ui.PageFade>,
  PageHeader: () => <ui.PageHeader title="T" {...A} />,
  PageHeading: () => <ui.PageHeading {...A}>x</ui.PageHeading>,
  PageTitle: () => <ui.PageTitle title="T" {...A} />,
  Radio: () => (
    <ui.RadioGroup label="L">
      <ui.Radio value="a" label="A" {...A} />
    </ui.RadioGroup>
  ),
  RadioGroup: () => (
    <ui.RadioGroup label="L" {...A}>
      <ui.Radio value="a" label="A" />
    </ui.RadioGroup>
  ),
  Pill: () => <ui.Pill {...A}>x</ui.Pill>,
  ProgressBar: () => <ui.ProgressBar value={1} label="L" {...A} />,
  ProseLayout: () => (
    <ui.ProseLayout title="T" {...A}>
      x
    </ui.ProseLayout>
  ),
  SectionHeading: () => <ui.SectionHeading {...A}>x</ui.SectionHeading>,
  Section: () => <ui.Section {...A}>x</ui.Section>,
  SegmentedControl: () => (
    <ui.SegmentedControl
      value="a"
      label="L"
      onChange={noop}
      items={[{ value: "a", label: "A" }]}
      {...A}
    />
  ),
  Select: () => <ui.Select {...A} />,
  SidebarLayout: () => (
    <ui.SidebarLayout rail="r" {...A}>
      x
    </ui.SidebarLayout>
  ),
  Legend: () => <ui.Legend items={[{ label: "a", tone: "info" }]} {...A} />,
  SplitBar: () => <ui.SplitBar a={1} b={2} label="L" names={["a", "b"]} {...A} />,
  Stack: () => <ui.Stack {...A}>x</ui.Stack>,
  StackedBar: () => (
    <ui.StackedBar segments={[{ label: "a", value: 1, tone: "info" }]} label="L" {...A} />
  ),
  StatTile: () => <ui.StatTile label="L" value="1" {...A} />,
  SubsectionHeading: () => <ui.SubsectionHeading {...A}>x</ui.SubsectionHeading>,
  Table: () => (
    <ui.Table {...A}>
      <ui.TableBody>{null}</ui.TableBody>
    </ui.Table>
  ),
  TableBody: () => <ui.TableBody {...A}>{null}</ui.TableBody>,
  TableCell: () => <ui.TableCell {...A}>x</ui.TableCell>,
  TableFoot: () => <ui.TableFoot {...A}>{null}</ui.TableFoot>,
  TableGroupRow: () => <ui.TableGroupRow colSpan={2} label="G" {...A} />,
  TableHead: () => <ui.TableHead {...A}>{null}</ui.TableHead>,
  TableHeaderCell: () => <ui.TableHeaderCell {...A}>x</ui.TableHeaderCell>,
  TableRow: () => <ui.TableRow {...A}>{null}</ui.TableRow>,
  Tabs: () => (
    <ui.Tabs value="a" label="L" onChange={noop} items={[{ value: "a", label: "A" }]} {...A} />
  ),
  Textarea: () => <ui.Textarea {...A} />,
  TextLink: () => (
    <ui.TextLink href="/x" {...A}>
      x
    </ui.TextLink>
  ),
  EmptyState: () => <ui.EmptyState title="T" {...A} />,
  Step: () => <ui.Step title="T" {...A} />,
  Steps: () => <ui.Steps {...A}>{ITEMS}</ui.Steps>,
  Text: () => <ui.Text {...A}>x</ui.Text>,
  Timeline: () => (
    <ui.Timeline label="L" {...A}>
      {ITEMS}
    </ui.Timeline>
  ),
  TimelineItem: () => <ui.TimelineItem title="T" {...A} />,
  ToggleChip: () => (
    <ui.ToggleChip pressed {...A}>
      x
    </ui.ToggleChip>
  ),
  Video: () => <ui.Video src="/x.mp4" {...A} />,
};

/** Where a case lands: the `<dialog>`s sit in the document, the rest in the mounted container. */
function probes(): Element[] {
  return Array.from(document.querySelectorAll('[data-testid="probe"]'));
}

/**
 * React Aria's date field puts `data-*` on its wrapper and `aria-describedby` on the field group
 * (merging the id with its own description), so the description is asserted inside the probe. A
 * `Radio` does the same: `data-*` on its label, the description on the input inside it.
 */
const SPLIT = new Set(["DateField", "DatePicker", "Radio"]);

describe("every exported component passes data-* and aria-* through", () => {
  beforeEach(stubDialog);
  afterEach(unmount);

  it("has a case for every exported component, and no stale one", () => {
    const components = Object.keys(ui).filter((name) => /^[A-Z]/.test(name));
    expect(Object.keys(CASES).toSorted()).toEqual(components.toSorted());
  });

  for (const [name, build] of Object.entries(CASES).filter(([n]) => !SPLIT.has(n))) {
    it(`${name} puts both on one element`, () => {
      mount(build());
      const found = probes();
      expect(found, `${name}: no element carries data-testid`).toHaveLength(1);
      expect(found[0]?.getAttribute("aria-describedby"), `${name}: aria-describedby`).toBe(
        "described",
      );
    });
  }

  it("a Card that is a link puts both on the card root, not on the link inside it", () => {
    mount(
      <ui.Card href="/x" title="T" {...A}>
        x
      </ui.Card>,
    );
    const found = probes();
    expect(found).toHaveLength(1);
    expect(found[0]?.tagName).toBe("DIV");
    expect(found[0]?.getAttribute("aria-describedby")).toBe("described");
    expect(found[0]?.querySelector("a")?.hasAttribute("aria-describedby")).toBe(false);
  });

  for (const name of SPLIT) {
    it(`${name} puts data-* on its wrapper and the description on the field inside`, () => {
      mount(CASES[name]?.() ?? <div />);
      const found = probes();
      expect(found, `${name}: no element carries data-testid`).toHaveLength(1);
      expect(found[0]?.querySelector('[aria-describedby~="described"]')).not.toBeNull();
    });
  }
});
