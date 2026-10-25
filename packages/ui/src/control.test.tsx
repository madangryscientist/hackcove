import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { CONTROL_WIDTH } from "./control.js";
import { Input } from "./Input.js";
import { Select } from "./Select.js";
import { Textarea } from "./Textarea.js";

const classOf = (markup: string): string[] =>
  (/class="([^"]*)"/.exec(markup)?.[1] ?? "").split(" ").filter(Boolean);

const WIDTHS = Object.values(CONTROL_WIDTH).filter((w): w is string => w !== undefined);

const controls = {
  Input: (props: { size?: "sm"; width?: "auto" | "md" }) => <Input {...props} />,
  Select: (props: { size?: "sm"; width?: "auto" | "md" }) => <Select {...props} />,
  Textarea: (props: { size?: "sm"; width?: "auto" | "md" }) => <Textarea {...props} />,
};

describe.each(Object.entries(controls))("%s size and width", (_name, render) => {
  it("is full width and medium by default", () => {
    const classes = classOf(renderToStaticMarkup(render({})));
    expect(classes).toContain("w-full");
    expect(classes).toContain("py-2");
    expect(classes).toContain("text-sm");
    expect(classes).toContain("px-3");
  });

  it("sm is compact", () => {
    const classes = classOf(renderToStaticMarkup(render({ size: "sm" })));
    expect(classes).toEqual(expect.arrayContaining(["py-1", "text-xs", "px-2"]));
    expect(classes).not.toContain("py-2");
    expect(classes).not.toContain("text-sm");
  });

  it("a fixed width replaces w-full, never joins it", () => {
    const classes = classOf(renderToStaticMarkup(render({ width: "md" })));
    expect(classes).toContain("w-36");
    expect(classes).not.toContain("w-full");
    expect(classes.filter((c) => WIDTHS.includes(c))).toHaveLength(1);
  });

  it("auto carries no width class", () => {
    const classes = classOf(renderToStaticMarkup(render({ width: "auto" })));
    expect(classes.filter((c) => WIDTHS.includes(c))).toEqual([]);
  });
});

describe("Input with an icon", () => {
  const icon = <svg viewBox="0 0 20 20" />;

  it("sm shrinks the icon gutter", () => {
    const out = renderToStaticMarkup(<Input icon={icon} size="sm" />);
    expect(out).toContain("pl-7");
    expect(out).toContain("left-2");
    expect(out).not.toContain("pl-9");
  });

  it("puts a fixed width on the wrapper and keeps the input full inside it", () => {
    const out = renderToStaticMarkup(<Input icon={icon} width="lg" />);
    expect(out.startsWith('<div class="relative w-48"')).toBe(true);
    const classes = classOf(out.slice(out.indexOf("<input")));
    expect(classes).toContain("w-full");
    expect(classes).not.toContain("w-48");
  });

  it("auto sizes the wrapper to the input", () => {
    const out = renderToStaticMarkup(<Input icon={icon} width="auto" />);
    expect(out.startsWith('<div class="relative inline-block"')).toBe(true);
    expect(classOf(out.slice(out.indexOf("<input")))).not.toContain("w-full");
  });
});

describe("native size and width are replaced", () => {
  it("passes the rest through", () => {
    const out = renderToStaticMarkup(
      <Input size="sm" width="xs" placeholder="Qty" maxLength={4} />,
    );
    expect(out).toContain('placeholder="Qty"');
    expect(out).toContain('maxLength="4"');
    expect(out).not.toMatch(/\ssize=/);
    expect(out).not.toMatch(/\swidth=/);
  });
});

describe("Checkbox size", () => {
  it("is medium by default", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open" />);
    expect(out).toContain("text-sm");
    expect(out).toContain("h-4 w-4");
  });

  it("sm is text-xs with a smaller box", () => {
    const out = renderToStaticMarkup(<Checkbox label="Open" size="sm" />);
    expect(out).toContain("text-xs");
    expect(out).toContain("h-3.5 w-3.5");
    expect(out).not.toContain("text-sm");
  });

  it("renders a bare box named by aria-label when there is no label", () => {
    const out = renderToStaticMarkup(<Checkbox aria-label="Select row" size="sm" />);
    expect(out).toContain('aria-label="Select row"');
    expect(out.endsWith("/></label>")).toBe(true);
  });
});
