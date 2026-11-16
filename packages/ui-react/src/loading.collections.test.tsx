// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar.js";
import { AvatarStack } from "./AvatarStack.js";
import { Card } from "./Card.js";
import { EmptyState } from "./EmptyState.js";
import { Image } from "./Image.js";
import { ListRow } from "./ListRow.js";
import { MediaTile } from "./MediaTile.js";
import { ProgressBar } from "./ProgressBar.js";
import { render, screen } from "./render.harness.js";
import { LoadingScope } from "./skeleton.js";
import { SplitBar } from "./SplitBar.js";
import { Legend, StackedBar } from "./StackedBar.js";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./Table.js";
import { Timeline, TimelineItem } from "./Timeline.js";
import { TrendChart } from "./TrendChart.js";

/** The bones drawn in `root`: every one hidden from assistive tech. */
function bones(root: ParentNode = document.body): Element[] {
  const found = [...root.querySelectorAll("[data-skeleton]")];
  for (const bone of found) expect(bone.closest("[aria-hidden='true']")).not.toBeNull();
  return found;
}

const busyRoots = (): Element[] => [...document.querySelectorAll("[aria-busy='true']")];

/** Each part with an empty slot, and with that slot filled by "Q-1043". */
const parts: Record<string, (filled: boolean, loading?: boolean) => ReactNode> = {
  Card: (filled, loading) => <Card loading={loading}>{filled && "Q-1043"}</Card>,
  "Card flush": (filled, loading) => (
    <Card flush loading={loading}>
      {filled && "Q-1043"}
    </Card>
  ),
  ListRow: (filled, loading) => <ListRow loading={loading}>{filled && "Q-1043"}</ListRow>,
  TableCell: (filled, loading) => (
    <Table label="Quotes">
      <TableBody>
        <TableRow>
          <TableCell loading={loading}>{filled && "Q-1043"}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  Timeline: (filled, loading) => (
    <Timeline label="History" loading={loading}>
      {filled && <TimelineItem title="Q-1043" />}
    </Timeline>
  ),
  TimelineItem: (filled, loading) => (
    <Timeline label="History">
      <TimelineItem loading={loading} title={filled && "Q-1043"} />
    </Timeline>
  ),
  Avatar: (filled, loading) => <Avatar loading={loading} name={filled ? "Q-1043" : ""} />,
  AvatarStack: (filled, loading) => (
    <AvatarStack loading={loading} items={filled ? [{ name: "Q-1043" }] : []} />
  ),
  Legend: (filled, loading) => (
    <Legend loading={loading} items={filled ? [{ label: "Q-1043", tone: "accent" }] : []} />
  ),
};

describe("loading collections and media", () => {
  for (const [name, part] of Object.entries(parts)) {
    it(`${name}: a filled slot keeps its text, an empty one is bones, the owner busy with one label`, () => {
      const filled = render(part(true, true));
      expect(screen.getAllByText(/^Q-?1(043)?$/).length).toBeGreaterThan(0);
      filled.unmount();
      render(part(false, true));
      expect(bones().length).toBeGreaterThan(0);
      expect(screen.queryByText("Q-1043")).toBeNull();
      expect(busyRoots()).toHaveLength(1);
      expect(screen.getAllByText("Loading")).toHaveLength(1);
    });

    it(`${name}: draws as today with loading false, and inherits a loading ancestor`, () => {
      const plain = render(part(false));
      const before = plain.container.innerHTML;
      plain.unmount();
      const off = render(<LoadingScope loading>{part(false, false)}</LoadingScope>);
      expect(off.container.innerHTML).toBe(before);
      expect(bones()).toHaveLength(0);
      off.unmount();
      render(<LoadingScope loading>{part(false)}</LoadingScope>);
      expect(bones().length).toBeGreaterThan(0);
      expect(busyRoots()).toHaveLength(0);
      expect(screen.queryByText("Loading")).toBeNull();
    });
  }

  it("loadingLabel replaces the announcement", () => {
    render(
      <Card loading loadingLabel="Laai">
        {null}
      </Card>,
    );
    expect(screen.getByText("Laai")).toBeTruthy();
    expect(screen.queryByText("Loading")).toBeNull();
  });
});

describe("loading containers draw a fixed set", () => {
  it("an empty loading Table has five body rows, one cell per header cell, and keeps its name", () => {
    render(
      <Table label="Quotes" loading>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Quote</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell numeric>Total</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody empty={<EmptyState title="Nothing yet" />} />
      </Table>,
    );
    const table = screen.getByRole("table", { name: "Quotes" });
    expect(table.getAttribute("aria-busy")).toBe("true");
    const rows = table.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(5);
    for (const row of rows) expect(row.querySelectorAll("td")).toHaveLength(3);
    expect(screen.queryByText("Nothing yet")).toBeNull();
    expect(screen.getAllByText("Loading")).toHaveLength(1);
  });

  it("a Table with rows draws them, loading or not", () => {
    render(
      <Table label="Quotes" loading>
        <TableBody>
          <TableRow>
            <TableCell>Q-1043</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("cell", { name: "Q-1043" })).toBeTruthy();
    expect(bones()).toHaveLength(0);
  });

  it("a loading Timeline is three items of bones, never its empty state", () => {
    render(<Timeline label="History" loading empty={<EmptyState title="Nothing yet" />} />);
    const list = screen.getByRole("list", { name: "History" });
    expect(list.querySelectorAll("li[aria-hidden], li:not(.sr-only)")).toHaveLength(3);
    expect(screen.queryByText("Nothing yet")).toBeNull();
  });

  it("a Card is three lines, a flush Card three ListRow bones, an AvatarStack three avatars", () => {
    const card = render(<Card loading>{null}</Card>);
    expect(bones()).toHaveLength(3);
    card.unmount();
    const flush = render(
      <Card flush loading>
        {null}
      </Card>,
    );
    expect(bones()).toHaveLength(3);
    flush.unmount();
    render(<AvatarStack loading items={[]} />);
    expect(bones()).toHaveLength(3);
  });
});

describe("parts whose value is a number are all bone while loading", () => {
  const figures: Record<string, ReactNode> = {
    ProgressBar: <ProgressBar loading value={40} label="Upload" />,
    SplitBar: <SplitBar loading a={1} b={2} label="Pot split" />,
    StackedBar: (
      <StackedBar loading items={[{ label: "Open", value: 3, tone: "warn" }]} label="Tickets" />
    ),
    TrendChart: (
      <TrendChart
        loading
        label="Tickets"
        buckets={["W1", "W2"]}
        series={[{ label: "Opened", tone: "warn", values: [3, 4] }]}
      />
    ),
  };

  for (const [name, figure] of Object.entries(figures)) {
    it(`${name}: no figure is drawn or spoken, the owner busy with one label`, () => {
      render(figure);
      expect(bones().length).toBeGreaterThan(0);
      expect(document.querySelector("[aria-valuenow]")).toBeNull();
      expect(screen.queryByText(/40|33|67|%/)).toBeNull();
      expect(busyRoots()).toHaveLength(1);
      expect(screen.getAllByText("Loading")).toHaveLength(1);
    });
  }

  it("a waiting bar keeps its role and its name, with no figure", () => {
    const progress = render(<ProgressBar loading value={40} label="Upload" />);
    expect(
      screen.getByRole("progressbar", { name: "Upload" }).getAttribute("aria-valuenow"),
    ).toBeNull();
    progress.unmount();
    const split = render(<SplitBar loading a={1} b={2} label="Pot split" />);
    expect(screen.getByRole("img", { name: "Pot split" })).toBeTruthy();
    split.unmount();
    render(
      <StackedBar loading items={[{ label: "Open", value: 3, tone: "warn" }]} label="Tickets" />,
    );
    expect(screen.getByRole("img", { name: "Tickets" })).toBeTruthy();
  });

  it("a loading TrendChart keeps its frame, bucket names and name", () => {
    render(
      <TrendChart
        loading
        label="Tickets"
        buckets={["W1", "W2"]}
        series={[
          { label: "Opened", tone: "warn", values: [] },
          { label: "Closed", tone: "info", values: [] },
        ]}
      />,
    );
    expect(screen.getByRole("figure", { name: "Tickets" })).toBeTruthy();
    expect(screen.getByText("W1")).toBeTruthy();
    expect(screen.getByText("Closed")).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("pictures while loading", () => {
  it("an Image with no src is a bone, not the placeholder, and keeps its name", () => {
    render(<Image loading alt="The shop front" />);
    expect(bones()).toHaveLength(1);
    expect(screen.getByRole("img", { name: "The shop front" })).toBeTruthy();
    expect(document.querySelector("svg")).toBeNull();
  });

  it("an Image with a src draws it", () => {
    render(<Image loading src="/shop.jpg" alt="The shop front" />);
    expect(screen.getByRole("img", { name: "The shop front" })).toBeTruthy();
    expect(bones()).toHaveLength(0);
  });

  it("a MediaTile owns the wait and its picture is a bone", () => {
    render(<MediaTile loading alt="The shop front" caption="Today" />);
    expect(bones()).toHaveLength(1);
    expect(screen.getByText("Today")).toBeTruthy();
    expect(busyRoots()).toHaveLength(1);
    expect(screen.getAllByText("Loading")).toHaveLength(1);
  });
});
