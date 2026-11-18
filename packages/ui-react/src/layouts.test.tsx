// @vitest-environment jsdom
import { createRef } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs.js";
import { Container } from "./Container.js";
import { stubDialog } from "./dom.harness.js";
import { Lightbox } from "./Lightbox.js";
import { MediaTile } from "./MediaTile.js";
import { ListLayout } from "./PageLayouts.js";
import { render, screen } from "./render.harness.js";
import { SortableList, SortableSection } from "./SortableList.js";
import { NotFound } from "./StatusPages.js";
import { Tabs } from "./Tabs.js";

beforeEach(stubDialog);

describe("ListLayout", () => {
  it("shows empty when there are no children, and the list when there are", () => {
    const rows: string[] = [];
    render(
      <ListLayout title="Quotes" empty="No quotes yet">
        {rows.map((row) => (
          <p key={row}>{row}</p>
        ))}
      </ListLayout>,
    );
    expect(screen.getByText("No quotes yet")).not.toBeNull();
  });

  it("shows the children, not empty, when there are some", () => {
    render(
      <ListLayout title="Quotes" empty="No quotes yet">
        <p>Q-1042</p>
      </ListLayout>,
    );
    expect(screen.getByText("Q-1042")).not.toBeNull();
    expect(screen.queryByText("No quotes yet")).toBeNull();
  });
});

describe("Breadcrumbs", () => {
  it("names its nav Breadcrumb by default, or by label", () => {
    render(
      <>
        <Breadcrumbs items={["Home", "Quotes"]} />
        <Breadcrumbs items={["Accueil", "Devis"]} label="Fil d'Ariane" />
      </>,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).not.toBeNull();
    expect(screen.getByRole("navigation", { name: "Fil d'Ariane" })).not.toBeNull();
  });
});

describe("Lightbox", () => {
  it("names its buttons Close, Previous and Next, or by their labels", () => {
    render(
      <Lightbox
        label="Photo"
        onClose={() => {}}
        onPrevious={() => {}}
        onNext={() => {}}
        closeLabel="Fermer"
        previousLabel="Précédent"
      >
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Harbour" />
      </Lightbox>,
    );
    expect(screen.getByRole("button", { name: "Fermer", hidden: true })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Précédent", hidden: true })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Next", hidden: true })).not.toBeNull();
  });
});

describe("MediaTile", () => {
  it("names its remove button by removeLabel and the alt", () => {
    render(
      <>
        <MediaTile src="/a.jpg" alt="A red chair" onRemove={() => {}} />
        <MediaTile src="/b.jpg" alt="A blue lamp" onRemove={() => {}} removeLabel="Retirer" />
      </>,
    );
    expect(screen.getByRole("button", { name: "Remove A red chair" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Retirer A blue lamp" })).not.toBeNull();
  });
});

describe("SortableSection", () => {
  it("shows emptyLabel in an empty section", () => {
    render(
      <SortableList label="Queue" onReorder={() => {}}>
        <SortableSection id="later" title="Later" emptyLabel="Nothing here" />
      </SortableList>,
    );
    expect(screen.getByText("Nothing here")).not.toBeNull();
  });
});

describe("Tabs", () => {
  it("marks the selected link item current", () => {
    render(
      <Tabs
        label="Main"
        items={[
          { label: "Quotes", href: "/quotes", selected: true },
          { label: "Clients", href: "/clients" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Quotes" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Clients" }).hasAttribute("aria-current")).toBe(false);
  });

  it("the vertical rail is a vertical tab list", () => {
    render(
      <Tabs
        label="Sections"
        orientation="vertical"
        items={[{ value: "a", label: "A" }]}
        value="a"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe("vertical");
  });
});

describe("status pages", () => {
  it("draw their actions before Back to home", () => {
    render(<NotFound actions={<button type="button">Open the map</button>} />);
    const [first, second] = [
      screen.getByRole("button", { name: "Open the map" }),
      screen.getByRole("link", { name: "Back to home" }),
    ];
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("Container", () => {
  it("ref reaches the rendered element", () => {
    const ref = createRef<HTMLElement>();
    render(<Container as="main" ref={ref} data-testid="c" />);
    expect(ref.current).toBe(screen.getByTestId("c"));
  });
});
