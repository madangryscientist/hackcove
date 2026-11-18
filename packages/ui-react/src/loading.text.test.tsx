// @vitest-environment jsdom
import { isInaccessible, queryAllByAttribute } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge.js";
import { KeyValue, KeyValueList } from "./KeyValueList.js";
import { Markdown } from "./Markdown.js";
import { MetaList } from "./MetaList.js";
import { Pill } from "./Pill.js";
import { render, screen, within } from "./render.harness.js";
import { StatTile } from "./StatTile.js";
import {
  Caption,
  Display,
  Lead,
  Overline,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
  Text,
} from "./typography.js";

/** The bones on the page, by the marker each one renders: every one hidden from assistive tech. */
function bones(): HTMLElement[] {
  const found = queryAllByAttribute("data-skeleton", document.body, "");
  for (const bone of found) expect(isInaccessible(bone)).toBe(true);
  return found;
}

/** The elements that say they are busy, with any value. */
const busy = (): HTMLElement[] => queryAllByAttribute("aria-busy", document.body, () => true);

describe("loading text roles", () => {
  const roles = {
    Text,
    Lead,
    Caption,
    Overline,
    Display,
    PageHeading,
    SectionHeading,
    SubsectionHeading,
  };

  for (const [name, Role] of Object.entries(roles)) {
    it(`${name}: a filled slot keeps its text, an empty one is bones`, () => {
      const { unmount } = render(<Role loading>Quarterly revenue</Role>);
      expect(screen.getByText("Quarterly revenue")).toBeTruthy();
      unmount();
      render(<Role loading>{undefined}</Role>);
      expect(bones().length).toBeGreaterThan(0);
      expect(screen.queryByText("Quarterly revenue")).toBeNull();
    });
  }

  it("draws nothing extra with loading false", () => {
    render(<Text loading={false}>Hello</Text>);
    expect(bones()).toHaveLength(0);
    expect(screen.queryByText("Loading")).toBeNull();
    expect(busy()).toHaveLength(0);
  });

  it("a heading keeps its role while loading, the owner busy with one label", () => {
    render(<PageHeading loading>{null}</PageHeading>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.getAttribute("aria-busy")).toBe("true");
    expect(screen.getAllByText("Loading")).toHaveLength(1);
  });

  it("a paragraph is three lines of bones, an inline run one", () => {
    const { unmount } = render(<Text loading>{null}</Text>);
    expect(bones()).toHaveLength(3);
    unmount();
    render(
      <Text as="span" loading>
        {null}
      </Text>,
    );
    expect(bones()).toHaveLength(1);
  });

  it("loadingLabel replaces the announcement", () => {
    render(
      <Text loading loadingLabel="Laai">
        {null}
      </Text>,
    );
    expect(screen.getByText("Laai")).toBeTruthy();
    expect(screen.queryByText("Loading")).toBeNull();
  });
});

describe("loading figures", () => {
  it("StatTile keeps its caption and draws a bone for the figure", () => {
    render(<StatTile loading label="Revenue" value={undefined} />);
    expect(screen.getByText("Revenue")).toBeTruthy();
    expect(bones()).toHaveLength(1);
    expect(screen.getByText("Loading")).toBeTruthy();
  });

  it("StatTile with its value draws it", () => {
    render(<StatTile loading label="Revenue" value="R 12 400" />);
    expect(screen.getByText("R 12 400")).toBeTruthy();
    expect(bones()).toHaveLength(0);
  });

  it("a loading KeyValueList holds only groups of dt and dd, its hidden label in a dd", () => {
    render(<KeyValueList loading />);
    // Three rows of a term and its definition, and one more definition that holds the label.
    expect(screen.getAllByRole("term")).toHaveLength(3);
    const definitions = screen.getAllByRole("definition");
    expect(definitions).toHaveLength(4);
    expect(definitions.filter((dd) => within(dd).queryByText("Loading") !== null)).toHaveLength(1);
  });

  it("an empty KeyValueList draws three rows of bones, busy with one label", () => {
    render(<KeyValueList loading />);
    expect(queryAllByAttribute("aria-busy", document.body, "true")).toHaveLength(1);
    expect(bones()).toHaveLength(6);
    expect(screen.getAllByText("Loading")).toHaveLength(1);
  });

  it("a KeyValue inherits the list's loading: no busy, no label of its own", () => {
    render(
      <KeyValueList loading>
        <KeyValue label="Subtotal">{undefined}</KeyValue>
        <KeyValue label="VAT" loading={false}>
          R 15
        </KeyValue>
      </KeyValueList>,
    );
    expect(screen.getByText("Subtotal")).toBeTruthy();
    expect(screen.getByText("R 15")).toBeTruthy();
    expect(bones()).toHaveLength(1);
    expect(busy()).toHaveLength(1);
    expect(screen.getAllByText("Loading")).toHaveLength(1);
  });

  it("Badge is all bone while loading, since 0 is a count", () => {
    render(<Badge loading count={0} />);
    expect(screen.queryByText("0")).toBeNull();
    expect(bones()).toHaveLength(1);
  });

  it("Pill with no text yet is one bone; with text, the text", () => {
    const { unmount } = render(<Pill loading>{undefined}</Pill>);
    expect(bones()).toHaveLength(1);
    unmount();
    render(<Pill loading>Paid</Pill>);
    expect(screen.getByText("Paid")).toBeTruthy();
  });

  it("MetaList with no items draws three bones; its items inherit", () => {
    const { unmount } = render(<MetaList loading>{[]}</MetaList>);
    expect(bones()).toHaveLength(3);
    expect(screen.getByRole("list").getAttribute("aria-busy")).toBe("true");
    unmount();
    render(
      <MetaList loading>
        <Text as="span">{null}</Text>
        main
      </MetaList>,
    );
    expect(screen.getByText("main")).toBeTruthy();
    expect(bones()).toHaveLength(1);
    expect(screen.getAllByText("Loading")).toHaveLength(1);
  });

  it("Markdown with no source yet is a paragraph of bones", () => {
    render(<Markdown loading md={undefined} />);
    expect(bones()).toHaveLength(3);
    expect(screen.getByText("Loading")).toBeTruthy();
  });
});
