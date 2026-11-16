// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { render, screen } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

/** The heading, the band and the body, in the order they should read. */
const titleBandBody = (): [HTMLElement, HTMLElement, HTMLElement] => [
  screen.getByRole("heading", { level: 2, name: "Reno" }),
  screen.getByText("band"),
  screen.getByText("body"),
];

describe("Card inset", () => {
  it("reads the band under the title and above the children", () => {
    render(
      <Card title="Reno" inset={<i>band</i>}>
        <p>body</p>
      </Card>,
    );
    const [heading, band, body] = titleBandBody();
    expect(follows(heading, band)).toBeTruthy();
    expect(follows(band, body)).toBeTruthy();
  });

  it("reads the band under the title and above the children of a bar card", () => {
    render(
      <Card bar title="Reno" inset={<i>band</i>}>
        <p>body</p>
      </Card>,
    );
    const [heading, band, body] = titleBandBody();
    expect(follows(heading, band)).toBeTruthy();
    expect(follows(band, body)).toBeTruthy();
  });

  it("reads the band above the body and the body above the footer", () => {
    render(
      <Card footer={<p>foot</p>} inset={<i>band</i>}>
        <p>body</p>
      </Card>,
    );
    const band = screen.getByText("band");
    const body = screen.getByText("body");
    expect(follows(band, body)).toBeTruthy();
    expect(follows(body, screen.getByText("foot"))).toBeTruthy();
  });

  it("reads under the title and above the children on a link card too", () => {
    render(
      <Card href="/x" title="Reno" inset={<i>band</i>}>
        <p>body</p>
      </Card>,
    );
    const [heading, band, body] = titleBandBody();
    expect(follows(heading, band)).toBeTruthy();
    expect(follows(band, body)).toBeTruthy();
  });
});
