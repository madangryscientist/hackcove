// @vitest-environment jsdom
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { ChatThread } from "./ChatThread.js";
import { EmptyState } from "./EmptyState.js";
import { CardGrid, ListLayout } from "./PageLayouts.js";
import { render, screen } from "./render.harness.js";
import { Stack } from "./Stack.js";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./Table.js";
import { Timeline, TimelineItem } from "./Timeline.js";

const nothing = <EmptyState title="Nothing yet" />;

/** Each part with an `empty` slot, holding `children`, with `empty` set or not. */
const parts: Record<string, (children: ReactNode, empty?: ReactNode) => ReactNode> = {
  ListLayout: (children, empty) => (
    <ListLayout title="Quotes" empty={empty}>
      {children}
    </ListLayout>
  ),
  Timeline: (children, empty) => (
    <Timeline label="History" empty={empty}>
      {children}
    </Timeline>
  ),
  ChatThread: (children, empty) => (
    <ChatThread label="Chat" empty={empty}>
      {children}
    </ChatThread>
  ),
  TableBody: (children, empty) => (
    <Table label="Quotes">
      <TableBody empty={empty}>{children}</TableBody>
    </Table>
  ),
  CardGrid: (children, empty) => <CardGrid empty={empty}>{children}</CardGrid>,
  "Stack ul": (children, empty) => (
    <Stack as="ul" empty={empty}>
      {children}
    </Stack>
  ),
  "Stack ol": (children, empty) => (
    <Stack as="ol" empty={empty}>
      {children}
    </Stack>
  ),
};

/** One child of the right kind for each part. */
const child: Record<string, ReactNode> = {
  ListLayout: <p>Q-1043</p>,
  Timeline: <TimelineItem title="Q-1043" time="today" />,
  ChatThread: <p>Q-1043</p>,
  TableBody: (
    <TableRow>
      <TableCell>Q-1043</TableCell>
    </TableRow>
  ),
  CardGrid: <p>Q-1043</p>,
  "Stack ul": <li>Q-1043</li>,
  "Stack ol": <li>Q-1043</li>,
};

describe("the empty slot", () => {
  for (const [name, part] of Object.entries(parts)) {
    it(`${name}: no children draws empty, a child draws the child, no empty draws neither`, () => {
      const first = render(part([], nothing));
      expect(screen.getByText("Nothing yet")).toBeTruthy();
      first.unmount();
      const falsy = render(part(false, nothing));
      expect(screen.getByText("Nothing yet")).toBeTruthy();
      falsy.unmount();
      const filled = render(part(child[name], nothing));
      expect(screen.getByText("Q-1043")).toBeTruthy();
      expect(screen.queryByText("Nothing yet")).toBeNull();
      filled.unmount();
      render(part([]));
      expect(screen.queryByText("Nothing yet")).toBeNull();
      expect(screen.queryByText("Q-1043")).toBeNull();
    });
  }

  it("sets the size: one line with no heading in a table, a timeline or a list", () => {
    for (const name of ["TableBody", "Timeline", "Stack ul"]) {
      const { unmount } = render(parts[name]?.([], nothing));
      expect(screen.queryByRole("heading", { name: "Nothing yet" })).toBeNull();
      expect(screen.queryByRole("region", { name: "Nothing yet" })).toBeNull();
      expect(screen.getByText("Nothing yet")).toBeTruthy();
      unmount();
    }
  });

  it("sets the size: a titled region on a page, in a grid of cards and in a chat", () => {
    for (const name of ["ListLayout", "CardGrid", "ChatThread"]) {
      const { unmount } = render(parts[name]?.([], nothing));
      expect(screen.getByRole("heading", { name: "Nothing yet" })).toBeTruthy();
      expect(screen.getByRole("region", { name: "Nothing yet" })).toBeTruthy();
      unmount();
    }
  });

  it("an explicit size wins over the slot's", () => {
    render(parts["TableBody"]?.([], <EmptyState size="md" title="Nothing yet" />));
    expect(screen.getByRole("heading", { name: "Nothing yet" })).toBeTruthy();
  });

  it("ListLayout keeps its filters beside the empty state", () => {
    render(<ListLayout title="Quotes" filters={<p>Status filter</p>} empty={nothing} />);
    expect(screen.getByText("Status filter")).toBeTruthy();
    expect(screen.getByText("Nothing yet")).toBeTruthy();
  });
});

const head = (cells: ReactNode): ReactNode => (
  <TableHead>
    <TableRow>{cells}</TableRow>
  </TableHead>
);

describe("TableBody empty", () => {
  it("spans every column the head declares, and the head stays", () => {
    render(
      <Table label="Quotes">
        {head(
          <>
            <TableHeaderCell>Quote</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell numeric>Total</TableHeaderCell>
          </>,
        )}
        <TableBody empty={nothing}>{[]}</TableBody>
      </Table>,
    );
    expect(screen.getByRole("cell", { name: "Nothing yet" }).getAttribute("colspan")).toBe("3");
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
  });

  it("counts a head cell's colSpan", () => {
    render(
      <Table label="Quotes">
        {head([
          <TableHeaderCell key="a" colSpan={2}>
            Quote
          </TableHeaderCell>,
          <TableHeaderCell key="b">Total</TableHeaderCell>,
        ])}
        <TableBody empty={nothing} />
      </Table>,
    );
    expect(screen.getByRole("cell", { name: "Nothing yet" }).getAttribute("colspan")).toBe("3");
  });

  it("spans one column with no head", () => {
    render(
      <Table label="Quotes">
        <TableBody empty={nothing} />
      </Table>,
    );
    expect(screen.getByRole("cell", { name: "Nothing yet" }).getAttribute("colspan")).toBe("1");
  });
});
