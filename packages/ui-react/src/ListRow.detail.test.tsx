// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { ListRow } from "./ListRow.js";
import { render, screen, within } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("ListRow detail", () => {
  it("reads the detail after the row's line, inside the row", () => {
    render(
      <ListRow aria-label="Chat row" leading="L" trailing="3" panel={<p>Thread</p>}>
        Chat
      </ListRow>,
    );
    const row = screen.getByLabelText("Chat row");
    expect(within(row).getByText("Thread")).not.toBeNull();
    expect(follows(screen.getByText("L"), screen.getByText("Chat"))).toBeTruthy();
    expect(follows(screen.getByText("Chat"), screen.getByText("3"))).toBeTruthy();
    expect(follows(screen.getByText("3"), screen.getByText("Thread"))).toBeTruthy();
  });

  it("reads the row's actions before the detail", () => {
    render(
      <ListRow divided revealOnHover actions={<button type="button">Hide</button>} panel="Thread">
        Chat
      </ListRow>,
    );
    expect(
      follows(screen.getByRole("button", { name: "Hide" }), screen.getByText("Thread")),
    ).toBeTruthy();
  });
});
