import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";

const bandOf = (out: string) => out.match(/<div class="([^"]*)"><i>band<\/i><\/div>/)?.[1];

describe("Card inset", () => {
  it("draws the band under the title and above the children, cancelling the body padding", () => {
    const out = renderToStaticMarkup(
      <Card title="Reno" inset={<i>band</i>}>
        body
      </Card>,
    );
    expect(bandOf(out)).toBe("-mx-5 mb-3");
    expect(out.indexOf("Reno")).toBeLessThan(out.indexOf("band"));
    expect(out.indexOf("band")).toBeLessThan(out.indexOf("body"));
  });

  it.each([
    ["sm", "-mx-3 mb-2"],
    ["md", "-mx-5 mb-3"],
    ["lg", "-mx-6 mb-4"],
  ] as const)("matches the body padding of size %s", (size, cls) => {
    const out = renderToStaticMarkup(
      <Card size={size} inset={<i>band</i>}>
        body
      </Card>,
    );
    expect(bandOf(out)).toBe(cls);
  });

  it("is in the padded body of a bar card and of a footer card", () => {
    const bar = renderToStaticMarkup(
      <Card bar title="Reno" inset={<i>band</i>}>
        body
      </Card>,
    );
    expect(bar).toMatch(/<div class="p-5"><div class="-mx-5 mb-3"><i>band<\/i>/);
    const footer = renderToStaticMarkup(
      <Card footer="f" inset={<i>band</i>}>
        body
      </Card>,
    );
    expect(footer).toMatch(/<div class="flex-1 p-5"><div class="-mx-5 mb-3"><i>band<\/i>/);
  });

  it("has nothing to cancel in a flush card", () => {
    const out = renderToStaticMarkup(
      <Card flush inset={<i>band</i>}>
        body
      </Card>,
    );
    expect(bandOf(out)).toBe("mb-3");
  });

  it("is ignored by a dashed card, and absent by default", () => {
    expect(
      renderToStaticMarkup(
        <Card dashed inset={<i>band</i>}>
          body
        </Card>,
      ),
    ).not.toContain("band");
    expect(renderToStaticMarkup(<Card>body</Card>)).not.toContain("-mx-");
  });

  it("works on a link card too", () => {
    const out = renderToStaticMarkup(
      <Card href="/x" title="Reno" inset={<i>band</i>}>
        body
      </Card>,
    );
    expect(bandOf(out)).toBe("-mx-5 mb-3");
  });
});
