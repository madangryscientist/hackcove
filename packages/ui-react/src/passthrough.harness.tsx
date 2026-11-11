import { CalendarDate } from "@internationalized/date";
import type { ReactElement } from "react";
import * as ui from "./index.js";

/** The two attributes every case passes, and every test looks for. */
export const A = { "data-testid": "probe", "aria-describedby": "described" } as const;
const noop = () => undefined;
const ITEMS = [<li key="x">x</li>];

/** One render of each exported component, with both attributes. */
export const CASES: Record<string, () => ReactElement> = {
  AppShell: () => <ui.AppShell {...A}>x</ui.AppShell>,
  AppShellBrand: () => <ui.AppShellBrand label="Brand" href="/" {...A} />,
  AppShellHideBelow: () => <ui.AppShellHideBelow {...A}>x</ui.AppShellHideBelow>,
  Avatar: () => <ui.Avatar name="Ada Lovelace" {...A} />,
  AvatarStack: () => <ui.AvatarStack people={[{ name: "Ada Lovelace" }]} {...A} />,
  Badge: () => <ui.Badge count={3} {...A} />,
  Breadcrumbs: () => <ui.Breadcrumbs crumbs={["Home", "Page"]} {...A} />,
  BulletList: () => <ui.BulletList {...A} />,
  Button: () => <ui.Button {...A}>x</ui.Button>,
  ButtonGroup: () => <ui.ButtonGroup {...A}>x</ui.ButtonGroup>,
  Callout: () => <ui.Callout {...A}>x</ui.Callout>,
  Caption: () => <ui.Caption {...A}>x</ui.Caption>,
  Card: () => <ui.Card {...A}>x</ui.Card>,
  CardGrid: () => <ui.CardGrid {...A}>x</ui.CardGrid>,
  CenteredLayout: () => <ui.CenteredLayout title="T" {...A} />,
  ChatComposer: () => <ui.ChatComposer label="Message" onSend={noop} {...A} />,
  ChatMessage: () => (
    <ui.ChatMessage role="user" author="Ada" {...A}>
      x
    </ui.ChatMessage>
  ),
  ChatThread: () => (
    <ui.ChatThread label="Chat" {...A}>
      x
    </ui.ChatThread>
  ),
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
  Lightbox: () => (
    <ui.Lightbox label="L" onClose={noop} {...A}>
      x
    </ui.Lightbox>
  ),
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
  InlineEdit: () => (
    <ui.InlineEdit label="Edit" renderEditor={() => null} {...A}>
      x
    </ui.InlineEdit>
  ),
  Input: () => <ui.Input {...A} />,
  Image: () => <ui.Image src="/x.jpg" alt="X" {...A} />,
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
  MediaTile: () => <ui.MediaTile src="/x.jpg" alt="X" onClick={noop} {...A} />,
  MetaList: () => <ui.MetaList {...A}>{ITEMS}</ui.MetaList>,
  NotFound: () => <ui.NotFound {...A} />,
  Offline: () => <ui.Offline {...A} />,
  OutlineRegion: () => (
    <ui.OutlineRegion
      rect={{ x: 0, y: 0, width: 1, height: 1 }}
      within={{ width: 2, height: 2 }}
      {...A}
    />
  ),
  Overline: () => <ui.Overline {...A}>x</ui.Overline>,
  PageFade: () => <ui.PageFade {...A}>x</ui.PageFade>,
  PageHeader: () => <ui.PageHeader title="T" {...A} />,
  PageHeading: () => <ui.PageHeading {...A}>x</ui.PageHeading>,
  RegionFrame: () => <ui.RegionFrame src="/x.png" alt="" {...A} />,
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
  Prose: () => <ui.Prose {...A}>x</ui.Prose>,
  ProseLayout: () => (
    <ui.ProseLayout title="T" {...A}>
      x
    </ui.ProseLayout>
  ),
  SectionHeading: () => <ui.SectionHeading {...A}>x</ui.SectionHeading>,
  ScrollStrip: () => (
    <ui.ScrollStrip label="Strip" {...A}>
      x
    </ui.ScrollStrip>
  ),
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
  SideColumn: () => (
    <ui.SideColumn aside="a" {...A}>
      x
    </ui.SideColumn>
  ),
  SidebarLayout: () => (
    <ui.SidebarLayout rail="r" {...A}>
      x
    </ui.SidebarLayout>
  ),
  Legend: () => <ui.Legend items={[{ label: "a", tone: "info" }]} {...A} />,
  SplitBar: () => <ui.SplitBar a={1} b={2} label="L" names={["a", "b"]} {...A} />,
  Stack: () => <ui.Stack {...A}>x</ui.Stack>,
  StickyBar: () => <ui.StickyBar {...A}>x</ui.StickyBar>,
  StackedBar: () => (
    <ui.StackedBar segments={[{ label: "a", value: 1, tone: "info" }]} label="L" {...A} />
  ),
  StatTile: () => <ui.StatTile label="L" value="1" {...A} />,
  Switch: () => <ui.Switch aria-label="Flag" checked onChange={noop} {...A} />,
  SubsectionHeading: () => <ui.SubsectionHeading {...A}>x</ui.SubsectionHeading>,
  Table: () => (
    <ui.Table {...A}>
      <ui.TableBody>{null}</ui.TableBody>
    </ui.Table>
  ),
  TableBody: () => <ui.TableBody {...A}>{null}</ui.TableBody>,
  TableCell: () => <ui.TableCell {...A}>x</ui.TableCell>,
  TableEditCell: () => (
    <ui.TableEditCell label="Edit" renderEditor={() => null} {...A}>
      x
    </ui.TableEditCell>
  ),
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
  ToolCallCard: () => (
    <ui.ToolCallCard name="search" status="done" {...A}>
      x
    </ui.ToolCallCard>
  ),
  Video: () => <ui.Video src="/x.mp4" {...A} />,
};
