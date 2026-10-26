import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Section, Stack } from "./Stack.js";

// Every Stack drops the bottom margin of a PageHeader that is its direct child.
const DROP = "*:data-page-header:mb-0";

describe("Stack", () => {
  it("is a flex column with the md gap by default", () => {
    expect(renderToStaticMarkup(<Stack>x</Stack>)).toBe(
      `<div class="flex flex-col gap-6 ${DROP}">x</div>`,
    );
  });

  it("drops the bottom margin of a PageHeader child, so the gap is the only space under it", () => {
    expect(renderToStaticMarkup(<Stack>x</Stack>)).toContain(DROP);
  });

  it("maps xs, sm and lg to gap-2, gap-4 and gap-8", () => {
    expect(renderToStaticMarkup(<Stack gap="xs">x</Stack>)).toContain("gap-2");
    expect(renderToStaticMarkup(<Stack gap="sm">x</Stack>)).toContain("gap-4");
    expect(renderToStaticMarkup(<Stack gap="lg">x</Stack>)).toContain("gap-8");
  });

  it("maps section to the responsive page rhythm, gap-12 then sm:gap-16", () => {
    expect(renderToStaticMarkup(<Stack gap="section">x</Stack>)).toBe(
      `<div class="flex flex-col gap-12 sm:gap-16 ${DROP}">x</div>`,
    );
  });

  it.each([
    ["narrow", "max-w-3xl"],
    ["wide", "max-w-5xl"],
    ["full", "w-full"],
  ] as const)("maps width %s to %s, left-aligned", (width, cls) => {
    const out = renderToStaticMarkup(<Stack width={width}>x</Stack>);
    expect(out).toBe(`<div class="flex flex-col gap-6 ${cls} ${DROP}">x</div>`);
    expect(out).not.toContain("mx-auto");
  });
});

describe("Stack as", () => {
  it("renders a form that passes its form props through", () => {
    const out = renderToStaticMarkup(
      <Stack
        as="form"
        action="/save"
        method="post"
        noValidate
        onSubmit={() => {}}
        aria-label="Save"
      >
        x
      </Stack>,
    );
    expect(out).toBe(
      `<form class="flex flex-col gap-6 ${DROP}" noValidate="" aria-label="Save" action="/save" method="post">x</form>`,
    );
  });

  it.each(["ul", "ol"] as const)(
    "renders a %s with no markers and its children as they are",
    (as) => {
      expect(
        renderToStaticMarkup(
          <Stack as={as} gap="sm" aria-label="Items">
            <li>a</li>
            <li>b</li>
          </Stack>,
        ),
      ).toBe(
        `<${as} class="flex flex-col list-none gap-4 ${DROP}" aria-label="Items"><li>a</li><li>b</li></${as}>`,
      );
    },
  );

  it("is a closed set of elements", () => {
    type P = Parameters<typeof Stack>[0];
    expectTypeOf<NonNullable<P["as"]>>().toEqualTypeOf<"div" | "section" | "form" | "ul" | "ol">();
  });
});

describe("Section", () => {
  it("is a section named by its SectionHeading, with actions beside it", () => {
    const out = renderToStaticMarkup(
      <Section title="Recent" actions={<button type="button">All</button>}>
        body
      </Section>,
    );
    const id = /<h2 [^>]*id="([^"]+)"/.exec(out)?.[1];
    expect(id).toBeDefined();
    expect(out).toContain(`<section class="flex flex-col gap-4 ${DROP}" aria-labelledby="${id}">`);
    expect(out).toContain(">All</button>");
  });

  it("passes width and gap through to its Stack", () => {
    expect(
      renderToStaticMarkup(
        <Section width="narrow" gap="xs">
          body
        </Section>,
      ),
    ).toBe(`<section class="flex flex-col gap-2 max-w-3xl ${DROP}">body</section>`);
  });

  it("renders no heading row and no label without a title or actions", () => {
    expect(renderToStaticMarkup(<Section>body</Section>)).toBe(
      `<section class="flex flex-col gap-4 ${DROP}">body</section>`,
    );
  });

  it("keeps a consumer's aria-labelledby when it has no title of its own", () => {
    expect(renderToStaticMarkup(<Section aria-labelledby="h">body</Section>)).toContain(
      'aria-labelledby="h"',
    );
  });
});
