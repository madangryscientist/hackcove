// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { MediaTile } from "./MediaTile.js";
import { render, screen, user, within } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("MediaTile", () => {
  it("is a picture named by alt and no button when it has no onClick", () => {
    render(<MediaTile src="/a.jpg" alt="Status from Anna" />);
    expect(screen.getByRole("img", { name: "Status from Anna" })).not.toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("reads the label on the picture before the caption under it", () => {
    render(<MediaTile src="/a.jpg" alt="Photo" label="Anna" caption="Today, 09:12" />);
    expect(follows(screen.getByText("Anna"), screen.getByText("Today, 09:12"))).toBeTruthy();
  });

  it("is one button that calls onClick, named by its picture and label", async () => {
    const onClick = vi.fn<() => void>();
    render(<MediaTile src="/a.jpg" alt="Photo from Anna" label="Anna" onClick={onClick} />);
    // jsdom joins the name with no space (it lays nothing out); a browser reads "Photo from Anna Anna".
    const button = screen.getByRole("button", { name: /^Photo from Anna\s?Anna$/ });
    expect(button.getAttribute("type")).toBe("button");
    await user().click(within(button).getByRole("img", { name: "Photo from Anna" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows the placeholder and its label when there is no picture, as an Earlier tile does", () => {
    render(<MediaTile alt="Earlier statuses" label="Earlier" width="sm" />);
    expect(screen.getByRole("img", { name: "Earlier statuses" })).not.toBeNull();
    expect(screen.getByText("Earlier")).not.toBeNull();
  });

  it("has no remove button without onRemove", () => {
    render(<MediaTile src="/a.jpg" alt="Photo" onClick={() => undefined} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("adds a remove button beside the tile's own, named by Remove and alt", async () => {
    const onClick = vi.fn<() => void>();
    const onRemove = vi.fn<() => void>();
    render(
      <MediaTile src="/a.jpg" alt="Slip.pdf" width="sm" onClick={onClick} onRemove={onRemove} />,
    );
    const tile = screen.getByRole("button", { name: "Slip.pdf" });
    const remove = screen.getByRole("button", { name: "Remove Slip.pdf" });
    // Two sibling buttons, never one inside the other.
    expect(within(tile).queryByRole("button")).toBeNull();
    expect(remove.getAttribute("type")).toBe("button");
    await user().click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    await user().click(tile);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("removes a plain tile too, with the remove button its only one", async () => {
    const onRemove = vi.fn<() => void>();
    render(<MediaTile src="/a.jpg" alt="Photo" width="sm" onRemove={onRemove} />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    await user().click(screen.getByRole("button", { name: "Remove Photo" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
