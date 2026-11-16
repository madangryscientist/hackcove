import { describe, expect, it } from "vitest";
import * as ui from "./index.js";

// Every prop, value, type and export the 0.11 API pass renamed or removed, one line each. Each is
// a `@ts-expect-error`, so `:typecheck` fails the moment an old name compiles again: there is no
// alias and no deprecated path. The runtime test only keeps the file a test; the types are the check.

const segment = { label: "a", value: 1, tone: "info" } as const;

const fieldDialog = {
  title: "t",
  label: "l",
  placeholder: "p",
  hint: "h",
  emptyReason: "e",
  submit: "s",
  busyLabel: "b",
  onSubmit: () => Promise.resolve(),
  onClose: () => undefined,
};

export const removed = {
  // Tone, text and passthrough
  // @ts-expect-error CalloutTone is gone: Callout, Card and TimelineItem take Tone
  r1: () => ((t: import("./index.js").CalloutTone) => t)("info"),
  // @ts-expect-error TypographyColor is gone: tone is the one ink prop
  r2: () => ((t: import("./index.js").TypographyColor) => t)("muted"),
  // @ts-expect-error ButtonLook is no longer exported
  r3: () => ((t: import("./index.js").ButtonLook) => t)({}),
  // @ts-expect-error no *Props type is exported: ComponentProps<typeof X> covers a real need
  r4: () => ((t: import("./index.js").DialogProps) => t)({}),
  // @ts-expect-error no *Props type is exported (TypographyProps)
  r5: () => ((t: import("./index.js").TypographyProps<"p">) => t)({}),
  // @ts-expect-error color="muted" is tone="muted"
  r6: () => <ui.Text color="muted">x</ui.Text>,
  // @ts-expect-error color="brand" is tone="accent"
  r7: () => <ui.Caption color="brand">x</ui.Caption>,
  // @ts-expect-error color="tertiary" is tone="muted"
  r8: () => <ui.Overline color="tertiary">x</ui.Overline>,
  // @ts-expect-error a heading has a fixed ink: no color
  r9: () => <ui.PageHeading color="secondary">x</ui.PageHeading>,
  // @ts-expect-error a heading has a fixed ink: no color
  r10: () => <ui.SectionHeading color="default">x</ui.SectionHeading>,
  // @ts-expect-error tone="inherit" is gone: leave tone out to inherit
  r11: () => <ui.Icon name="check" tone="inherit" />,
  // @ts-expect-error negative is danger
  r12: () => <ui.ProgressBar value={1} label="x" tone="negative" />,
  // @ts-expect-error negative is danger
  r13: () => <ui.SplitBar a={1} b={1} label="x" toneA="negative" />,
  // @ts-expect-error negative is danger
  r14: () => <ui.StatTile label="x" value="1" tone="negative" />,
  // @ts-expect-error violet is accent
  r15: () => <ui.Legend items={[{ label: "x", tone: "violet" }]} />,
  // @ts-expect-error segments is items
  r16: () => <ui.StackedBar segments={[segment]} label="x" />,
  // @ts-expect-error Callout passes only id, data-* and aria-*: no role
  r17: () => <ui.Callout role="alert">x</ui.Callout>,
  // @ts-expect-error StatTile passes only id, data-* and aria-*: no handler
  r18: () => <ui.StatTile label="x" value="1" onClick={() => undefined} />,
  // @ts-expect-error Code passes only id, data-* and aria-*: no title
  r19: () => <ui.Code title="x">x</ui.Code>,

  // The router link adapter
  // @ts-expect-error LinkRender is gone: the app sets a LinkAdapter once on LinkProvider
  r20: () => ((t: import("./index.js").LinkRender) => t)(() => null),
  // @ts-expect-error LinkRenderProps is LinkAdapterProps
  r21: () => ((t: import("./index.js").LinkRenderProps) => t)({ className: "", children: null }),
  // @ts-expect-error render is gone: href, drawn through LinkProvider
  r22: () => <ui.Button render={() => null}>x</ui.Button>,
  // @ts-expect-error a Crumb has no render: { label, href }
  r23: () => <ui.Breadcrumbs crumbs={[{ label: "x", render: () => null }]} />,
  // @ts-expect-error renderHome is gone: the home link draws through LinkProvider
  r24: () => <ui.NotFound renderHome={() => null} />,
  // @ts-expect-error a Tabs link item has no render
  r25: () => <ui.Tabs label="x" items={[{ label: "x", render: () => null }]} />,

  // The status pages' home link
  // @ts-expect-error homeHref is gone: LinkProvider home, "/" by default
  r26: () => <ui.NotFound homeHref="/" />,
  // @ts-expect-error a page takes no home prop
  r27: () => <ui.Maintenance homeHref="/" />,

  // Actions and density
  // @ts-expect-error tone="default" is neutral, the default
  r28: () => <ui.Button tone="default">x</ui.Button>,
  // @ts-expect-error tone="default" is neutral, the default
  r29: () => <ui.IconButton label="x" icon="plus" tone="default" />,
  // @ts-expect-error badge is count
  r30: () => <ui.IconButton label="x" icon="bell" badge={3} />,
  // @ts-expect-error the icon is icon, a name from the set: no children
  r31: () => <ui.IconButton label="x">+</ui.IconButton>,
  // @ts-expect-error busyLabel is gone: busy={saving && "Saving"}
  r32: () => <ui.Button busy busyLabel="S" />,
  // @ts-expect-error slate is neutral
  r33: () => <ui.Pill tone="slate">x</ui.Pill>,
  // @ts-expect-error amber is warn
  r34: () => <ui.Pill tone="amber">x</ui.Pill>,
  // @ts-expect-error emerald is positive
  r35: () => <ui.Pill tone="emerald">x</ui.Pill>,
  // @ts-expect-error blue is info
  r36: () => <ui.Pill tone="blue">x</ui.Pill>,
  // @ts-expect-error red is danger
  r37: () => <ui.Pill tone="red">x</ui.Pill>,
  // @ts-expect-error violet is accent
  r38: () => <ui.Pill tone="violet">x</ui.Pill>,
  // @ts-expect-error sky is gone: info
  r39: () => <ui.Pill tone="sky">x</ui.Pill>,
  // @ts-expect-error label (the name half) is name
  r40: () => <ui.Pill label="Weight">x</ui.Pill>,
  // @ts-expect-error ButtonGroup passes only id, data-* and aria-*: no handler
  r41: () => <ui.ButtonGroup onClick={() => undefined}>x</ui.ButtonGroup>,

  // Layouts and navigation
  // @ts-expect-error subtitle is description
  r42: () => <ui.PageHeader title="x" subtitle="y" />,
  // @ts-expect-error subtitle is description
  r43: () => <ui.CenteredLayout title="x" subtitle="y" />,
  // @ts-expect-error rail is aside
  r44: () => <ui.SidebarLayout rail="x">y</ui.SidebarLayout>,
  r45: () => (
    // @ts-expect-error railLabel is asideLabel
    <ui.SidebarLayout aside="x" railLabel="y">
      z
    </ui.SidebarLayout>
  ),
  // @ts-expect-error panel is aside
  r46: () => <ui.FullBleedLayout panel="x">y</ui.FullBleedLayout>,
  // @ts-expect-error panelLabel is asideLabel
  r47: () => <ui.FullBleedLayout panelLabel="x">y</ui.FullBleedLayout>,
  r48: () => (
    // @ts-expect-error stickyAside is sticky
    <ui.DetailLayout title="x" aside="y" stickyAside>
      z
    </ui.DetailLayout>
  ),
  // @ts-expect-error isEmpty is gone: empty shows when there are no children
  r49: () => <ui.ListLayout title="x" isEmpty />,
  // @ts-expect-error hideChromeInPrint is printChrome={false}
  r50: () => <ui.AppShell hideChromeInPrint>x</ui.AppShell>,
  // @ts-expect-error action is actions
  r51: () => <ui.NotFound action="x" />,
  r52: () => (
    <ui.Fieldset
      label="x"
      // @ts-expect-error legend is label, on the Fieldset that replaces FilterGroup
      legend="x"
    >
      y
    </ui.Fieldset>
  ),
  // @ts-expect-error crumbs is items
  r53: () => <ui.Breadcrumbs crumbs={["x"]} />,
  // @ts-expect-error people is items
  r54: () => <ui.AvatarStack people={[{ name: "x" }]} />,
  // @ts-expect-error a link item's active is selected
  r55: () => <ui.Tabs label="x" items={[{ label: "x", href: "/", active: true }]} />,
  // @ts-expect-error variant is gone: orientation picks the look
  r56: () => <ui.Tabs label="x" variant="pill" items={[{ label: "x", href: "/" }]} />,
  // @ts-expect-error elementRef is ref
  r57: () => <ui.Container elementRef={() => undefined} />,
  // @ts-expect-error active is loading, the one name for a pending state
  r62: () => <ui.NavigationProgress active />,
  // @ts-expect-error Avatar passes only id, data-* and aria-*: no handler but onClick
  r58: () => <ui.Avatar name="x" onError={() => undefined} />,

  // EpicHeader and groupByEpic
  // @ts-expect-error EpicHeader is gone: a SubsectionHeading or an Overline over the group
  r59: (t: typeof import("./index.js").EpicHeader) => t,
  // @ts-expect-error groupByEpic is gone: Object.groupBy or a Map in the app
  r60: (t: typeof import("./index.js").groupByEpic) => t,

  // ToolCallCard
  // @ts-expect-error ToolCallCard is gone: a bordered Disclosure with a Pill
  r61: (t: typeof import("./index.js").ToolCallCard) => t,
  // The Avatar helpers (D21)
  // @ts-expect-error avatarColourClass is not exported: Avatar picks the colour from name
  d21a: (t: typeof import("./index.js").avatarColourClass) => t,
  // @ts-expect-error initialsOf is not exported: Avatar draws the initials from name
  d21b: (t: typeof import("./index.js").initialsOf) => t,
  // Controls
  // @ts-expect-error a Checkbox's description is hint
  r63: () => <ui.Checkbox label="x" description="y" />,
  // @ts-expect-error a Switch's description is hint
  r64: () => <ui.Switch label="x" description="y" />,
  // @ts-expect-error a Radio's description is hint
  r65: () => <ui.Radio value="x" label="x" description="y" />,
  // @ts-expect-error a DateField's description is hint
  r66: () => <ui.DateField aria-label="x" description="y" />,
  // @ts-expect-error a DateRangePicker's description is hint
  r67: () => <ui.DateRangePicker aria-label="x" description="y" />,
  // @ts-expect-error isInvalid is gone: error marks the field invalid
  r68: () => <ui.DateField aria-label="x" isInvalid />,
  // @ts-expect-error errorMessage is error
  r69: () => <ui.DateRangePicker aria-label="x" errorMessage="y" />,
  r70: () => (
    <ui.RadioGroup
      label="x"
      // @ts-expect-error isDisabled is disabled
      isDisabled
    >
      y
    </ui.RadioGroup>
  ),
  // @ts-expect-error a Radio's isDisabled is disabled
  r71: () => <ui.Radio value="x" label="x" isDisabled />,
  // @ts-expect-error isDisabled is disabled
  r72: () => <ui.DateField aria-label="x" isDisabled />,
  r73: () => (
    <ui.RadioGroup
      label="x"
      // @ts-expect-error isRequired is required
      isRequired
    >
      y
    </ui.RadioGroup>
  ),
  // @ts-expect-error isRequired is required
  r74: () => <ui.DateRangePicker aria-label="x" isRequired />,
  // @ts-expect-error initial is defaultValue
  r75: () => <ui.ColourSchemeToggle initial="dark" />,
  // @ts-expect-error align is gone: the box sits on the label's first line
  r76: () => <ui.Checkbox label="x" align="center" />,
  // @ts-expect-error icon names an icon: icon="search", not an element
  r77: () => <ui.Input icon={<svg />} />,
  // @ts-expect-error a Select takes items, not option children
  r78: () => <ui.Select aria-label="x">{null}</ui.Select>,
  r79: () => (
    <ui.Field
      label="x"
      // @ts-expect-error hideLabel is labelHidden
      hideLabel
    >
      {null}
    </ui.Field>
  ),
  // @ts-expect-error inputLabel is gone: label names the input
  r80: () => <ui.FieldDialog {...fieldDialog} inputLabel="y" />,
  // @ts-expect-error action is actions
  r81: () => <ui.FormRow action="x">{null}</ui.FormRow>,

  // Containers and rows
  // @ts-expect-error nowrap is gone: an item never breaks inside itself
  r82: () => <ui.MetaList nowrap>x</ui.MetaList>,
  // @ts-expect-error active is highlighted
  r83: () => <ui.ListRow active>x</ui.ListRow>,
  // @ts-expect-error detail is panel
  r84: () => <ui.ListRow detail="y">x</ui.ListRow>,
  // @ts-expect-error static is gone: a row with no href or onClick is static by itself
  r85: () => <ui.ListRow static>x</ui.ListRow>,
  // @ts-expect-error as is only article: a titled card is a section, an untitled one a div
  r86: () => <ui.Card as="div">x</ui.Card>,
  // @ts-expect-error dashed is gone: an EmptyState draws its own dashed frame
  r87: () => <ui.Card dashed>x</ui.Card>,
  // @ts-expect-error a Dialog's size is width
  r88: () => <ui.Dialog title="x" size="lg" onClose={() => undefined} />,
  // @ts-expect-error a Drawer's size is width
  r89: () => <ui.Drawer title="x" size="lg" onClose={() => undefined} />,

  // Tables
  // @ts-expect-error caption is label, and a table needs one
  r90: () => <ui.Table caption="x">{null}</ui.Table>,
  r91: () => (
    <ui.Table
      label="x"
      // @ts-expect-error variant is gone: a table inside a Card is plain by itself
      variant="plain"
    >
      {null}
    </ui.Table>
  ),
  // @ts-expect-error srLabel is label
  r92: () => <ui.TableHeaderCell srLabel="Actions" />,
  // @ts-expect-error a cell's tone="default" is neutral, the default
  r93: () => <ui.TableCell tone="default">x</ui.TableCell>,

  // Forms
  // @ts-expect-error FilterGroup is gone: a Fieldset round a ButtonGroup of the chips
  r94: (t: typeof import("./index.js").FilterGroup) => t,
};

describe("removed API", () => {
  it("is checked by the typecheck, not at runtime", () => {
    expect(ui.Text).toBeTypeOf("function");
  });
});
