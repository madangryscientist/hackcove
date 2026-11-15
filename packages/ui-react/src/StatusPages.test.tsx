// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { ErrorPage, Forbidden, Maintenance, NotFound, Offline } from "./StatusPages.js";
import { render, screen, user, within } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

const pages = [
  ["NotFound", NotFound, "Page not found"],
  ["ErrorPage", ErrorPage, "Something went wrong"],
  ["Offline", Offline, "You are offline"],
  ["Maintenance", Maintenance, "Down for maintenance"],
  ["Forbidden", Forbidden, "Access denied"],
] as const;

describe.each(pages)("%s", (_name, Page, heading) => {
  it("has its fixed heading as the page's only h1, and no actions by default", () => {
    render(<Page />);
    expect(screen.getAllByRole("heading").map((h) => h.textContent)).toEqual([heading]);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(heading);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("the shared props", () => {
  it("takes a title and body override", () => {
    render(<NotFound title="Custom title">Custom body</NotFound>);
    expect(screen.getByRole("heading", { level: 1, name: "Custom title" })).not.toBeNull();
    expect(screen.getByText("Custom body")).not.toBeNull();
    expect(screen.queryByText("Page not found")).toBeNull();
  });

  it("links home with homeHref", () => {
    render(<NotFound homeHref="/" />);
    expect(screen.getByRole("link", { name: "Back to home" }).getAttribute("href")).toBe("/");
  });

  it("reads a custom action before the home link", () => {
    render(<NotFound action={<button type="button">Go</button>} homeHref="/" />);
    expect(
      follows(
        screen.getByRole("button", { name: "Go" }),
        screen.getByRole("link", { name: "Back to home" }),
      ),
    ).toBeTruthy();
  });
});

describe("ErrorPage", () => {
  it("shows the error detail in a code block captioned Error", () => {
    render(<ErrorPage detail="Request 4f2a failed" />);
    const figure = screen.getByRole("figure");
    expect(within(figure).getByText("Error")).not.toBeNull();
    expect(figure.textContent).toContain("Request 4f2a failed");
  });

  it("shows no detail block without detail", () => {
    render(<ErrorPage />);
    expect(screen.queryByRole("figure")).toBeNull();
  });

  it("an action replaces the Try again button", () => {
    render(<ErrorPage onRetry={() => {}} action={<button type="button">Reload</button>} />);
    expect(screen.getByRole("button", { name: "Reload" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});

describe("NotFound numeral", () => {
  it("draws 404 before the heading when numeral is on, and the heading stays the only one", () => {
    render(<NotFound numeral homeHref="/" />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Page not found" });
    expect(follows(screen.getByText("404"), h1)).toBeTruthy();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("draws no 404 by default", () => {
    render(<NotFound homeHref="/" />);
    expect(screen.queryByText("404")).toBeNull();
  });

  it.each([
    ["Forbidden", <Forbidden key="f" homeHref="/" />],
    ["ErrorPage", <ErrorPage key="e" />],
  ] as const)("draws no 404 on %s", (_name, page) => {
    render(page);
    expect(screen.queryByText("404")).toBeNull();
  });
});

describe("NotFound with its own action", () => {
  it("renders the action's wording and no Back to home link", () => {
    render(<NotFound action={<Button href="/map">Open the map</Button>} />);
    expect(screen.getByRole("link", { name: "Open the map" }).getAttribute("href")).toBe("/map");
    expect(screen.queryByText("Back to home")).toBeNull();
  });
});

describe.each([
  ["ErrorPage", ErrorPage],
  ["Offline", Offline],
] as const)("%s onRetry", (_name, Page) => {
  it("Try again calls onRetry once", async () => {
    const onRetry = vi.fn<() => void>();
    render(<Page onRetry={onRetry} />);
    await user().click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
