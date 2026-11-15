import { expect, test } from "vitest";

type Node = { name: string; children: Node[] };

// A unit test of plain data, with no Testing Library import: a tree's `children` is not the DOM.
test("counts the leaves of a tree", () => {
  const tree: Node = { name: "root", children: [{ name: "leaf", children: [] }] };
  const leaves = tree.children.filter((node) => node.children.length === 0);
  expect(tree.children).toHaveLength(1);
  expect(leaves.map((node) => node.name)).toEqual(["leaf"]);
});
