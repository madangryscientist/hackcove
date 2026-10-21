import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Input } from "./Input.js";

const icon = <svg viewBox="0 0 20 20" />;

describe("Input", () => {
  it("renders a lone input with px-3 when there is no icon", () => {
    const out = renderToStaticMarkup(<Input />);
    expect(out.startsWith("<input")).toBe(true);
    expect(out).toContain("px-3");
    expect(out).not.toContain("relative");
  });

  it("wraps the input with a leading icon and pads it on the left", () => {
    const out = renderToStaticMarkup(<Input icon={icon} />);
    expect(out).toContain('class="relative"');
    expect(out).toContain('aria-hidden="true"');
    expect(out).toContain("pl-9");
    expect(out).not.toContain("px-3");
  });

  it("passes placeholder, type and disabled through", () => {
    const out = renderToStaticMarkup(
      <Input type="search" placeholder="Search" disabled icon={icon} />,
    );
    expect(out).toContain('type="search"');
    expect(out).toContain('placeholder="Search"');
    expect(out).toContain("disabled");
  });
});
