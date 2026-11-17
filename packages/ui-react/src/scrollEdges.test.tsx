// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { DetailLayout } from "./PageLayouts.js";
import { render, screen } from "./render.harness.js";
import { SidebarLayout } from "./SidebarLayout.js";

// The scroll-edge fade (`data-more`, `data-more-start`, `data-more-end` and the mask they drive) is
// look, proved in a browser by `apps/storybook/e2e/sticky-columns.spec.ts`. What stays here is that a
// sticky column renders in a consumer's jsdom test, which has no ResizeObserver.

describe("a sticky column's scroll-edge fade", () => {
  it("DetailLayout renders with no ResizeObserver, as in a consumer's jsdom test", () => {
    expect(typeof ResizeObserver).toBe("undefined");
    render(
      <DetailLayout title="Quote" aside="Aside" sticky>
        MAIN
      </DetailLayout>,
    );
    expect(screen.getByText("Aside")).toBeTruthy();
    expect(screen.getByText("MAIN")).toBeTruthy();
  });

  it("SidebarLayout renders with no ResizeObserver, as in a consumer's jsdom test", () => {
    expect(typeof ResizeObserver).toBe("undefined");
    render(<SidebarLayout aside="Rail">CANVAS</SidebarLayout>);
    expect(screen.getAllByText("Rail").length).toBeGreaterThan(0);
    expect(screen.getByText("CANVAS")).toBeTruthy();
  });
});
