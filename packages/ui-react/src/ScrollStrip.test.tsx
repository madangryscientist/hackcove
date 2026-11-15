// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, user, within } from "./render.harness.js";
import { ScrollStrip } from "./ScrollStrip.js";

describe("ScrollStrip", () => {
  it("is one group named by its label, holding its items", () => {
    render(
      <ScrollStrip label="Recent statuses">
        <p>Ada</p>
        <p>Grace</p>
      </ScrollStrip>,
    );
    const strip = screen.getByRole("group", { name: "Recent statuses" });
    expect(within(strip).getByText("Ada")).not.toBeNull();
    expect(within(strip).getByText("Grace")).not.toBeNull();
  });

  it("is reached by Tab, so the keyboard can scroll it", async () => {
    render(
      <ScrollStrip label="Recent statuses">
        <p>Ada</p>
      </ScrollStrip>,
    );
    await user().tab();
    expect(document.activeElement).toBe(screen.getByRole("group", { name: "Recent statuses" }));
  });
});
