import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell.js";

const EDGE = "max-w-6xl px-4 sm:px-6";

describe("AppShell", () => {
  it("puts the header in one sticky, fixed-height row that scrolls sideways and never wraps", () => {
    const out = renderToStaticMarkup(<AppShell header={<a href="/">Logo</a>}>page</AppShell>);
    expect(out).toMatch(/<header class="sticky top-0 [^"]*">/);
    const row = /<div class="([^"]*)"><a href="\/">Logo<\/a>/.exec(out)?.[1]?.split(" ") ?? [];
    expect(row).toEqual(
      expect.arrayContaining(["max-w-6xl", "h-14", "overflow-x-auto", "whitespace-nowrap"]),
    );
  });

  it("puts main in a Container with fixed vertical padding", () => {
    const out = renderToStaticMarkup(<AppShell header="h">page</AppShell>);
    expect(out).toContain(
      `<main class="flex flex-1 flex-col"><div class="mx-auto w-full ${EDGE} py-8">page</div></main>`,
    );
  });

  it("renders main without a Container when bleed, keeping the header's", () => {
    const out = renderToStaticMarkup(
      <AppShell header="h" bleed>
        page
      </AppShell>,
    );
    expect(out).toContain('<main class="flex flex-1 flex-col">page</main>');
    expect(out).toContain(EDGE);
  });

  it("adds the subnav row and the footer only when given", () => {
    const bare = renderToStaticMarkup(<AppShell header="h">page</AppShell>);
    expect(bare).not.toContain("h-12");
    expect(bare).not.toContain("<footer");
    const full = renderToStaticMarkup(
      <AppShell header="h" subnav="tabs" footer="foot">
        page
      </AppShell>,
    );
    expect(full).toMatch(/overflow-x-auto[^"]*h-12">tabs</);
    expect(full).toMatch(/<footer [^>]*><div [^>]*>foot<\/div><\/footer>/);
  });

  it("lays the header slots out brand, nav, header, then controls at the end", () => {
    const out = renderToStaticMarkup(
      <AppShell
        brand={<a href="/">Logo</a>}
        nav={<nav aria-label="Main">tabs</nav>}
        header={<span>extra</span>}
        controls={<button type="button">Theme</button>}
      >
        page
      </AppShell>,
    );
    expect(out).toContain(
      '<div class="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900"><a href="/">Logo</a></div>',
    );
    expect(out).toContain(
      '<div class="ml-auto flex items-center gap-2"><button type="button">Theme</button></div>',
    );
    const order = ["Logo", 'aria-label="Main"', "extra", "Theme"].map((part) => out.indexOf(part));
    expect(order).toEqual(order.toSorted((a, b) => a - b));
    expect(order.every((at) => at >= 0)).toBe(true);
  });

  it("renders no wrapper for a slot that is not given, so the header node alone is as before", () => {
    const out = renderToStaticMarkup(<AppShell header={<a href="/">Logo</a>}>page</AppShell>);
    expect(out).not.toContain("tracking-tight");
    expect(out).not.toContain("ml-auto");
  });

  it("prints the header, footer and main's padding unchanged unless asked", () => {
    const out = renderToStaticMarkup(
      <AppShell header="h" footer="foot">
        page
      </AppShell>,
    );
    expect(out).not.toContain("print:");
  });

  it("hides the header and footer in print and drops main's padding when hideChromeInPrint", () => {
    const out = renderToStaticMarkup(
      <AppShell header="h" footer="foot" hideChromeInPrint>
        page
      </AppShell>,
    );
    expect(out).toMatch(/<header class="[^"]*\bprint:hidden\b[^"]*">/);
    expect(out).toMatch(/<footer class="[^"]*\bprint:hidden\b[^"]*">/);
    expect(out).toContain(`<div class="mx-auto w-full ${EDGE} py-8 print:p-0">page</div>`);
  });
});
