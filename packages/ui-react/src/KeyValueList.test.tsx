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

  it("keeps a total row and a toned row as a term and its definition", () => {
    render(
      <KeyValueList align="start">
        <KeyValue label="Difference" tone="warn">
          R 12.40
        </KeyValue>
        <KeyValue label="Total" total>
          R 30 650
        </KeyValue>
      </KeyValueList>,
    );
    expect(screen.getAllByRole("term").map((t) => t.textContent)).toEqual(["Difference", "Total"]);
    expect(screen.getAllByRole("definition").map((v) => v.textContent)).toEqual([
      "R 12.40",
      "R 30 650",
    ]);
  });
});
