// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Cluster, ClusterGrow } from "./Cluster.js";
import { render, screen, within } from "./render.harness.js";

describe("Cluster", () => {
  it("is a div by default and a span with as=span, for phrasing content", () => {
    render(
      <>
        <Cluster>block</Cluster>
        <p>
          <Cluster as="span">inline</Cluster>
        </p>
      </>,
    );
    expect(screen.getByText("block").tagName).toBe("DIV");
    expect(screen.getByText("inline").tagName).toBe("SPAN");
  });

  it("keeps its items in the order given", () => {
    render(
      <Cluster justify="between">
        <span>first</span>
        <ClusterGrow>middle</ClusterGrow>
        <span>last</span>
      </Cluster>,
    );
    const first = screen.getByText("first");
    const middle = screen.getByText("middle");
    const last = screen.getByText("last");
    expect(first.compareDocumentPosition(middle) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(middle.compareDocumentPosition(last) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});

describe("Cluster as a list", () => {
  it.each(["ul", "ol"] as const)(
    "as=%s is a list named by aria-label, one item per child",
    (as) => {
      render(
        <Cluster as={as} aria-label="Tags">
          <li>Vintage</li>
          <li>Books</li>
          <li>Vinyl</li>
        </Cluster>,
      );
      const list = screen.getByRole("list", { name: "Tags" });
      expect(
        within(list)
          .getAllByRole("listitem")
          .map((item) => item.textContent),
      ).toEqual(["Vintage", "Books", "Vinyl"]);
    },
  );
});
