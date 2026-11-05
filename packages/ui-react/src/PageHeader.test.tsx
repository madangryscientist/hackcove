import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader.js";
import { Stack } from "./Stack.js";

describe("PageHeader in a Stack", () => {
  it("keeps its own mb-8 elsewhere and loses it as a Stack child, so the gap is not doubled", () => {
    const alone = renderToStaticMarkup(<PageHeader title="Builds" />);
    expect(alone).toContain("mb-8");
    const inStack = renderToStaticMarkup(
      <Stack gap="xl">
        <PageHeader title="Builds" />
      </Stack>,
    );
    expect(inStack).toContain("data-page-header");
    expect(inStack).toContain("*:data-page-header:mb-0");
  });
});

describe("PageHeader", () => {
  it("renders only a PageHeading in a block with a fixed bottom margin when given a title", () => {
    const out = renderToStaticMarkup(<PageHeader title="Builds" />);
    expect(out).toMatch(/^<div data-page-header="" class="mb-8">/);
    expect(out).toContain(">Builds</h1>");
    expect(out).not.toContain("<nav");
    expect(out).not.toContain("mb-2");
    expect(out).not.toContain("mt-4");
  });

  it("renders breadcrumbs above, subtitle under, actions beside and tabs below the title", () => {
    const out = renderToStaticMarkup(
      <PageHeader
        breadcrumbs={<nav>crumbs</nav>}
        title="Builds"
        subtitle="every build"
        actions={<button type="button">New</button>}
        tabs={<nav>tabs</nav>}
      />,
    );
    const order = ["crumbs", "Builds", "every build", "New", "tabs"].map((text) =>
      out.indexOf(text),
    );
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual(order.toSorted((a, b) => a - b));
    expect(out).toContain("sm:flex-row");
  });

  it("sets the title a step above the lede and the lede above body text", () => {
    const out = renderToStaticMarkup(<PageHeader title="Builds" subtitle="every build" />);
    expect(out).toMatch(
      /<h1 class="[^"]*text-3xl\/9 font-bold[^"]*sm:text-4xl\/10[^"]*">Builds<\/h1>/,
    );
    // The subtitle is the `Lead`: text-lg/7 (text-xl/8 from `sm`), against `Text`'s text-sm/5.
    expect(out).toMatch(/<p class="[^"]*text-lg\/7[^"]*sm:text-xl\/8[^"]*">every build<\/p>/);
    expect(out).not.toContain("text-sm/5");
    // A reading measure, so a lede in a wide column does not run the whole width.
    expect(out).toContain("max-w-[60ch]");
  });
});
