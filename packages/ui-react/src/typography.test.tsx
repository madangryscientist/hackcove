// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { follows, render, screen } from "./render.harness.js";
import {
  Caption,
  Overline,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
  Text,
} from "./typography.js";

// How each role looks (its size, weight, ink, tone, face, alignment and spacing) is the visual
// check's. These tests hold what a reader or a screen reader meets: the element each role is, the
// props it hands to the DOM, and the full text a clamped run keeps as its title. The props a role
// keeps to itself are noLeak.test.tsx's.

describe("typography", () => {
  it("PageHeading is the page's h1", () => {
    render(<PageHeading>Status</PageHeading>);
    expect(screen.getByRole("heading", { level: 1, name: "Status" })).toBeTruthy();
  });

  it("forwards element props, so a heading with an id is a link target", () => {
    render(<SectionHeading id="s1">Plan</SectionHeading>);
    expect(screen.getByRole("heading", { level: 2, name: "Plan" }).getAttribute("id")).toBe("s1");
  });

  it("SubsectionHeading `truncate` keeps the full text as its title, and no title without it", () => {
    render(
      <>
        <SubsectionHeading truncate>A very long section title</SubsectionHeading>
        <SubsectionHeading>Short</SubsectionHeading>
      </>,
    );
    expect(
      screen
        .getByRole("heading", { level: 3, name: "A very long section title" })
        .getAttribute("title"),
    ).toBe("A very long section title");
    expect(screen.getByRole("heading", { level: 3, name: "Short" }).hasAttribute("title")).toBe(
      false,
    );
  });
});

describe("typography `lines`", () => {
  it.each([
    ["Text", Text],
    ["Caption", Caption],
  ] as const)(
    "%s `lines` keeps the full plain text as the title, at every count",
    (_name, Role) => {
      render(
        <>
          <Role lines={1}>One.txt</Role>
          <Role lines={2}>Two.txt</Role>
          <Role lines={3}>Three.txt</Role>
          <Role lines={4}>Four.txt</Role>
          <Role>Plain.txt</Role>
        </>,
      );
      for (const name of ["One.txt", "Two.txt", "Three.txt", "Four.txt"])
        expect(screen.getByText(name).getAttribute("title")).toBe(name);
      expect(screen.getByText("Plain.txt").hasAttribute("title")).toBe(false);
    },
  );

  it("keeps a title the caller passed", () => {
    render(
      <Caption lines={2} title="Own title">
        text
      </Caption>,
    );
    expect(screen.getByText("text").getAttribute("title")).toBe("Own title");
  });

  it("adds no title for non-text children", () => {
    render(
      <Text lines={2}>
        <b>bold</b>
      </Text>,
    );
    expect(screen.getByRole("paragraph").hasAttribute("title")).toBe(false);
  });

  it("keeps the newlines of preserveNewlines text in the title", () => {
    render(
      <Text preserveNewlines lines={4}>
        {"a\nb"}
      </Text>,
    );
    // Testing Library folds the newline to a space when it matches the text; the title keeps it.
    expect(screen.getByText("a b").getAttribute("title")).toBe("a\nb");
  });

  it("is typed 1 to 4, on Text and Caption only", () => {
    // @ts-expect-error a clamp stops at 4 lines
    void (() => <Text lines={5}>x</Text>);
    // @ts-expect-error truncate is gone: lines={1}
    void (() => <Text truncate>x</Text>);
    // @ts-expect-error an Overline is a short label: no clamp
    void (() => <Overline lines={1}>x</Overline>);
    expectTypeOf<ComponentProps<typeof Caption>["lines"]>().toEqualTypeOf<
      1 | 2 | 3 | 4 | undefined
    >();
  });
});

describe("typography `as`", () => {
  it("draws the element `as` names, with the role's other props", () => {
    render(
      <ul>
        <Text as="li" tone="positive" preserveNewlines mono>
          Saved.
        </Text>
      </ul>,
    );
    expect(screen.getByRole("listitem").textContent).toBe("Saved.");
  });
});

describe("SectionHeading description", () => {
  it("reads the description after the heading, outside its name", () => {
    render(
      <SectionHeading id="s1" description="What you owe each month.">
        Plan
      </SectionHeading>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Plan" });
    expect(heading.getAttribute("id")).toBe("s1");
    expect(follows(heading, screen.getByText("What you owe each month."))).toBe(true);
  });

  it("is the bare heading without a description", () => {
    render(<SectionHeading description={false}>Plan</SectionHeading>);
    expect(screen.getByRole("heading", { level: 2, name: "Plan" })).toBeTruthy();
    expect(screen.queryByRole("paragraph")).toBeNull();
  });
});
