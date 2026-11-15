// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { DetailLayout, FullBleedLayout } from "./PageLayouts.js";
import { render, screen, user } from "./render.harness.js";

describe("DetailLayout asideLabel", () => {
  it("names the aside's landmark without folding it", () => {
    render(
      <DetailLayout title="Quote 7" aside="SIDE" asideLabel="Quote facts">
        MAIN
      </DetailLayout>,
    );
    expect(screen.getByRole("complementary", { name: "Quote facts" }).textContent).toBe("SIDE");
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("leaves the aside unnamed without asideLabel", () => {
    render(
      <DetailLayout title="Quote 7" aside="SIDE">
        MAIN
      </DetailLayout>,
    );
    expect(screen.getByRole("complementary").hasAttribute("aria-label")).toBe(false);
  });

  it("names the sticky aside too, and its scroller takes no named stop or tab stop until it needs one", async () => {
    render(
      <DetailLayout title="Quote 7" aside="SIDE" asideLabel="Quote facts" stickyAside>
        MAIN
      </DetailLayout>,
    );
    expect(screen.getByRole("complementary", { name: "Quote facts" })).not.toBeNull();
    expect(screen.queryByRole("group", { name: "Quote facts" })).toBeNull();
    await user().tab();
    expect(document.activeElement).toBe(document.body);
  });
});

describe("FullBleedLayout panelLabel", () => {
  it("names the panel's landmark", () => {
    render(
      <FullBleedLayout panel="PANEL" panelLabel="Snapshot facts">
        VIEW
      </FullBleedLayout>,
    );
    expect(screen.getByRole("complementary", { name: "Snapshot facts" }).textContent).toBe("PANEL");
  });

  it("leaves the panel unnamed without panelLabel", () => {
    render(<FullBleedLayout panel="PANEL">VIEW</FullBleedLayout>);
    expect(screen.getByRole("complementary").hasAttribute("aria-label")).toBe(false);
  });
});
