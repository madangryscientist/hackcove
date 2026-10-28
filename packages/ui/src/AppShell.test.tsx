import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppShell, AppShellBrand, appShellRootClass, appShellRootClassFor } from "./AppShell.js";
import { schemeClass } from "./colourScheme.js";

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

  it("paints the page canvas and sets the type face and ink, so an app needs no page rule", () => {
    const out = renderToStaticMarkup(<AppShell header="h">page</AppShell>);
    const root = /^<div class="([^"]*)">/.exec(out)?.[1]?.split(" ") ?? [];
    expect(root).toEqual(expect.arrayContaining(["bg-gray-50", "font-sans", "text-slate-900"]));
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
      '<div class="ml-auto flex items-center gap-2 *:shrink-0 [&amp;&gt;.w-full]:w-auto"><button type="button">Theme</button></div>',
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

describe("AppShellBrand", () => {
  it("puts the logo and the label inside one link, the logo hidden from assistive tech", () => {
    const out = renderToStaticMarkup(<AppShellBrand href="/" logo={<i>L</i>} label="Quotes" />);
    expect(out.match(/<a /g)).toHaveLength(1);
    expect(out).toMatch(/^<a href="\/" class="[^"]*\bflex\b[^"]*">/);
    expect(out).toMatch(
      /<span aria-hidden="true" class="flex shrink-0 items-center[^"]*"><i>L<\/i><\/span>/,
    );
    expect(out).toContain("<span>Quotes</span></a>");
  });

  it("has no logo wrapper when there is no logo", () => {
    const out = renderToStaticMarkup(<AppShellBrand href="/" label="Quotes" />);
    expect(out).not.toContain("aria-hidden");
  });

  it("draws the app's own link with render, with no href", () => {
    const out = renderToStaticMarkup(
      <AppShellBrand label="Quotes" render={(props) => <a data-router="/" {...props} />} />,
    );
    expect(out).toMatch(/^<a data-router="\/" class="[^"]*">/);
    expect(out).not.toContain("href");
    expect(out).toContain("<span>Quotes</span>");
  });
});

const box = (out: string) => out.match(/<span aria-hidden="true" class="([^"]*)"/)?.[1] ?? "";

describe("AppShellBrand logoSize", () => {
  it("boxes the logo at 24px by default (an Avatar sm), 20px at sm and 32px at lg", () => {
    expect(
      box(renderToStaticMarkup(<AppShellBrand href="/" logo={<i>L</i>} label="Q" />)),
    ).toContain("size-6");
    expect(
      box(renderToStaticMarkup(<AppShellBrand href="/" logo={<i>L</i>} logoSize="sm" label="Q" />)),
    ).toContain("size-5");
    expect(
      box(renderToStaticMarkup(<AppShellBrand href="/" logo={<i>L</i>} logoSize="lg" label="Q" />)),
    ).toContain("size-8");
  });

  it("makes an <img> or <svg> logo fill the box", () => {
    const out = box(renderToStaticMarkup(<AppShellBrand href="/" logo={<svg />} label="Q" />));
    expect(out).toContain("[&amp;&gt;img]:size-full");
    expect(out).toContain("[&amp;&gt;svg]:size-full");
  });
});

describe("AppShell header height", () => {
  it("publishes the sticky header's height for a bar that sticks under it", () => {
    expect(renderToStaticMarkup(<AppShell>x</AppShell>)).toContain(
      "[--app-header:calc(3.5rem+1px)]",
    );
    expect(renderToStaticMarkup(<AppShell subnav="S">x</AppShell>)).toContain(
      "[--app-header:calc(6.5rem+1px)]",
    );
  });
});

describe("AppShellBrand collapse", () => {
  it("hides the label visually below sm and keeps it in the link", () => {
    const out = renderToStaticMarkup(
      <AppShellBrand href="/" logo={<i>L</i>} label="Quotes" collapse />,
    );
    expect(out).toContain('<span class="sr-only sm:not-sr-only">Quotes</span>');
  });

  it("shows the label by default", () => {
    expect(
      renderToStaticMarkup(<AppShellBrand href="/" logo={<i>L</i>} label="Quotes" />),
    ).toContain("<span>Quotes</span>");
  });
});
