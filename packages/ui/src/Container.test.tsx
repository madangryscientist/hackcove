import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Container } from "./Container.js";

const EDGE = "max-w-6xl px-4 sm:px-6";

describe("Container", () => {
  it("renders a div with the content width and side padding, and no class of its own to add", () => {
    expect(renderToStaticMarkup(<Container>x</Container>)).toBe(
      `<div class="mx-auto w-full ${EDGE}">x</div>`,
    );
  });

  it("renders the element `as` names", () => {
    expect(renderToStaticMarkup(<Container as="main">x</Container>)).toMatch(/^<main /);
  });

  it("is the only source file that defines the content width and side padding", () => {
    const sources = readdirSync(import.meta.dirname).filter(
      (file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file),
    );
    const defining = sources.filter((file) =>
      /max-w-6xl|px-4 sm:px-6/.test(readFileSync(join(import.meta.dirname, file), "utf8")),
    );
    expect(defining).toEqual(["Container.tsx"]);
  });
});
