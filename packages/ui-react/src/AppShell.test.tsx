// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { AppShell, AppShellBrand, appShellRootClass, appShellRootClassFor } from "./AppShell.js";
import { schemeClass } from "./colourScheme.js";
import { Show } from "./Show.js";
import { follows, render, screen, within } from "./render.harness.js";

// jsdom has no layout, so these are the slot-order tests only. The nav that folds into the Menu
// from `md` when it does not fit is proved in the e2e (`apps/storybook/e2e/appshell-nav-fold.spec.ts`),
// not here by faking a ResizeObserver measurement. The safe-area insets and where an anchor lands
// are read, not tested: a headless browser reports no insets, and a scroll position is not asserted.

function first<T>(found: T[]): T {
  const [one] = found;
  if (one === undefined) throw new Error("none found");
  return one;
}

describe("AppShell", () => {
  it("puts the header in the banner and the page in main", () => {
    render(<AppShell header={<a href="/">Logo</a>}>page</AppShell>);
    expect(within(screen.getByRole("banner")).getByRole("link", { name: "Logo" })).not.toBeNull();
    expect(within(screen.getByRole("main")).getByText("page")).not.toBeNull();
  });

  it("keeps the page in main when bleed", () => {
    render(
      <AppShell header="h" bleed>
        page
      </AppShell>,
    );
    expect(within(screen.getByRole("main")).getByText("page")).not.toBeNull();
  });

  it("has a footer only when given one", () => {
    const { unmount } = render(<AppShell header="h">page</AppShell>);
    expect(screen.queryByRole("contentinfo")).toBeNull();
    unmount();
    render(
      <AppShell header="h" footer="foot">
        page
      </AppShell>,
    );
    expect(within(screen.getByRole("contentinfo")).getByText("foot")).not.toBeNull();
  });

  it("puts the subnav in the header", () => {
    render(
      <AppShell header="h" subnav={<nav aria-label="Section">tabs</nav>}>
        page
      </AppShell>,
    );
    // Twice in the header: its own row (wide screens) and the phone menu, each shown at one width.
    const banner = screen.getByRole("banner");
    expect(within(banner).getAllByRole("navigation", { name: "Section" })).toHaveLength(2);
  });

  it("reads the header slots in order: brand, nav, header, then controls", () => {
    render(
      <AppShell
        brand={<a href="/">Logo</a>}
        nav={<nav aria-label="Main">tabs</nav>}
        header={<span>extra</span>}
        controls={<button type="button">Theme</button>}
      >
        page
      </AppShell>,
    );
    const brand = screen.getByRole("link", { name: "Logo" });
    // The first Main nav is the row's; the menu's copy comes after the controls.
    const nav = first(screen.getAllByRole("navigation", { name: "Main" }));
    const extra = screen.getByText("extra");
    const theme = screen.getByRole("button", { name: "Theme" });
    expect(follows(brand, nav)).toBeTruthy();
    expect(follows(nav, extra)).toBeTruthy();
    expect(follows(extra, theme)).toBeTruthy();
  });
});

describe("appShellRootClassFor", () => {
  it("joins the scheme's class and the root class, for the default and the app's own schemes", () => {
    const schemes = { light: "my-light", dark: "night" };
    expect(appShellRootClassFor("dark")).toBe(`dark ${appShellRootClass}`);
    expect(appShellRootClassFor("light")).toBe(appShellRootClass);
    expect(appShellRootClassFor("light", schemes)).toBe(
      `${schemeClass("light", schemes)} ${appShellRootClass}`,
    );
    expect(appShellRootClassFor("dark", schemes)).toBe(`night ${appShellRootClass}`);
  });
});

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.

describe("AppShellBrand", () => {
  it("is one link home named by the label, the logo hidden from assistive tech", () => {
    render(<AppShellBrand href="/" logo={<i>L</i>} label="Quotes" />);
    const link = screen.getByRole("link", { name: "Quotes" });
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(link.getAttribute("href")).toBe("/");
    expect(within(link).getByText("L")).not.toBeNull();
  });

  it("is named by the label alone without a logo", () => {
    render(<AppShellBrand href="/" label="Quotes" />);
    expect(screen.getByRole("link", { name: "Quotes" })).not.toBeNull();
  });

  it("keeps the label in the link's name when collapse hides it on a phone", () => {
    render(<AppShellBrand href="/" logo={<i>L</i>} label="Quotes" collapse />);
    expect(screen.getByRole("link", { name: "Quotes" })).not.toBeNull();
  });
});

describe("Show in the header", () => {
  it("a Show in controls renders its children in the banner", () => {
    render(
      <AppShell
        controls={
          <Show from="sm" as="span">
            ada
          </Show>
        }
      >
        x
      </AppShell>,
    );
    expect(within(screen.getByRole("banner")).getByText("ada")).not.toBeNull();
  });
});
