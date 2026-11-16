// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "./render.harness.js";
import { Step, Steps } from "./Steps.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("Steps", () => {
  it("is an ordered list named by its label, with one item per step", () => {
    render(
      <Steps aria-label="Get started">
        <Step title="Install">npm i</Step>
        <Step title="Log in" />
      </Steps>,
    );
    const list = screen.getByRole("list", { name: "Get started" });
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["Installnpm i", "Log in"]);
  });

  it("reads the title, then the detail", () => {
    render(<Step title="Install">Run the installer.</Step>);
    expect(
      follows(screen.getByText("Install"), screen.getByText("Run the installer.")),
    ).toBeTruthy();
  });
});

describe('Steps size="lg"', () => {
  it("is still an ordered list with one item per step, each number hidden from assistive tech", () => {
    const later = true;
    render(
      <Steps size="lg" aria-label="How it works">
        <>
          <Step title="Install">Add the package.</Step>
          <Step title="Capture">Shoot every story.</Step>
        </>
        {later && <Step title="Review">Accept what changed.</Step>}
      </Steps>,
    );
    const list = screen.getByRole("list", { name: "How it works" });
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "InstallAdd the package.",
      "CaptureShoot every story.",
      "ReviewAccept what changed.",
    ]);
    expect(list.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
  });
});
