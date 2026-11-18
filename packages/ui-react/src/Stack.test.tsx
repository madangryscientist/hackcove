// @vitest-environment jsdom
import { queryByAttribute } from "@testing-library/dom";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { render, screen, user, within } from "./render.harness.js";
import { Section } from "./Section.js";
import { Stack } from "./Stack.js";

describe("Stack as", () => {
  it("renders a form that passes its form props through", () => {
    render(
      <Stack as="form" action="/save" method="post" noValidate aria-label="Save">
        x
      </Stack>,
    );
    const form = screen.getByRole<HTMLFormElement>("form", { name: "Save" });
    expect(form.getAttribute("action")).toBe("/save");
    expect(form.method).toBe("post");
    expect(form.noValidate).toBe(true);
  });

  it("a form calls its onSubmit", async () => {
    const onSubmit = vi.fn<(event: { preventDefault: () => void }) => void>((event) =>
      event.preventDefault(),
    );
    render(
      <Stack as="form" onSubmit={onSubmit} aria-label="Save">
        <button type="submit">Save</button>
      </Stack>,
    );
    await user().click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it.each(["ul", "ol"] as const)("renders a %s whose children are its items, unwrapped", (as) => {
    render(
      <Stack as={as} gap="sm" aria-label="Items">
        <li>a</li>
        <li>b</li>
      </Stack>,
    );
    const items = within(screen.getByRole("list", { name: "Items" })).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["a", "b"]);
  });

  it("keeps the element with rowFrom", () => {
    render(
      <Stack rowFrom="md" gap="lg" width="wide" as="ul" aria-label="Items">
        <li>x</li>
      </Stack>,
    );
    expect(screen.getByRole("list", { name: "Items" })).not.toBeNull();
  });

  it("is a closed set of elements", () => {
    type P = Parameters<typeof Stack>[0];
    expectTypeOf<NonNullable<P["as"]>>().toEqualTypeOf<"div" | "section" | "form" | "ul" | "ol">();
  });
});

describe("Stack divided, align and width", () => {
  it("types divided apart from gap and rowFrom, and takes compact and start", () => {
    // @ts-expect-error a divided Stack has no gap: its rows touch
    expect(render(<Stack divided gap="sm" />)).toBeTruthy();
    // @ts-expect-error a divided Stack is a column
    expect(render(<Stack divided rowFrom="md" />)).toBeTruthy();
    // @ts-expect-error align is stretch or start
    expect(render(<Stack align="center" />)).toBeTruthy();
    expect(render(<Stack width="compact" align="start" />)).toBeTruthy();
    expect(render(<Section width="compact" title="Hours" />)).toBeTruthy();
  });
});

describe("Section", () => {
  it("is a region named by its level-2 heading, with actions beside it", () => {
    render(
      <Section title="Recent" actions={<button type="button">All</button>}>
        body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Recent" });
    expect(within(region).getByRole("heading", { level: 2, name: "Recent" })).not.toBeNull();
    expect(within(region).getByRole("button", { name: "All" })).not.toBeNull();
    expect(within(region).getByText("body")).not.toBeNull();
  });

  it("has no heading and no name without a title", () => {
    render(<Section>body</Section>);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.getByText("body")).not.toBeNull();
  });

  it("keeps a consumer's aria-labelledby when it has no title of its own", () => {
    render(
      <>
        <h3 id="h">Mine</h3>
        <Section aria-labelledby="h">body</Section>
      </>,
    );
    expect(within(screen.getByRole("region", { name: "Mine" })).getByText("body")).not.toBeNull();
  });

  it("an `id` puts the anchor on the heading, and the section is named by it", () => {
    render(
      <Section id="usage" title="Usage">
        body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Usage" });
    expect(within(region).getByRole("heading", { name: "Usage" }).id).toBe("usage");
    expect(region.id).toBe("");
  });

  it("an `id` with no title puts nothing anywhere", () => {
    render(<Section id="usage">body</Section>);
    // The id is a link target, read as data: with no heading to carry it, no element has it.
    expect(queryByAttribute("id", document.body, "usage")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
  });
});

describe('Section size="sm"', () => {
  it("is a region named by its title, a heading at the level md uses", () => {
    render(
      <Section size="sm" title="Flaky">
        body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Flaky" });
    expect(within(region).getByRole("heading", { level: 2, name: "Flaky" })).not.toBeNull();
  });

  it("puts an id on its heading, so #id is a link target", () => {
    render(
      <Section size="sm" id="ignore-areas" title="Ignore areas">
        body
      </Section>,
    );
    expect(screen.getByRole("heading", { name: "Ignore areas" }).id).toBe("ignore-areas");
  });

  it("puts actions inside the region, after the heading", () => {
    render(
      <Section size="sm" title="Flaky" actions={<button type="button">Rerun</button>}>
        body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Flaky" });
    const heading = within(region).getByRole("heading", { name: "Flaky" });
    const action = within(region).getByRole("button", { name: "Rerun" });
    expect(heading.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("nests one level below a Section that holds it", () => {
    render(
      <Section title="Build 412">
        <Section size="sm" title="Flaky">
          body
        </Section>
      </Section>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Flaky" })).not.toBeNull();
  });
});

describe("Section overline, description and size lg", () => {
  it("is named by its title only, with the overline in the same header as the heading", () => {
    render(
      <Section overline="Feature" title="Every theme" description="One switch reskins it.">
        body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Every theme" });
    const heading = within(region).getByRole("heading", { level: 2, name: "Every theme" });
    // Testing Library reads a <header> as a banner, inside a section too.
    const header = within(region).getByRole("banner");
    expect(within(header).getByRole("heading", { level: 2 })).toBe(heading);
    expect(within(header).getByText("Feature")).toBeTruthy();
    expect(within(heading).queryByText("One switch reskins it.")).toBeNull();
  });

  it('size="lg" is an h2 title named by it, the description a paragraph, then the actions', () => {
    render(
      <Section
        size="lg"
        overline="Fit"
        title="Built for agents"
        description="A site from props alone."
        actions={<a href="/ui/">Read the docs</a>}
      >
        body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Built for agents" });
    expect(
      within(region).getByRole("heading", { level: 2, name: "Built for agents" }),
    ).not.toBeNull();
    const description = within(region).getByText("A site from props alone.");
    expect(description.tagName).toBe("P");
    const action = within(region).getByRole("link", { name: "Read the docs" });
    expect(
      description.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("an overline with no title renders nothing", () => {
    render(<Section overline="Feature">body</Section>);
    expect(screen.queryByText("Feature")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("keeps the overline and description off size sm, and the rule off size lg", () => {
    type P = Parameters<typeof Section>[0];
    // @ts-expect-error a small section has no overline
    const small: P = { size: "sm", title: "Flaky", overline: "x" };
    // @ts-expect-error a landing section has no rule
    const large: P = { size: "lg", title: "Fit", rule: true };
    expect([small, large]).toHaveLength(2);
  });
});
