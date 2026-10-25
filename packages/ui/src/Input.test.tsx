// @vitest-environment jsdom
import { act, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
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

  it("resets the native search look and pads the trailing edge for the clear button", () => {
    const out = renderToStaticMarkup(<Input type="search" icon={icon} />);
    expect(out).toContain("appearance-none");
    expect(out).toContain("[&amp;::-webkit-search-cancel-button]:hidden");
    expect(out).toContain("pl-9 pr-9");
  });

  it("leaves a non-search field with an icon on its native look", () => {
    const out = renderToStaticMarkup(<Input icon={icon} />);
    expect(out).not.toContain("appearance-none");
  });

  it("wraps a search field with no icon and omits the icon gutter", () => {
    const out = renderToStaticMarkup(<Input type="search" />);
    expect(out).toContain('class="relative"');
    expect(out).toContain("pl-3 pr-9");
    expect(out).not.toContain("aria-hidden");
  });
});

const field = (c: HTMLElement): HTMLInputElement => {
  const input = c.querySelector("input");
  if (!input) throw new Error("no <input> rendered");
  return input;
};
const clear = (c: HTMLElement) => c.querySelector<HTMLButtonElement>('[aria-label="Clear search"]');

function Controlled() {
  const [value, setValue] = useState("tea");
  return <Input type="search" value={value} onChange={(e) => setValue(e.target.value)} />;
}

describe("Input clear button", () => {
  afterEach(unmount);

  it("is absent when the field is empty, and for a non-search field", () => {
    expect(clear(mount(<Input type="search" />))).toBeNull();
    unmount();
    expect(clear(mount(<Input defaultValue="x" />))).toBeNull();
  });

  it("is absent when disabled or read-only", () => {
    expect(clear(mount(<Input type="search" defaultValue="x" disabled />))).toBeNull();
    unmount();
    expect(clear(mount(<Input type="search" defaultValue="x" readOnly />))).toBeNull();
  });

  it("clears an uncontrolled field, fires onChange, returns focus to the input and goes away", () => {
    const onChange = vi.fn<() => void>();
    const c = mount(<Input type="search" defaultValue="tea" onChange={onChange} />);
    const button = clear(c);
    expect(button?.type).toBe("button");
    act(() => button?.click());
    expect(field(c).value).toBe("");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(field(c));
    expect(clear(c)).toBeNull();
  });

  it("clears a controlled field through its onChange", () => {
    const c = mount(<Controlled />);
    act(() => clear(c)?.click());
    expect(field(c).value).toBe("");
    expect(clear(c)).toBeNull();
  });

  it("appears once an uncontrolled field is typed into", () => {
    const c = mount(<Input type="search" />);
    act(() => {
      Reflect.set(HTMLInputElement.prototype, "value", "t", field(c));
      field(c).dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(clear(c)).not.toBeNull();
  });
});
