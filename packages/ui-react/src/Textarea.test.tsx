// @vitest-environment jsdom
import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { Textarea } from "./Textarea.js";

describe("Textarea", () => {
  afterEach(unmount);

  it("defaults to three rows", () => {
    const out = renderToStaticMarkup(<Textarea />);
    expect(out.startsWith("<textarea")).toBe(true);
    expect(out).toContain('rows="3"');
  });

  it("lets the caller override rows", () => {
    const out = renderToStaticMarkup(<Textarea rows={6} />);
    expect(out).toContain('rows="6"');
    expect(out).not.toContain('rows="3"');
  });

  it("carries the control look and px-3", () => {
    const out = renderToStaticMarkup(<Textarea />);
    expect(out).toContain("border-slate-300");
    expect(out).toContain("px-3");
  });

  it("passes placeholder and maxLength through", () => {
    const out = renderToStaticMarkup(<Textarea placeholder="Notes" maxLength={500} />);
    expect(out).toContain('placeholder="Notes"');
    expect(out).toContain('maxLength="500"');
  });

  it("forwards its ref to the underlying <textarea>", () => {
    const ref = createRef<HTMLTextAreaElement>();
    const container = mount(<Textarea ref={ref} aria-label="Notes" />);
    const element = container.querySelector("textarea");
    expect(element).not.toBeNull();
    expect(ref.current).toBe(element);
    ref.current?.focus();
    expect(document.activeElement).toBe(element);
  });

  it("keeps the default look with no mono class", () => {
    const out = renderToStaticMarkup(<Textarea />);
    expect(out).not.toContain("font-mono");
  });

  it("mono sets the monospace face on the control and keeps the rest of the look", () => {
    const out = renderToStaticMarkup(<Textarea mono />);
    expect(out).toContain("font-mono");
    expect(out).toContain("border-slate-300");
    expect(out).toContain("px-3");
    expect(out).not.toContain("mono=");
  });
});
