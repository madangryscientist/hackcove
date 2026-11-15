// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"; // markup read as data, below
import { describe, expect, it } from "vitest";
import { render, screen } from "./render.harness.js";
import { StatTile } from "./StatTile.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("StatTile", () => {
  it("reads the caption before the value", () => {
    render(<StatTile label="Total interest" value="R 12 400" />);
    expect(follows(screen.getByText("Total interest"), screen.getByText("R 12 400"))).toBeTruthy();
  });

  it("reads the hint after the value", () => {
    render(<StatTile label="A" value="1" hint="left over" />);
    expect(follows(screen.getByText("1"), screen.getByText("left over"))).toBeTruthy();
  });

  it("shows a hint of 0", () => {
    render(<StatTile label="A" value="1" hint={0} />);
    expect(screen.getByText("0")).not.toBeNull();
  });

  it("says only its caption and value without a hint", () => {
    const { container } = render(<StatTile label="A" value="1" />);
    expect(container.textContent).toBe("A1");
  });

  it("adds no text with an accent bar or a trend: both are decoration", () => {
    const { container } = render(
      <StatTile label="A" value="5" tone="positive" accent trend={[1, 3, 2]} hint="up" />,
    );
    expect(container.textContent).toBe("A5up");
  });
});

// The accent bar and the sparkline have no role, name or text to find them by, so their markup is
// read as data (as noLeak.test.tsx does): each is hidden from assistive technology.
describe("StatTile markup, read as data", () => {
  it("hides the accent bar and the sparkline from assistive technology", () => {
    const markup = renderToStaticMarkup(<StatTile label="A" value="5" accent trend={[1, 3, 2]} />); // markup read as data
    const drawn = [...markup.matchAll(/<(?:span|svg)\b[^>]*>/g)].map(([tag]) => tag);
    expect(drawn).toHaveLength(2);
    expect(drawn.every((tag) => tag.includes('aria-hidden="true"'))).toBe(true);
  });
});
