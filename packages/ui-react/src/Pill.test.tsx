// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { Pill } from "./Pill.js";

afterEach(unmount);

describe("Pill label", () => {
  it("is two-tone: the label half keeps the tone, the value half sits on the surface", () => {
    const out = renderToStaticMarkup(
      <Pill label="Weight" tone="amber">
        72 kg
      </Pill>,
    );
    expect(out).toContain("border border-slate-200");
    expect(out).toContain('bg-amber-50 text-amber-700">Weight<span class="sr-only">:</span>');
    expect(out).toContain('bg-white py-px text-slate-900 px-1.5">72 kg</span>');
    expect(out).not.toContain("px-1.5 py-0.5");
  });

  it("keeps the dot in the label half, and the link form around both halves", () => {
    const dotted = renderToStaticMarkup(
      <Pill label="Sleep" dot>
        7 h
      </Pill>,
    );
    expect(dotted).toContain("bg-current");
    const link = renderToStaticMarkup(
      <Pill label="Sleep" href="/sleep">
        7 h
      </Pill>,
    );
    expect(link.startsWith('<a href="/sleep"')).toBe(true);
    expect(link).toContain("hover:opacity-80");
    expect(link).toContain(">7 h</span></a>");
  });

  it("round keeps the full-pill corners on the bordered box", () => {
    const out = renderToStaticMarkup(
      <Pill label="Sleep" round>
        7 h
      </Pill>,
    );
    expect(out).toContain("rounded-full");
    expect(out).not.toContain("rounded-md");
  });
});

describe("Pill onRemove", () => {
  it("adds an x button named by removeLabel after the text, and no x without onRemove", () => {
    const out = renderToStaticMarkup(
      <Pill onRemove={() => undefined} removeLabel="Remove invoice.pdf" tone="sky">
        invoice.pdf
      </Pill>,
    );
    expect(out).toContain('aria-label="Remove invoice.pdf"');
    expect(out).toContain('title="Remove invoice.pdf"');
    expect(out).toContain('type="button"');
    expect(out).toContain('aria-hidden="true"');
    expect(out).toContain("bg-sky-50 text-sky-700");
    expect(out.indexOf("invoice.pdf</span>")).toBeLessThan(out.indexOf("<button"));
    expect(renderToStaticMarkup(<Pill>x</Pill>)).not.toContain("<button");
  });

  it("calls onRemove on a click of the x only", () => {
    const onRemove = vi.fn<() => void>();
    const container = mount(
      <Pill onRemove={onRemove} removeLabel="Remove it">
        chip
      </Pill>,
    );
    container.querySelector("span span")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onRemove).not.toHaveBeenCalled();
    container.querySelector<HTMLButtonElement>('button[aria-label="Remove it"]')?.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("sits beside a button or link pill, never nested in it", () => {
    const onClick = vi.fn<() => void>();
    const container = mount(
      <Pill onClick={onClick} onRemove={() => undefined} removeLabel="Remove" data-testid="chip">
        open
      </Pill>,
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.contains(buttons[1] ?? null)).toBe(false);
    expect(buttons[0]?.getAttribute("data-testid")).toBe("chip");
    buttons[0]?.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    const link = renderToStaticMarkup(
      <Pill href="/a.pdf" onRemove={() => undefined} removeLabel="Remove">
        a.pdf
      </Pill>,
    );
    expect(link).toMatch(/<a href="\/a.pdf"[^>]*>[^<]*<\/a><button/);
  });

  it("puts data-* and title on the shell of a plain pill", () => {
    const out = renderToStaticMarkup(
      <Pill onRemove={() => undefined} removeLabel="Remove" data-testid="chip" title="T">
        x
      </Pill>,
    );
    expect(out.startsWith('<span data-testid="chip" title="T"')).toBe(true);
  });

  it("combines with label: the x joins the value half", () => {
    const out = renderToStaticMarkup(
      <Pill label="File" onRemove={() => undefined} removeLabel="Remove file">
        a.pdf
      </Pill>,
    );
    expect(out).toContain("border border-slate-200");
    expect(out).toContain("pl-1.5 pr-0.5");
    expect(out).toContain('aria-label="Remove file"');
  });

  it("needs a removeLabel with onRemove, and cannot be a plain pill's label-less x", () => {
    // @ts-expect-error onRemove without removeLabel
    const bad: ComponentProps<typeof Pill> = { onRemove: () => undefined, children: "x" };
    expect(bad).toBeDefined();
  });
});
