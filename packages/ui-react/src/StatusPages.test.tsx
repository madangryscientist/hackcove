// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.js";
import { type LinkAdapterProps, LinkProvider } from "./link.js";
import { ErrorPage, Forbidden, Maintenance, NotFound, Offline } from "./StatusPages.js";
import { render, screen, user, within } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

const homeward = [
  ["NotFound", NotFound, "Page not found"],
  ["ErrorPage", ErrorPage, "Something went wrong"],
  ["Offline", Offline, "You are offline"],
  ["Forbidden", Forbidden, "Access denied"],
] as const;

const home = () => screen.getByRole("link", { name: "Back to home" });

/** A router stand-in: an <a> that navigates by calling `navigate` and stops the load. */
function routed(navigate: (href: string) => void) {
  return function RouterLink({ href, ...rest }: LinkAdapterProps): ReactNode {
    return (
      <a
        {...rest}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          navigate(href);
        }}
      />
    );
  };
}

describe.each(homeward)("%s", (_name, Page, heading) => {
  it("has its fixed heading and a Back to home link to / with no provider", () => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: heading })).not.toBeNull();
    expect(home().getAttribute("href")).toBe("/");
  });
});

describe("Maintenance", () => {
  it("has its heading and no Back to home link: home is the site that is down", () => {
    render(<Maintenance />);
    expect(screen.getByRole("heading", { level: 1, name: "Down for maintenance" })).not.toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});

describe("the home link", () => {
  it("goes to the provider's home, a plain link in the same tab, with no adapter", () => {
    render(
      <LinkProvider home="https://slashslash.example">
        <NotFound />
      </LinkProvider>,
    );
    expect(home().getAttribute("href")).toBe("https://slashslash.example");
    expect(home().hasAttribute("target")).toBe(false);
  });

  it.each([
    [undefined, "/"],
    ["/app", "/app"],
  ])("navigates through the adapter (home %s)", async (where, to) => {
    const navigate = vi.fn<(href: string) => void>();
    render(
      <LinkProvider link={routed(navigate)} home={where}>
        <NotFound />
      </LinkProvider>,
    );
    await user().click(home());
    expect(navigate).toHaveBeenCalledWith(to);
  });

  it("a nested provider that sets only home keeps the outer adapter", async () => {
    const navigate = vi.fn<(href: string) => void>();
    render(
      <LinkProvider link={routed(navigate)}>
        <LinkProvider home="/area">
          <NotFound />
        </LinkProvider>
      </LinkProvider>,
    );
    await user().click(home());
    expect(navigate).toHaveBeenCalledWith("/area");
  });

  it("stays beside the page's own action, which Tab reaches first", async () => {
    render(<NotFound action={<Button href="/map">Open the map</Button>} />);
    await user().tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Open the map" }));
    await user().tab();
    expect(document.activeElement).toBe(home());
  });
});

describe("the shared props", () => {
  it("takes a title and body override", () => {
    render(<NotFound title="Custom title">Custom body</NotFound>);
    expect(screen.getByRole("heading", { level: 1, name: "Custom title" })).not.toBeNull();
    expect(screen.getByText("Custom body")).not.toBeNull();
    expect(screen.queryByText("Page not found")).toBeNull();
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
    render(<NotFound numeral />);
    const h1 = screen.getByRole("heading", { level: 1, name: "Page not found" });
    expect(follows(screen.getByText("404"), h1)).toBeTruthy();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("draws no 404 by default", () => {
    render(<NotFound />);
    expect(screen.queryByText("404")).toBeNull();
  });

  it.each([
    ["Forbidden", <Forbidden key="f" />],
    ["ErrorPage", <ErrorPage key="e" />],
  ] as const)("draws no 404 on %s", (_name, page) => {
    render(page);
    expect(screen.queryByText("404")).toBeNull();
  });
});

describe("NotFound with its own action", () => {
  it("renders the action's wording before Back to home", () => {
    render(<NotFound action={<Button href="/map">Open the map</Button>} />);
    expect(screen.getByRole("link", { name: "Open the map" }).getAttribute("href")).toBe("/map");
    expect(follows(screen.getByRole("link", { name: "Open the map" }), home())).toBeTruthy();
  });
});

describe.each([
  ["ErrorPage", ErrorPage],
  ["Offline", Offline],
] as const)("%s onRetry", (_name, Page) => {
  it("Try again calls onRetry once, and the home link is still there", async () => {
    const onRetry = vi.fn<() => void>();
    render(<Page onRetry={onRetry} />);
    await user().click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(home()).not.toBeNull();
  });
});
