import { describe, expect, it } from "vitest";
import * as ui from "./index.js";

// Every prop, value, type and export the 0.11 API pass renamed or removed, one line each. Each is
// a `@ts-expect-error`, so `:typecheck` fails the moment an old name compiles again: there is no
// alias and no deprecated path. The runtime test only keeps the file a test; the types are the check.

const segment = { label: "a", value: 1, tone: "info" } as const;

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
};

describe("removed API", () => {
  it("is checked by the typecheck, not at runtime", () => {
    expect(ui.Text).toBeTypeOf("function");
  });
});
