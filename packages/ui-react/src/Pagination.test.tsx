// @vitest-environment jsdom
import { queryAllByAttribute } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { pageWindow, Pagination } from "./Pagination.js";
import { render, screen } from "./render.harness.js";

const href = (page: number) => `/stores?page=${page}`;

describe("pageWindow", () => {
  it.each([
    [1, 1, [1]],
    [1, 2, [1, 2]],
    [2, 2, [1, 2]],
    [4, 7, [1, 2, 3, 4, 5, 6, 7]],
    [1, 8, [1, 2, 3, 4, 5, "gap", 8]],
    [4, 8, [1, 2, 3, 4, 5, "gap", 8]],
    [5, 8, [1, "gap", 4, 5, 6, 7, 8]],
    [8, 8, [1, "gap", 4, 5, 6, 7, 8]],
    [1, 20, [1, 2, 3, 4, 5, "gap", 20]],
    [2, 20, [1, 2, 3, 4, 5, "gap", 20]],
    [3, 20, [1, 2, 3, 4, 5, "gap", 20]],
    [4, 20, [1, 2, 3, 4, 5, "gap", 20]],
    [5, 20, [1, "gap", 4, 5, 6, "gap", 20]],
    [10, 20, [1, "gap", 9, 10, 11, "gap", 20]],
    [17, 20, [1, "gap", 16, 17, 18, 19, 20]],
    [19, 20, [1, "gap", 16, 17, 18, 19, 20]],
    [20, 20, [1, "gap", 16, 17, 18, 19, 20]],
    [0, 20, [1, 2, 3, 4, 5, "gap", 20]],
    [-1, 20, [1, 2, 3, 4, 5, "gap", 20]],
    [99, 20, [1, "gap", 16, 17, 18, 19, 20]],
  ] as const)("page %i of %i is %j", (page, pageCount, slots) => {
    expect(pageWindow(page, pageCount)).toEqual(slots);
  });

  it("never holds more than seven slots, and a gap never hides a single page", () => {
    for (let pageCount = 1; pageCount <= 30; pageCount += 1) {
      for (let page = 1; page <= pageCount; page += 1) {
        const slots = pageWindow(page, pageCount);
        expect(slots.length).toBeLessThanOrEqual(7);
        // Each gap with the slots either side of it: two page numbers at least three apart.
        const gaps = slots
          .map((slot, index) => [slots[index - 1], slot, slots[index + 1]] as const)
          .filter(([, slot]) => slot === "gap");
        for (const [before, , after] of gaps) {
          expect([typeof before, typeof after]).toEqual(["number", "number"]);
          expect(Number(after) - Number(before) - 1).toBeGreaterThanOrEqual(2);
        }
        expect(slots).toContain(page);
      }
    }
  });
});

describe("Pagination", () => {
  it("is a nav named by label, the current page marked and every link from pageHref", () => {
    render(<Pagination label="Directory pages" page={3} pageCount={10} pageHref={href} />);
    const nav = screen.getByRole("navigation", { name: "Directory pages" });
    const current = queryAllByAttribute("aria-current", nav, () => true);
    expect(current.map((link) => [link.textContent, link.getAttribute("aria-current")])).toEqual([
      ["3", "page"],
    ]);
    expect(screen.getByRole("link", { name: "3" }).getAttribute("href")).toBe(href(3));
    expect(screen.getByRole("link", { name: "Previous" }).getAttribute("href")).toBe(href(2));
    expect(screen.getByRole("link", { name: "Next" }).getAttribute("href")).toBe(href(4));
    expect(screen.getByRole("link", { name: "10" }).getAttribute("href")).toBe(href(10));
  });

  it("draws Previous as text on the first page and Next as text on the last", () => {
    const { rerender } = render(
      <Pagination label="Pages" page={1} pageCount={4} pageHref={href} />,
    );
    expect(screen.queryByRole("link", { name: "Previous" })).toBeNull();
    expect(screen.getByText("Previous").tagName).toBe("SPAN");
    rerender(<Pagination label="Pages" page={4} pageCount={4} pageHref={href} />);
    expect(screen.queryByRole("link", { name: "Next" })).toBeNull();
    expect(screen.getByRole("link", { name: "Previous" }).getAttribute("href")).toBe(href(3));
  });

  it("draws a page past the end as the last page", () => {
    render(<Pagination label="Pages" page={9} pageCount={4} pageHref={href} />);
    expect(screen.getByRole("link", { name: "4" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("Page 4 of 4")).toBeTruthy();
  });

  it("renders nothing for one page", () => {
    const { container } = render(
      <Pagination label="Pages" page={1} pageCount={1} pageHref={href} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("takes previousLabel, nextLabel and pageLabel in place of the default words", () => {
    render(
      <Pagination
        label="Bladsye"
        page={2}
        pageCount={4}
        pageHref={href}
        previousLabel="Vorige"
        nextLabel="Volgende"
        pageLabel={(page, pageCount) => `Bladsy ${page} van ${pageCount}`}
      />,
    );
    expect(screen.getByRole("link", { name: "Vorige" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Volgende" })).toBeTruthy();
    expect(screen.getByText("Bladsy 2 van 4")).toBeTruthy();
  });

  it("hides the gaps from assistive tech", () => {
    render(<Pagination label="Pages" page={10} pageCount={20} pageHref={href} />);
    const gaps = screen.getAllByText("…");
    expect(gaps.map((gap) => gap.getAttribute("aria-hidden"))).toEqual(["true", "true"]);
  });
});
