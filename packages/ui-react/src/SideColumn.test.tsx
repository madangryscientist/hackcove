// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { follows, render, screen, within } from "./render.harness.js";
import { SideColumn } from "./SideColumn.js";

describe("SideColumn", () => {
  it("reads the main area, then the aside in its own landmark", () => {
    render(
      <SideColumn aside={<p>ASIDE</p>}>
        <p>MAIN</p>
      </SideColumn>,
    );
    const aside = screen.getByRole("complementary");
    expect(within(aside).getByText("ASIDE")).not.toBeNull();
    expect(within(aside).queryByText("MAIN")).toBeNull();
    expect(follows(screen.getByText("MAIN"), screen.getByText("ASIDE"))).toBeTruthy();
  });

  it("shows the aside with no disclosure and leaves it unnamed without asideLabel", () => {
    render(
      <SideColumn aside={<p>ASIDE</p>}>
        <p>MAIN</p>
      </SideColumn>,
    );
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.getByRole("complementary").hasAttribute("aria-label")).toBe(false);
  });

  it("folds the aside behind a closed disclosure with asideLabel, summary first", () => {
    render(
      <SideColumn aside={<p>ASIDE</p>} asideLabel="Ask the reply agent">
        <p>MAIN</p>
      </SideColumn>,
    );
    const fold = within(screen.getByRole("complementary")).getByRole("group");
    expect(fold.hasAttribute("open")).toBe(false);
    const summary = within(fold).getByText("Ask the reply agent");
    expect(follows(screen.getByText("MAIN"), summary)).toBeTruthy();
    expect(follows(summary, screen.getByText("ASIDE"))).toBeTruthy();
  });

  it("names the aside's landmark with asideLabel", () => {
    render(
      <SideColumn aside={<p>ASIDE</p>} asideLabel="Ask the reply agent">
        <p>MAIN</p>
      </SideColumn>,
    );
    expect(screen.getByRole("complementary", { name: "Ask the reply agent" })).not.toBeNull();
  });
});
