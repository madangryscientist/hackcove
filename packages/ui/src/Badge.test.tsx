import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge.js";

describe("Badge", () => {
  it("is a round red 10px count", () => {
    const markup = renderToStaticMarkup(<Badge count={3} />);
    expect(markup).toContain(">3</span>");
    expect(markup).toContain("rounded-full");
    expect(markup).toContain("bg-red-600");
    expect(markup).toContain("text-red-50");
    expect(markup).toContain("text-[10px]");
  });

  it("caps a large count at 99+", () => {
    expect(renderToStaticMarkup(<Badge count={120} />)).toContain(">99+</span>");
    expect(renderToStaticMarkup(<Badge count={99} />)).toContain(">99</span>");
  });

  it("`corner` pins it to the top-right of the nearest relative parent", () => {
    expect(renderToStaticMarkup(<Badge count={2} corner />)).toContain(
      "absolute -right-1.5 -top-1.5",
    );
    expect(renderToStaticMarkup(<Badge count={2} />)).not.toContain("absolute");
  });
});
