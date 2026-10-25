import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { LinkRenderProps } from "./link.js";
import { SegmentedControl } from "./SegmentedControl.js";
import { Tabs } from "./Tabs.js";

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.
const Link = ({ to, ...rest }: { to: string } & LinkRenderProps): ReactElement => (
  <a data-to={to} {...rest} />
);

describe("data-* on an item", () => {
  it("goes on the button of a Tabs and a SegmentedControl option, and nothing else is passed", () => {
    for (const Component of [Tabs, SegmentedControl]) {
      const out = renderToStaticMarkup(
        <Component
          label="Range"
          value="day"
          onChange={() => {}}
          items={[
            { value: "day", label: "Daily", "data-testid": "range-day" },
            { value: "week", label: "Weekly" },
          ]}
        />,
      );
      expect(out).toMatch(/<button[^>]*data-testid="range-day"/);
      expect(out.match(/data-testid/g)).toHaveLength(1);
    }
  });

  it("goes on a link item, and reaches a router's render", () => {
    const plain = renderToStaticMarkup(
      <Tabs
        label="Sections"
        value="a"
        items={[{ value: "a", label: "A", href: "#a", "data-testid": "tab-a" }]}
      />,
    );
    expect(plain).toMatch(/<a[^>]*data-testid="tab-a"/);
    const routed = renderToStaticMarkup(
      <SegmentedControl
        label="Sections"
        value="a"
        items={[
          {
            value: "a",
            label: "A",
            "data-testid": "seg-a",
            render: (props) => <Link to="/a" {...props} />,
          },
        ]}
      />,
    );
    expect(routed).toMatch(/<a[^>]*data-testid="seg-a"/);
  });

  it("is only data-*: an item has no className", () => {
    const out = renderToStaticMarkup(
      <Tabs
        label="Sections"
        value="a"
        onChange={() => {}}
        items={[
          // @ts-expect-error no styling escape hatch
          { value: "a", label: "A", className: "item-class" },
        ]}
      />,
    );
    expect(out).not.toContain("item-class");
  });
});
