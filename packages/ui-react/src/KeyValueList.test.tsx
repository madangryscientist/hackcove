// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { KeyValue, KeyValueList } from "./KeyValueList.js";
import { render, screen } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("KeyValueList", () => {
  it("reads each label as a term, followed by its value as the definition", () => {
    render(
      <KeyValueList>
        <KeyValue label="Size">1280×720</KeyValue>
        <KeyValue label="Diff">0.4%</KeyValue>
      </KeyValueList>,
    );
    const terms = screen.getAllByRole("term");
    const values = screen.getAllByRole("definition");
    expect(terms.map((t) => t.textContent)).toEqual(["Size", "Diff"]);
    expect(values.map((v) => v.textContent)).toEqual(["1280×720", "0.4%"]);
    expect(follows(screen.getByText("Size"), screen.getByText("1280×720"))).toBeTruthy();
    expect(follows(screen.getByText("1280×720"), screen.getByText("Diff"))).toBeTruthy();
  });
});
