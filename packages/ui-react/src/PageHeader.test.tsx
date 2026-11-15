// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader.js";
import { render, screen } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

describe("PageHeader", () => {
  it("is only the page's h1 when given a title", () => {
    render(<PageHeader title="Builds" />);
    expect(screen.getByRole("heading", { level: 1, name: "Builds" })).not.toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("reads breadcrumbs, title, subtitle, actions, then tabs", () => {
    render(
      <PageHeader
        breadcrumbs={<nav aria-label="Breadcrumb">crumbs</nav>}
        title="Builds"
        subtitle="every build"
        actions={<button type="button">New</button>}
        tabs={<nav aria-label="Tabs">tabs</nav>}
      />,
    );
    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    const title = screen.getByRole("heading", { level: 1, name: "Builds" });
    const subtitle = screen.getByText("every build");
    const actions = screen.getByRole("button", { name: "New" });
    const tabs = screen.getByRole("navigation", { name: "Tabs" });
    expect(follows(crumbs, title)).toBeTruthy();
    expect(follows(title, subtitle)).toBeTruthy();
    expect(follows(subtitle, actions)).toBeTruthy();
    expect(follows(actions, tabs)).toBeTruthy();
  });
});
