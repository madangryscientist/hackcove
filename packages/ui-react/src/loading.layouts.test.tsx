// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState.js";
import {
  CardGrid,
  CenteredLayout,
  DetailLayout,
  FormLayout,
  FullBleedLayout,
  ListLayout,
  ProseLayout,
} from "./PageLayouts.js";
import { PageHeader } from "./PageHeader.js";
import { render, screen } from "./render.harness.js";
import { SidebarLayout } from "./SidebarLayout.js";
import { StatTile } from "./StatTile.js";
import { Text } from "./typography.js";

/** The bones drawn in `root`: every one hidden from assistive tech. */
function bones(root: ParentNode = document.body): Element[] {
  const found = [...root.querySelectorAll("[data-skeleton]")];
  for (const bone of found) expect(bone.closest("[aria-hidden='true']")).not.toBeNull();
  return found;
}

const busyRoots = (): Element[] => [...document.querySelectorAll("[aria-busy='true']")];

/** What each layout holds: a tile whose figure is not here yet. */
const inside = <StatTile label="Revenue" value={undefined} />;

/** Each layout and the header, holding `inside`, with `loading` as given. */
const layouts: Record<string, (loading?: boolean) => ReactNode> = {
  PageHeader: (loading) => <PageHeader title="Quotes" loading={loading} actions={inside} />,
  ListLayout: (loading) => (
    <ListLayout title="Quotes" loading={loading}>
      {inside}
    </ListLayout>
  ),
  DetailLayout: (loading) => (
    <DetailLayout title="Quotes" aside={<p>Aside</p>} loading={loading}>
      {inside}
    </DetailLayout>
  ),
  FormLayout: (loading) => (
    <FormLayout title="Quotes" loading={loading}>
      {inside}
    </FormLayout>
  ),
  ProseLayout: (loading) => (
    <ProseLayout title="Quotes" loading={loading}>
      {inside}
    </ProseLayout>
  ),
  SidebarLayout: (loading) => (
    <SidebarLayout aside={<p>Rail</p>} loading={loading}>
      {inside}
    </SidebarLayout>
  ),
  FullBleedLayout: (loading) => <FullBleedLayout loading={loading}>{inside}</FullBleedLayout>,
  CenteredLayout: (loading) => (
    <CenteredLayout title="Quotes" loading={loading}>
      {inside}
    </CenteredLayout>
  ),
  CardGrid: (loading) => <CardGrid loading={loading}>{inside}</CardGrid>,
};

describe("loading page layouts", () => {
  for (const [name, layout] of Object.entries(layouts)) {
    it(`${name}: owns the wait and passes it to the parts inside`, () => {
      render(layout(true));
      expect(screen.getByText("Revenue")).toBeTruthy();
      expect(bones().length).toBeGreaterThan(0);
      expect(busyRoots()).toHaveLength(1);
      expect(screen.getAllByText("Loading")).toHaveLength(1);
    });

    it(`${name}: draws no bone and no label with loading left out or false`, () => {
      const plain = render(layout());
      expect(bones()).toHaveLength(0);
      plain.unmount();
      render(layout(false));
      expect(bones()).toHaveLength(0);
      expect(busyRoots()).toHaveLength(0);
      expect(screen.queryByText("Loading")).toBeNull();
    });
  }

  it("a part inside a loading layout opts out with loading false", () => {
    render(
      <ProseLayout title={null} loading>
        <Text loading={false}>{null}</Text>
      </ProseLayout>,
    );
    // The empty title's one bone; the paragraph that opted out draws none.
    expect(bones()).toHaveLength(1);
  });

  it("an empty title in a loading header is a bone, the heading kept", () => {
    render(<PageHeader title={null} loading />);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(bones().length).toBeGreaterThan(0);
  });

  it("loadingLabel replaces the announcement", () => {
    render(
      <ListLayout title="Quotes" loading loadingLabel="Laai">
        {inside}
      </ListLayout>,
    );
    expect(screen.getByText("Laai")).toBeTruthy();
  });
});

describe("loading beats empty in a layout", () => {
  const nothing = <EmptyState title="Nothing yet" />;

  it("a loading ListLayout with no records draws a card of row bones, not empty", () => {
    render(<ListLayout title="Quotes" loading empty={nothing} />);
    expect(screen.queryByText("Nothing yet")).toBeNull();
    expect(bones().length).toBeGreaterThanOrEqual(3);
  });

  it("a loading CardGrid with no cards draws one card of bones per column", () => {
    const three = render(<CardGrid loading empty={nothing} />);
    expect(screen.queryByText("Nothing yet")).toBeNull();
    expect(bones()).toHaveLength(9);
    three.unmount();
    const two = render(<CardGrid loading columns={2} empty={nothing} />);
    expect(bones()).toHaveLength(6);
    two.unmount();
    render(<CardGrid loading as="ul" columns="auto" />);
    expect(bones()).toHaveLength(9);
    // Three cards and the owner's hidden label, each an item of the list.
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });
});
