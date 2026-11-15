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
};

describe("removed API", () => {
  it("is checked by the typecheck, not at runtime", () => {
    expect(ui.Text).toBeTypeOf("function");
  });
});
