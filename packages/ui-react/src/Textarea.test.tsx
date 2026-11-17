// @vitest-environment jsdom
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "./render.harness.js";
import { Textarea } from "./Textarea.js";

const notes = () => screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Notes" });

describe("Textarea", () => {
  it("is a multi-line text box of three rows by default", () => {
    render(<Textarea aria-label="Notes" />);
    expect(notes()).toBeInstanceOf(HTMLTextAreaElement);
    expect(notes().rows).toBe(3);
  });

  it("lets the caller override rows", () => {
    render(<Textarea rows={6} aria-label="Notes" />);
    expect(notes().rows).toBe(6);
  });

  it("passes placeholder and maxLength through", () => {
    render(<Textarea placeholder="Notes" maxLength={500} aria-label="Notes" />);
    expect(notes().placeholder).toBe("Notes");
    expect(notes().maxLength).toBe(500);
  });

  it("forwards its ref to the underlying <textarea>", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="Notes" />);
    expect(ref.current).toBe(notes());
    ref.current?.focus();
    expect(document.activeElement).toBe(notes());
  });
});
