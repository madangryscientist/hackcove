import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import * as ui from "./index.js";

// A component's own props (a size, a tone, a layout choice) configure it and stop there: none
// reaches the DOM as an attribute, where it would be invalid HTML and a React warning. One case
// per component and prop, beside noStyling.test.tsx, instead of a check in every component's file.
// The markup is read as data (its attribute names), so a server render is the right tool here.

const MENU: [ui.MenuAction] = [{ label: "Hide", onSelect: () => undefined }];

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
  CardGrid: [
    {
      prop: "as",
      node: () => (
        <ui.CardGrid as="ul">
          <p>x</p>
        </ui.CardGrid>
      ),
    },
  ],
  ClusterGrow: [{ prop: "minWidth", node: () => <ui.ClusterGrow minWidth="sm">x</ui.ClusterGrow> }],
  EmptyState: [
    { prop: "level", node: () => <ui.EmptyState title="T" level={3} /> },
    { prop: "padding", node: () => <ui.EmptyState title="T" padding="inset" /> },
  ],
  Field: [
    {
      prop: "layout",
      node: () => (
        <ui.Field label="Rank" htmlFor="rank" layout="row">
          <input id="rank" />
        </ui.Field>
      ),
    },
    {
      prop: "span",
      node: () => (
        <ui.Field label="Notes" htmlFor="n" span="full">
          <input id="n" />
        </ui.Field>
      ),
    },
  ],
  FileDrop: [{ prop: "size", node: () => <ui.FileDrop size="sm">Drop</ui.FileDrop> }],
  FullBleedLayout: [
    { prop: "padded", node: () => <ui.FullBleedLayout padded>x</ui.FullBleedLayout> },
  ],
  Input: [
    { prop: "prefix", node: () => <ui.Input prefix="R" aria-label="Amount" /> },
    { prop: "size", node: () => <ui.Input size="sm" /> },
    { prop: "width", node: () => <ui.Input width="xs" /> },
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
      node: () => <ui.ListRow selected>a</ui.ListRow>,
    },
    {
      prop: "static",
      node: () => (
        <ui.ListRow leading="L" trailing="admin" actions={<button type="button">Remove</button>}>
          Ada
        </ui.ListRow>
      ),
    },
    {
      prop: "revealOnHover",
      node: () => (
        <ui.ListRow revealOnHover actions="X">
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
      node: () => <ui.ListRow focused>a</ui.ListRow>,
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
  Menu: [
    { prop: "trigger", node: () => <ui.Menu label="More" trigger="button" items={MENU} /> },
    { prop: "size", node: () => <ui.Menu label="More" size="sm" items={MENU} /> },
    { prop: "defaultOpen", node: () => <ui.Menu label="More" defaultOpen items={MENU} /> },
  ],
  Stack: [
    { prop: "align", node: () => <ui.Stack align="start">x</ui.Stack> },
    { prop: "divided", node: () => <ui.Stack divided>x</ui.Stack> },
  ],
  Show: [
    { prop: "from", node: () => <ui.Show from="sm">x</ui.Show> },
    { prop: "below", node: () => <ui.Show below="lg">x</ui.Show> },
  ],
  SideColumn: [
    {
      prop: "sticky",
      node: () => (
        <ui.SideColumn sticky aside="a">
          x
        </ui.SideColumn>
      ),
    },
  ],
  SectionHeading: [
    { prop: "rule", node: () => <ui.SectionHeading rule>x</ui.SectionHeading> },
    {
      prop: "description",
      node: () => <ui.SectionHeading description="More">x</ui.SectionHeading>,
    },
  ],
  SubsectionHeading: [
    { prop: "truncate", node: () => <ui.SubsectionHeading truncate>x</ui.SubsectionHeading> },
    { prop: "size", node: () => <ui.SubsectionHeading size="lg">x</ui.SubsectionHeading> },
  ],
  Textarea: [{ prop: "mono", node: () => <ui.Textarea mono /> }],
  Text: [
    { prop: "lines", node: () => <ui.Text lines={2}>x</ui.Text> },
    { prop: "tone", node: () => <ui.Text tone="danger">x</ui.Text> },
    { prop: "numeric", node: () => <ui.Text numeric>1</ui.Text> },
    { prop: "mono", node: () => <ui.Text mono>x</ui.Text> },
    { prop: "align", node: () => <ui.Text align="end">x</ui.Text> },
    { prop: "strong", node: () => <ui.Text strong>x</ui.Text> },
    { prop: "preserveNewlines", node: () => <ui.Text preserveNewlines>{"a\nb"}</ui.Text> },
    { prop: "italic", node: () => <ui.Text italic>x</ui.Text> },
    { prop: "breakWords", node: () => <ui.Text breakWords>x</ui.Text> },
    { prop: "minWidth", node: () => <ui.Text minWidth="amount">1</ui.Text> },
  ],
  Caption: [
    { prop: "lines", node: () => <ui.Caption lines={3}>x</ui.Caption> },
    { prop: "tone", node: () => <ui.Caption tone="muted">x</ui.Caption> },
    { prop: "numeric", node: () => <ui.Caption numeric>1</ui.Caption> },
    { prop: "mono", node: () => <ui.Caption mono>x</ui.Caption> },
    { prop: "align", node: () => <ui.Caption align="center">x</ui.Caption> },
    { prop: "italic", node: () => <ui.Caption italic>x</ui.Caption> },
    { prop: "breakWords", node: () => <ui.Caption breakWords>x</ui.Caption> },
  ],
  Overline: [
    { prop: "tone", node: () => <ui.Overline tone="info">x</ui.Overline> },
    { prop: "numeric", node: () => <ui.Overline numeric>1</ui.Overline> },
    { prop: "mono", node: () => <ui.Overline mono>x</ui.Overline> },
    { prop: "align", node: () => <ui.Overline align="start">x</ui.Overline> },
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
