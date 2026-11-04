import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Step, Steps } from "./Steps.js";

describe("Steps", () => {
  it("is an ordered list with one li per step", () => {
    const out = renderToStaticMarkup(
      <Steps aria-label="Get started">
        <Step title="Install">npm i</Step>
        <Step title="Log in" />
      </Steps>,
    );
    expect(out).toMatch(/^<ol role="list" /);
    expect(out).toContain('aria-label="Get started"');
    expect(out.match(/<li/g)).toHaveLength(2);
    expect(out).toContain('<span aria-hidden="true"');
  });

  it("shows the title and the detail", () => {
    const out = renderToStaticMarkup(<Step title="Install">Run the installer.</Step>);
    expect(out).toContain("Install");
    expect(out).toContain("Run the installer.");
  });
});
