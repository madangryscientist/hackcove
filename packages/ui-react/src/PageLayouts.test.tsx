// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  CardGrid,
  CenteredLayout,
  DetailLayout,
  FormLayout,
  FullBleedLayout,
  ListLayout,
  ProseLayout,
} from "./PageLayouts.js";
import { render, screen, within } from "./render.harness.js";

const follows = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;

/** Whether each text is found on the page, each after the one before it. */
const inOrder = (texts: string[]): boolean => {
  const nodes = texts.map((text) => screen.getByText(text));
  return nodes.slice(1).every((node, i) => {
    const before = nodes[i];
    return before !== undefined && Boolean(follows(before, node));
  });
};

describe("ListLayout", () => {
  it("reads the header, the filters, then the list", () => {
    render(
      <ListLayout title="Quotes" actions="NEW" filters={<p>FILTERS</p>}>
        <p>ROWS</p>
      </ListLayout>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Quotes" })).not.toBeNull();
    expect(inOrder(["Quotes", "NEW", "FILTERS", "ROWS"])).toBe(true);
  });

  it("shows `empty` instead of the list when there are no rows", () => {
    render(<ListLayout title="Quotes" empty="NOTHING" />);
    expect(screen.getByText("NOTHING")).not.toBeNull();
  });

  it("shows the list, not `empty`, when it has rows", () => {
    render(
      <ListLayout title="Quotes" empty="NOTHING">
        ROWS
      </ListLayout>,
    );
    expect(screen.getByText("ROWS")).not.toBeNull();
    expect(screen.queryByText("NOTHING")).toBeNull();
  });
});

describe("DetailLayout", () => {
  it("puts the aside in its own landmark, read after main", () => {
    render(
      <DetailLayout title="Quote 7" aside="SIDE">
        MAIN
      </DetailLayout>,
    );
    expect(within(screen.getByRole("complementary")).getByText("SIDE")).not.toBeNull();
    expect(within(screen.getByRole("complementary")).queryByText("MAIN")).toBeNull();
    expect(inOrder(["Quote 7", "MAIN", "SIDE"])).toBe(true);
  });

  it("still reads the aside after main with sticky", () => {
    render(
      <DetailLayout title="Quote 7" aside="SIDE" sticky>
        MAIN
      </DetailLayout>,
    );
    expect(inOrder(["MAIN", "SIDE"])).toBe(true);
  });
});

describe("FormLayout", () => {
  it("passes form props to the <form>, which holds the fields and then the actions", () => {
    render(
      <FormLayout title="New quote" actions="SAVE" action="/save" aria-label="New quote form">
        FIELDS
      </FormLayout>,
    );
    const form = screen.getByRole("form", { name: "New quote form" });
    expect(form.getAttribute("action")).toBe("/save");
    expect(within(form).getByText("SAVE")).not.toBeNull();
    expect(within(form).queryByText("New quote")).toBeNull();
    expect(inOrder(["New quote", "FIELDS", "SAVE"])).toBe(true);
  });
});

describe("ProseLayout", () => {
  it("reads the header, then the blocks", () => {
    render(
      <ProseLayout title="Privacy" description="Last updated" actions="PHOTO">
        <p>ONE</p>
        <p>TWO</p>
      </ProseLayout>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Privacy" })).not.toBeNull();
    expect(inOrder(["Privacy", "Last updated", "PHOTO", "ONE", "TWO"])).toBe(true);
  });
});

describe("CardGrid as=ul", () => {
  it("is a list whose every child is an item", () => {
    render(
      <CardGrid as="ul">
        <p>One</p>
        <p>Two</p>
      </CardGrid>,
    );
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["One", "Two"]);
  });

  it("is no list without it", () => {
    render(
      <CardGrid>
        <p>One</p>
      </CardGrid>,
    );
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByText("One")).not.toBeNull();
  });

  it("skips empty children", () => {
    render(
      <CardGrid as="ul" columns={4}>
        {false}
        <p>One</p>
        {null}
      </CardGrid>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});

describe("FullBleedLayout", () => {
  it("reads the panel after the children, in its own landmark", () => {
    render(<FullBleedLayout aside="PANEL">VIEW</FullBleedLayout>);
    expect(screen.getByRole("complementary").textContent).toBe("PANEL");
    expect(inOrder(["VIEW", "PANEL"])).toBe(true);
  });

  it("renders no panel without one", () => {
    render(<FullBleedLayout>VIEW</FullBleedLayout>);
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("reads a `bar` before the children and the panel", () => {
    render(
      <FullBleedLayout bar="BAR" aside="PANEL">
        VIEW
      </FullBleedLayout>,
    );
    expect(inOrder(["BAR", "VIEW", "PANEL"])).toBe(true);
  });
});

describe("CenteredLayout", () => {
  it("reads the title, subtitle and body in order, the title the page's h1", () => {
    render(
      <CenteredLayout title="Sign in" description="to continue">
        <p>FORM</p>
      </CenteredLayout>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).not.toBeNull();
    expect(inOrder(["Sign in", "to continue", "FORM"])).toBe(true);
  });
});
