// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Disclosure } from "./Disclosure.js";
import { render, screen, user } from "./render.harness.js";

const open = (defaultOpen?: true) =>
  render(
    <Disclosure summary="Override trail" {...(defaultOpen ? { defaultOpen } : {})}>
      <p>Three overrides.</p>
    </Disclosure>,
  );

const trigger = () => screen.getByRole("button", { name: "Override trail" });
/** The body is a group named by the summary; hidden, it leaves the accessibility tree. */
const body = () => screen.queryByRole("group", { name: "Override trail" });

describe("Disclosure", () => {
  it("starts closed: the summary is a button with aria-expanded=false and the body is hidden", () => {
    open();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(body()).toBeNull();
    expect(screen.getByRole("group", { hidden: true }).hasAttribute("hidden")).toBe(true);
  });

  it("starts open with defaultOpen", () => {
    open(true);
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(body()?.textContent).toBe("Three overrides.");
  });

  it("opens and closes on a click, flipping aria-expanded and the body", async () => {
    open();
    await user().click(trigger());
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(body()?.textContent).toBe("Three overrides.");
    await user().click(trigger());
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(body()).toBeNull();
  });

  it("names the body by the summary and points the button at it", () => {
    open(true);
    expect(trigger().getAttribute("aria-controls")).toBe(body()?.id);
  });

  it("toggles from the keyboard: Tab reaches the summary, and Enter and Space press it", async () => {
    open();
    const keys = user();
    await keys.tab();
    expect(document.activeElement).toBe(trigger());
    await keys.keyboard("{Enter}");
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    await keys.keyboard(" ");
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  it("bordered keeps the toggle, aria-expanded and the hidden body", async () => {
    render(
      <Disclosure summary="Customise by month" bordered>
        <p>Twelve months.</p>
      </Disclosure>,
    );
    const button = screen.getByRole("button", { name: "Customise by month" });
    expect(screen.queryByRole("group", { name: "Customise by month" })).toBeNull();
    await user().click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("group", { name: "Customise by month" }).textContent).toBe(
      "Twelve months.",
    );
  });
});
