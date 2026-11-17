// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState.js";
import { follows, render, screen } from "./render.harness.js";

describe("EmptyState", () => {
  it("is a section named by its title, an h2 by default", () => {
    render(<EmptyState title="No builds yet" />);
    const region = screen.getByRole("region", { name: "No builds yet" });
    expect(region.tagName).toBe("SECTION");
    expect(screen.getByRole("heading", { level: 2, name: "No builds yet" })).not.toBeNull();
  });

  it.each([2, 3, 4, 5, 6] as const)("level=%i makes the title that heading level", (level) => {
    render(<EmptyState title="T" level={level} />);
    expect(screen.getByRole("heading", { level, name: "T" })).not.toBeNull();
  });

  it("reads the title, then the children, then the actions", () => {
    render(
      <EmptyState title="T" actions={<button type="button">Create</button>}>
        <p>Explain.</p>
      </EmptyState>,
    );
    const title = screen.getByRole("heading", { name: "T" });
    const body = screen.getByText("Explain.");
    expect(follows(title, body)).toBeTruthy();
    expect(follows(body, screen.getByRole("button", { name: "Create" }))).toBeTruthy();
  });
});
