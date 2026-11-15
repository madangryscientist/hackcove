import { within } from "@testing-library/dom";
import { expect, test, vi } from "vitest";

const pages = [
  "<html><head><meta name='description' content='Hi'></head><body><h1>Hi</h1></body></html>",
];

// A check of built HTML reads the page as data: it may branch and query the parsed document.
test("every built page has a description and a heading", () => {
  const seen = vi.fn();
  for (const html of pages) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const meta = doc.querySelector("meta[name=description]");
    if (meta === null) throw new Error("no description");
    expect(meta.getAttribute("content")).not.toBe("");
    expect(within(doc.body).getByRole("heading").parentElement).toBe(doc.body);
    seen(html);
  }
  expect(seen).toHaveBeenCalledTimes(pages.length);
});
