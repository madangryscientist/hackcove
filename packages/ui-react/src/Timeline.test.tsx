// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { follows, render, screen, within } from "./render.harness.js";
import { Timeline, TimelineItem } from "./Timeline.js";

describe("Timeline", () => {
  it("is an ordered list named by its label, an item per entry", () => {
    render(
      <Timeline label="Status history">
        <TimelineItem title="Sent" />
        <TimelineItem title="Accepted" />
      </Timeline>,
    );
    const list = screen.getByRole("list", { name: "Status history" });
    expect(list.tagName).toBe("OL");
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Sent", "Accepted"]);
  });

  it("draws `empty` instead of an empty list", () => {
    render(<Timeline label="History" empty={<p>No history.</p>} />);
    expect(screen.getByText("No history.")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("draws `empty` for an empty array of children", () => {
    render(
      <Timeline label="History" empty="none">
        {[]}
      </Timeline>,
    );
    expect(screen.getByText("none")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("draws nothing when empty with no `empty`", () => {
    render(<Timeline label="History" />);
    expect(screen.queryByRole("list")).toBeNull();
    expect(document.body.textContent).toBe("");
  });
});

describe("TimelineItem", () => {
  it("reads the title, then the time, then the note", () => {
    render(
      <ol>
        <TimelineItem title="Accepted" time="12 Oct 2026, 09:14">
          Client confirmed by phone.
        </TimelineItem>
      </ol>,
    );
    const time = screen.getByText("12 Oct 2026, 09:14");
    expect(follows(screen.getByText("Accepted"), time)).toBe(true);
    expect(follows(time, screen.getByText("Client confirmed by phone."))).toBe(true);
  });

  it("holds only its title when there is no time or note", () => {
    render(
      <ol>
        <TimelineItem title="Sent" />
      </ol>,
    );
    expect(screen.getByRole("listitem").textContent).toBe("Sent");
  });
});
