// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import { render, screen } from "./render.harness.js";

// The name a browser reads is "Splits, 3". jsdom's name computation (dom-accessibility-api) trims
// the ", " of the screen-reader-only span to ",", so the space is optional here.
const counted = (label: string, count: number) => new RegExp(`^${label}, ?${count}$`);

describe("Button count", () => {
  it("is part of the accessible name: label, comma, count", () => {
    render(<Button count={3}>Splits</Button>);
    expect(screen.getByRole("button", { name: counted("Splits", 3) }).textContent).toBe(
      "Splits, 3",
    );
  });

  it("shows a count of 0, and the name is the label alone with no count", () => {
    render(
      <>
        <Button count={0}>Splits</Button>
        <Button>Notes</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: counted("Splits", 0) })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Notes" })).not.toBeNull();
  });

  it("names a toggle and a link with their count", () => {
    render(
      <>
        <Button variant="outline" pressed count={4}>
          Open
        </Button>
        <Button href="/comments" count={5}>
          Comments
        </Button>
      </>,
    );
    expect(
      screen.getByRole("button", { name: counted("Open", 4) }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("link", { name: counted("Comments", 5) })).not.toBeNull();
  });

  it("drops the count while busy, since the busy label replaces the content", () => {
    render(
      <Button busy="Loading…" count={3}>
        Splits
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Loading…" })).not.toBeNull();
    expect(screen.queryByText("3")).toBeNull();
  });
});
