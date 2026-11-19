// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { Pill } from "./Pill.js";
import { follows, render, screen, within } from "./render.harness.js";

describe("Pill title", () => {
  it("is the native tooltip on a plain pill", () => {
    render(<Pill title="Accepted on 12 Oct">x</Pill>);
    expect(screen.getByText("x").getAttribute("title")).toBe("Accepted on 12 Oct");
  });

  it("is the native tooltip on a link pill", () => {
    render(
      <Pill href="#a" title="T">
        x
      </Pill>,
    );
    expect(screen.getByRole("link", { name: "x" }).getAttribute("title")).toBe("T");
  });

  it("is the native tooltip on a button pill", () => {
    render(
      <Pill onClick={() => undefined} title="T">
        x
      </Pill>,
    );
    expect(screen.getByRole("button", { name: "x" }).getAttribute("title")).toBe("T");
  });

  it("is absent without one", () => {
    render(<Pill>x</Pill>);
    expect(screen.getByText("x").hasAttribute("title")).toBe(false);
  });
});

describe("Card", () => {
  it("has no heading without a title", () => {
    render(<Card>body</Card>);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("shows the title as a level-2 heading and the count, a zero included", () => {
    render(
      <Card title="Open" count={0}>
        body
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Open" })).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
  });

  it("bar keeps the title, count, actions and body", () => {
    render(
      <Card bar title="Open" count={3} actions={<a href="/all">All</a>}>
        body
      </Card>,
    );
    const card = screen.getByRole("region", { name: "Open" });
    expect(within(card).getByText("3")).toBeTruthy();
    expect(within(card).getByRole("link", { name: "All" })).toBeTruthy();
    expect(within(card).getByText("body")).toBeTruthy();
  });

  it("reads the title, the count, the status, then the actions", () => {
    render(
      <Card title="UISlash" count={2} status={<b>s</b>} actions={<i>a</i>}>
        body
      </Card>,
    );
    const title = screen.getByRole("heading", { name: "UISlash" });
    const count = screen.getByText("2");
    const status = screen.getByText("s");
    expect(follows(title, count)).toBe(true);
    expect(follows(count, status)).toBe(true);
    expect(follows(status, screen.getByText("a"))).toBe(true);
  });

  it("renders no status without a title", () => {
    render(<Card status={<b>s</b>}>body</Card>);
    expect(screen.queryByText("s")).toBeNull();
  });

  it("shows the actions beside the title without a bar", () => {
    render(
      <Card title="Bills" actions={<b>x</b>}>
        body
      </Card>,
    );
    expect(within(screen.getByRole("region", { name: "Bills" })).getByText("x")).toBeTruthy();
  });
});

describe("Card footer", () => {
  it("reads after the body, inside the card", () => {
    render(
      <Card title="T" footer={<span>Total</span>}>
        body
      </Card>,
    );
    const total = within(screen.getByRole("region", { name: "T" })).getByText("Total");
    expect(follows(screen.getByText("body"), total)).toBe(true);
  });
});
