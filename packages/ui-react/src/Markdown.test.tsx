// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Markdown } from "./Markdown.js";
import { render, screen, within } from "./render.harness.js";

describe("Markdown", () => {
  it("renders headings, bullets and paragraphs", () => {
    render(<Markdown md={"## Done\n- one\n* two\n\n### Next\nplain"} />);
    expect(screen.getByRole("heading", { level: 2, name: "Done" })).not.toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Next" })).not.toBeNull();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["one", "two"]);
    expect(screen.getByRole("paragraph").textContent).toBe("plain");
  });

  it("groups consecutive bullets into one list and starts a new one after a break", () => {
    render(<Markdown md={"- a\n- b\n\n- c"} />);
    const lists = screen.getAllByRole("list");
    expect(lists.map((list) => within(list).getAllByRole("listitem").length)).toEqual([2, 1]);
  });

  it("renders **bold** as strong", () => {
    render(<Markdown md="- **HC-42** shipped" />);
    expect(screen.getByText("HC-42").tagName).toBe("STRONG");
  });

  it("never injects HTML from the input", () => {
    const source = "<script>alert(1)</script>";
    render(<Markdown md={source} />);
    expect(screen.getByRole("paragraph").textContent).toBe(source);
  });
});
