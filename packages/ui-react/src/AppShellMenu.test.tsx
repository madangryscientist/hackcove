// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell.js";
import { render, screen, user, within } from "./render.harness.js";

// The menu is a native <details>: its <summary> is the button, found by its text because jsdom's
// role table gives <summary> no role. The panel is the <details>, the page's one group.
const menuButton = (name = "Menu") => screen.getByText(name);
const menu = () => screen.getByRole("group");

const openMenu = async () => {
  await user().click(menuButton());
  expect(menu().hasAttribute("open")).toBe(true);
};

describe("AppShell phone menu", () => {
  it("draws no menu without a nav or a subnav", () => {
    render(
      <AppShell brand="B" controls="C" header="H">
        x
      </AppShell>,
    );
    expect(screen.queryByText("Menu")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("is a closed disclosure named Menu by default that opens and closes on a click", async () => {
    render(<AppShell nav={<nav aria-label="Main">tabs</nav>}>x</AppShell>);
    expect(menu().hasAttribute("open")).toBe(false);
    await openMenu();
    await user().click(menuButton());
    expect(menu().hasAttribute("open")).toBe(false);
  });

  it("takes the menu button's name from menuLabel", () => {
    render(
      <AppShell nav="n" menuLabel="Navigatie">
        x
      </AppShell>,
    );
    expect(within(menu()).getByText("Navigatie")).not.toBeNull();
    expect(screen.queryByText("Menu")).toBeNull();
  });

  it("holds the nav and the subnav in the panel, in that order", () => {
    render(
      <AppShell
        nav={<nav aria-label="Main">main-links</nav>}
        subnav={<nav aria-label="Section">section-links</nav>}
      >
        x
      </AppShell>,
    );
    const main = within(menu()).getByRole("navigation", { name: "Main" });
    const section = within(menu()).getByRole("navigation", { name: "Section" });
    expect(main.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("draws the menu for a subnav alone", () => {
    render(<AppShell subnav={<nav aria-label="Section">S</nav>}>x</AppShell>);
    expect(within(menu()).getByRole("navigation", { name: "Section" })).not.toBeNull();
  });

  it("closes on Escape and returns focus to the button", async () => {
    render(<AppShell nav={<a href="/a">A</a>}>x</AppShell>);
    await openMenu();
    await user().tab();
    expect(document.activeElement).toBe(within(menu()).getByRole("link", { name: "A" }));
    await user().keyboard("{Escape}");
    expect(menu().hasAttribute("open")).toBe(false);
    expect(document.activeElement).toBe(menuButton());
  });

  it("closes when a link in the panel is followed, for a router that does not reload", async () => {
    render(
      <AppShell
        nav={
          <a href="#a" onClick={(e) => e.preventDefault()}>
            A
          </a>
        }
      >
        x
      </AppShell>,
    );
    await openMenu();
    await user().click(within(menu()).getByRole("link", { name: "A" }));
    expect(menu().hasAttribute("open")).toBe(false);
  });

  it("stays open when something other than a link is clicked", async () => {
    render(<AppShell nav={<span>plain</span>}>x</AppShell>);
    await openMenu();
    await user().click(within(menu()).getByText("plain"));
    expect(menu().hasAttribute("open")).toBe(true);
  });
});

describe("AppShell menuControls", () => {
  const signOut = <button type="button">Sign out</button>;
  const nav = <a href="/builds">Builds</a>;

  it("renders them exactly once, inside the menu, above the nav", () => {
    render(
      <AppShell nav={nav} menuControls={signOut}>
        x
      </AppShell>,
    );
    expect(screen.getAllByRole("button", { name: "Sign out" })).toHaveLength(1);
    const button = within(menu()).getByRole("button", { name: "Sign out" });
    const link = within(menu()).getByRole("link", { name: "Builds" });
    expect(button.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("gives the Menu with menuControls and no nav or subnav", () => {
    render(<AppShell menuControls={signOut}>x</AppShell>);
    expect(within(menu()).getByText("Menu")).not.toBeNull();
    expect(within(menu()).getByRole("button", { name: "Sign out" })).not.toBeNull();
  });

  it("stays open on an Escape inside a dialog opened from its controls, which the dialog takes", async () => {
    render(
      <AppShell
        nav={nav}
        menuControls={
          <dialog open>
            <button type="button">Cancel</button>
          </dialog>
        }
      >
        x
      </AppShell>,
    );
    await openMenu();
    const cancel = screen.getByRole("button", { name: "Cancel" });
    await user().click(cancel);
    expect(document.activeElement).toBe(cancel);
    await user().keyboard("{Escape}");
    expect(menu().hasAttribute("open")).toBe(true);
  });
});
