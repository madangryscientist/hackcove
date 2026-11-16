// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { OutlineRegion, RegionFrame } from "./OutlineRegion.js";
import { fireEvent, render, screen } from "./render.harness.js";

const within = { width: 200, height: 100 };
const rect = { x: 0, y: 0, width: 10, height: 10 };

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("OutlineRegion", () => {
  it("shows its label tag", () => {
    render(<OutlineRegion rect={rect} within={within} label="config" />);
    expect(screen.getByText("config")).not.toBeNull();
  });

  it("takes a title, and has no tag without a label", () => {
    render(<OutlineRegion rect={rect} within={within} title="ignored" />);
    expect(screen.getByTitle("ignored").textContent).toBe("");
  });
});

describe("RegionFrame", () => {
  it("draws the picture with its own props, and the regions after it", () => {
    render(
      <RegionFrame src="/shot.png" alt="A shot" loading="lazy">
        <OutlineRegion rect={rect} within={within} label="config" />
      </RegionFrame>,
    );
    const img = screen.getByRole("img", { name: "A shot" });
    expect(img.getAttribute("src")).toBe("/shot.png");
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(follows(img, screen.getByText("config"))).toBeTruthy();
  });

  it("keeps the picture's alt and onLoad at a letterboxed aspect and a fixed width", () => {
    const loaded: string[] = [];
    render(
      <RegionFrame
        src="/shot.png"
        alt="A shot"
        aspect="16:9"
        width="md"
        onLoad={(event) => loaded.push(event.currentTarget.alt)}
      >
        <OutlineRegion rect={rect} within={within} label="config" />
      </RegionFrame>,
    );
    const img = screen.getByRole("img", { name: "A shot" });
    // A load is not something jsdom does, so it is fired by hand.
    fireEvent.load(img);
    expect(loaded).toEqual(["A shot"]);
    expect(follows(img, screen.getByText("config"))).toBeTruthy();
  });
});
