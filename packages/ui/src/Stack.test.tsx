import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Section, Stack } from "./Stack.js";

describe("Stack", () => {
  it("is a flex column with the md gap by default", () => {
    expect(renderToStaticMarkup(<Stack>x</Stack>)).toBe('<div class="flex flex-col gap-6">x</div>');
  });

  it("maps sm and lg to gap-4 and gap-8", () => {
    expect(renderToStaticMarkup(<Stack gap="sm">x</Stack>)).toContain("gap-4");
    expect(renderToStaticMarkup(<Stack gap="lg">x</Stack>)).toContain("gap-8");
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
    expect(out).toContain(`<section class="flex flex-col gap-4" aria-labelledby="${id}">`);
    expect(out).toContain(">All</button>");
  });

  it("renders no heading row and no label without a title or actions", () => {
    expect(renderToStaticMarkup(<Section>body</Section>)).toBe(
      '<section class="flex flex-col gap-4">body</section>',
    );
  });
});
