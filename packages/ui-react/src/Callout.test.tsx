// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Callout } from "./Callout.js";
import { render, screen } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("Callout", () => {
  it("reads the title before the body", () => {
    render(
      <Callout title="Draft." tone="warn">
        Body text.
      </Callout>,
    );
    expect(follows(screen.getByText("Draft."), screen.getByText("Body text."))).toBeTruthy();
  });

  it("reads the actions after the title and body", () => {
    render(
      <Callout title="Heads up." actions={<button type="button">Fix</button>}>
        Body.
      </Callout>,
    );
    const fix = screen.getByRole("button", { name: "Fix" });
    expect(follows(screen.getByText("Heads up."), screen.getByText("Body."))).toBeTruthy();
    expect(follows(screen.getByText("Body."), fix)).toBeTruthy();
  });

  it("keeps the title, body and actions with align=center", () => {
    render(
      <Callout align="center" tone="positive" title="Done" actions={<a href="#a">Open</a>}>
        Saved.
      </Callout>,
    );
    expect(screen.getByText("Done")).not.toBeNull();
    expect(screen.getByText("Saved.")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Open" }).getAttribute("href")).toBe("#a");
  });

  it("announces a danger notice as an alert and a warning as a status", () => {
    render(
      <>
        <Callout tone="danger">Could not save.</Callout>
        <Callout tone="warn">Unsaved changes.</Callout>
      </>,
    );
    expect(screen.getByRole("alert").textContent).toBe("Could not save.");
    expect(screen.getByRole("status").textContent).toBe("Unsaved changes.");
  });

  it.each(["neutral", "info", "positive"] as const)("gives a %s notice no role", (tone) => {
    render(<Callout tone={tone}>A note.</Callout>);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
