import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar.js";
import { ScrollStrip } from "./ScrollStrip.js";

/** The `gap-*` class the strip's row ends up with. */
const gapOf = (gap?: "xs" | "sm" | "md") =>
  /gap-\d/.exec(
    renderToStaticMarkup(
      <ScrollStrip label="L" gap={gap}>
        x
      </ScrollStrip>,
    ),
  )?.[0];

describe("ScrollStrip", () => {
  it("is one focusable, named group that scrolls sideways", () => {
    const out = renderToStaticMarkup(
      <ScrollStrip label="Recent statuses">
        <Avatar name="Ada Lovelace" />
      </ScrollStrip>,
    );
    expect(out).toContain('role="group"');
    expect(out).toContain('aria-label="Recent statuses"');
    expect(out).toContain('tabindex="0"');
    expect(out).toContain("overflow-x-auto");
    expect(out).toContain("[scroll-snap-type:x_proximity]");
  });

  it("lays the items in one row that never shrinks or wraps them", () => {
    const out = renderToStaticMarkup(
      <ScrollStrip label="People">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
      </ScrollStrip>,
    );
    expect(out).toContain("flex w-max min-w-full");
    expect(out).toContain("*:shrink-0 *:snap-start");
    expect(out).not.toContain("flex-wrap");
  });

  it("takes the gap scale of a Cluster, sm by default", () => {
    expect(gapOf()).toBe("gap-4");
    expect(gapOf("xs")).toBe("gap-2");
    expect(gapOf("md")).toBe("gap-6");
  });
});
