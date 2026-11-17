// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { follows, render, screen, within } from "./render.harness.js";
import { Step, Steps } from "./Steps.js";

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
