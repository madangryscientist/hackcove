// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { Pill } from "./Pill.js";
import { render, screen, within } from "./render.harness.js";

describe("Card titleStyle", () => {
  it("defaults to a level-2 heading that names the card", () => {
    render(<Card title="Corner Books">body</Card>);
    const region = screen.getByRole("region", { name: "Corner Books" });
    expect(within(region).getByRole("heading", { level: 2, name: "Corner Books" })).not.toBeNull();
  });

  it("name still names the card, and keeps count, status and actions", () => {
    render(
      <Card
        title="Corner Books"
        titleStyle="name"
        count={4}
        status={<Pill tone="amber">Open</Pill>}
        actions={<button type="button">Edit</button>}
        bar
      >
        body
      </Card>,
    );
    const region = screen.getByRole("region", { name: "Corner Books" });
    expect(within(region).getByText("4")).not.toBeNull();
    expect(within(region).getByText("Open")).not.toBeNull();
    expect(within(region).getByRole("button", { name: "Edit" })).not.toBeNull();
  });

  it("name works on a card that is a link", () => {
    render(
      <Card title="Corner Books" titleStyle="name" href="/shops/1">
        body
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Corner Books" })).not.toBeNull();
    expect(screen.getByRole("link", { name: /Corner Books/ }).getAttribute("href")).toBe(
      "/shops/1",
    );
  });
});
