import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as ui from "./index.js";

// A component's own props (a size, a tone, a layout choice) configure it and stop there: none
// reaches the DOM as an attribute, where it would be invalid HTML and a React warning. One case
// per component and prop, beside noStyling.test.tsx, instead of a check in every component's file.
// The markup is read as data (its attribute names), so a server render is the right tool here.

type Case = { prop: string; node: () => ReactElement };

const CASES: Record<string, Case[]> = {
  Callout: [{ prop: "align", node: () => <ui.Callout align="center">x</ui.Callout> }],
  Card: [
    {
      prop: "fill",
      node: () => (
        <ui.Card title="Shops nearby" bar flush fill>
          body
        </ui.Card>
      ),
    },
    {
      prop: "icon",
      node: () => (
        <ui.Card title="Diff" icon="diff">
          body
        </ui.Card>
      ),
    },
    {
      prop: "icon",
      node: () => (
        <ui.Card href="/x" title="Diff" icon="diff">
          body
        </ui.Card>
      ),
    },
  ],
  ClusterGrow: [{ prop: "minWidth", node: () => <ui.ClusterGrow minWidth="sm">x</ui.ClusterGrow> }],
  EmptyState: [
    { prop: "level", node: () => <ui.EmptyState title="T" level={3} /> },
    { prop: "padding", node: () => <ui.EmptyState title="T" padding="inset" /> },
  ],
  ListRow: [
    {
      prop: "size",
      node: () => (
        <ui.ListRow size="sm" href="#x">
          a
        </ui.ListRow>
      ),
    },
    {
      prop: "divided",
      node: () => (
        <ui.ListRow divided href="#x">
          a
        </ui.ListRow>
      ),
    },
    { prop: "selected", node: () => <ui.ListRow selected>a</ui.ListRow> },
    {
      prop: "selected",
      node: () => (
        <ui.ListRow selected href="#a">
          a
        </ui.ListRow>
      ),
    },
    {
      prop: "selected",
      node: () => (
        <ui.ListRow selected static>
          a
        </ui.ListRow>
      ),
    },
    {
      prop: "static",
      node: () => (
        <ui.ListRow
          static
          leading="L"
          trailing="admin"
          actions={<button type="button">Remove</button>}
        >
          Ada
        </ui.ListRow>
      ),
    },
    {
      prop: "revealOnHover",
      node: () => (
        <ui.ListRow static revealOnHover actions="X">
          a
        </ui.ListRow>
      ),
    },
    { prop: "focused", node: () => <ui.ListRow focused>a</ui.ListRow> },
    {
      prop: "focused",
      node: () => (
        <ui.ListRow focused href="#a">
          a
        </ui.ListRow>
      ),
    },
    {
      prop: "focused",
      node: () => (
        <ui.ListRow focused static>
          a
        </ui.ListRow>
      ),
    },
    {
      prop: "leadingWidth",
      node: () => (
        <ui.ListRow leading={<img alt="" src="/s.png" />} leadingWidth="thumbnail">
          Shot
        </ui.ListRow>
      ),
    },
    { prop: "secondary", node: () => <ui.ListRow secondary="Due 1 Dec">Rent</ui.ListRow> },
  ],
};

/** Every attribute name on every element of `html`, lower-cased as the DOM reads them. */
function attributeNames(html: string): Set<string> {
  const names = new Set<string>();
  for (const [tag] of html.matchAll(/<[a-z][^>]*>/g)) {
    for (const [, name] of tag.matchAll(/\s([^\s=/>"]+)(?:="[^"]*")?/g))
      names.add(name?.toLowerCase() ?? "");
  }
  return names;
}

describe("a component's own props are not passed to the DOM", () => {
  for (const [component, cases] of Object.entries(CASES)) {
    for (const { prop, node } of cases) {
      it(`${component} keeps \`${prop}\` to itself`, () => {
        expect(attributeNames(renderToStaticMarkup(node()))).not.toContain(prop.toLowerCase());
      });
    }
  }

  it("reads the attribute names it checks", () => {
    expect(
      attributeNames('<div data-x="1 a=b" hidden><a class="p q" href="/x">y</a></div>'),
    ).toEqual(new Set(["data-x", "hidden", "class", "href"]));
  });
});
