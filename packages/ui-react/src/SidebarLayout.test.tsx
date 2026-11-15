// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "./render.harness.js";
import { SidebarLayout } from "./SidebarLayout.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("SidebarLayout", () => {
  it("reads the rail, in its own landmark, before the canvas", () => {
    render(
      <SidebarLayout rail={<p>RAIL</p>}>
        <p>CANVAS</p>
      </SidebarLayout>,
    );
    const rail = screen.getByRole("complementary");
    expect(within(rail).getByText("RAIL")).not.toBeNull();
    expect(within(rail).queryByText("CANVAS")).toBeNull();
    expect(follows(screen.getByText("RAIL"), screen.getByText("CANVAS"))).toBeTruthy();
  });

  it("shows the rail with no disclosure and leaves it unnamed without railLabel", () => {
    render(
      <SidebarLayout rail={<p>RAIL</p>}>
        <p>CANVAS</p>
      </SidebarLayout>,
    );
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.getByRole("complementary").hasAttribute("aria-label")).toBe(false);
  });

  it("folds the rail behind a closed disclosure with railLabel, summary first", () => {
    render(
      <SidebarLayout rail={<p>RAIL</p>} railLabel="All sections">
        <p>CANVAS</p>
      </SidebarLayout>,
    );
    const fold = within(screen.getByRole("complementary")).getByRole("group");
    expect(fold.hasAttribute("open")).toBe(false);
    const summary = within(fold).getByText("All sections");
    expect(follows(summary, screen.getByText("RAIL"))).toBeTruthy();
    expect(follows(screen.getByText("RAIL"), screen.getByText("CANVAS"))).toBeTruthy();
  });

  it("names the rail's landmark with railLabel", () => {
    render(
      <SidebarLayout rail={<p>RAIL</p>} railLabel="All sections">
        <p>CANVAS</p>
      </SidebarLayout>,
    );
    expect(screen.getByRole("complementary", { name: "All sections" })).not.toBeNull();
  });
});
