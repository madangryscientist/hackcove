import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Callout } from "./Callout.js";
import { Dialog } from "./Dialog.js";
import { Drawer } from "./Drawer.js";
import { EmptyState } from "./EmptyState.js";
import { Section } from "./Stack.js";
import { Prose, SectionHeading, SubsectionHeading, Text } from "./typography.js";

const render = renderToStaticMarkup;
const inProse = (node: React.ReactElement) => render(<Prose>{node}</Prose>);
const noop = () => {};

/** The classes of the first element with this tag. */
function classOf(html: string, tag: string): string {
  return new RegExp(`<${tag}[^>]* class="([^"]*)"`).exec(html)?.[1] ?? "";
}

describe("Prose", () => {
  it("is a div that sets the body size on its own box and passes data-* and aria-* through", () => {
    expect(
      render(
        <Prose data-testid="doc" aria-label="Guide">
          x
        </Prose>,
      ),
    ).toBe('<div data-testid="doc" aria-label="Guide" class="text-base/7">x</div>');
  });

  it("Text: text-sm/5 outside, text-base/7 inside", () => {
    expect(classOf(render(<Text>x</Text>), "span")).toContain("text-sm/5");
    const inside = classOf(inProse(<Text>x</Text>), "span");
    expect(inside).toContain("text-base/7");
    expect(inside).not.toContain("text-sm/5");
  });

  it("SectionHeading: text-base/6 outside, text-2xl/8 semibold tight inside", () => {
    expect(classOf(render(<SectionHeading>x</SectionHeading>), "h2")).toBe(
      "text-base/6 font-semibold text-slate-900",
    );
    expect(classOf(inProse(<SectionHeading>x</SectionHeading>), "h2")).toBe(
      "text-2xl/8 font-semibold tracking-tight text-slate-900",
    );
  });

  it("SectionHeading `rule` keeps its spacing inside, and its description is body text there", () => {
    const html = inProse(
      <SectionHeading rule description="More">
        x
      </SectionHeading>,
    );
    expect(html).toContain('class="flex flex-col gap-1 mb-4 border-b border-slate-200/70 pb-2"');
    expect(classOf(html, "h2")).toBe("text-2xl/8 font-semibold tracking-tight text-slate-900");
    expect(classOf(html.slice(html.indexOf("<p")), "p")).toContain("text-base/7");
  });

  it.each([
    ["sm", "text-sm/5 font-semibold", "text-base/7 font-semibold"],
    ["md", "text-base/6 font-semibold", "text-xl/7 font-semibold"],
    ["lg", "text-lg/7 font-semibold", "text-2xl/8 font-semibold tracking-tight"],
  ] as const)("SubsectionHeading %s: %s outside, %s inside", (size, app, prose) => {
    expect(classOf(render(<SubsectionHeading size={size}>x</SubsectionHeading>), "h3")).toBe(
      `${app} text-slate-900`,
    );
    expect(classOf(inProse(<SubsectionHeading size={size}>x</SubsectionHeading>), "h3")).toBe(
      `${prose} text-slate-900`,
    );
  });

  it("SubsectionHeading defaults to md", () => {
    expect(classOf(inProse(<SubsectionHeading>x</SubsectionHeading>), "h3")).toContain("text-xl/7");
  });

  it("Callout: text-sm outside, text-base/7 inside, boxed and banner, title unsized", () => {
    expect(classOf(render(<Callout>x</Callout>), "div")).toBe(
      "rounded-xl border p-4 text-sm border-blue-200 bg-blue-50 text-blue-800",
    );
    expect(classOf(render(<Callout banner>x</Callout>), "div")).toBe(
      "border-b px-5 py-3 text-sm border-blue-200 bg-blue-50 text-blue-800",
    );
    const boxed = inProse(<Callout title="Heads up">x</Callout>);
    expect(boxed).toContain('class="rounded-xl border p-4 text-base/7 ');
    expect(boxed).not.toContain("text-sm");
    expect(inProse(<Callout banner>x</Callout>)).toContain(
      'class="border-b px-5 py-3 text-base/7 ',
    );
    expect(boxed).toContain('<p class="font-semibold">Heads up</p>');
  });

  it("a Section `title` (the titled Stack) inside a Prose takes the prose h2 classes", () => {
    const html = inProse(<Section title="Install">x</Section>);
    expect(classOf(html, "h2")).toBe(
      "text-2xl/8 font-semibold tracking-tight scroll-mt-28 text-slate-900",
    );
    expect(classOf(render(<Section title="Install">x</Section>), "h2")).toBe(
      "text-base/6 font-semibold scroll-mt-28 text-slate-900",
    );
  });

  it("the nearest Prose wins, and a Prose in a Prose is just prose", () => {
    const html = inProse(
      <Prose>
        <SectionHeading>x</SectionHeading>
      </Prose>,
    );
    expect(classOf(html.slice(html.indexOf("<h2")), "h2")).toContain("text-2xl/8");
  });

  it("every other role keeps its size inside a Prose", async () => {
    const { Caption, Display, Lead, Overline, PageHeading } = await import("./typography.js");
    for (const node of [
      <Caption key="c">x</Caption>,
      <Display key="d">x</Display>,
      <Lead key="l">x</Lead>,
      <Overline key="o">x</Overline>,
      <PageHeading key="p">x</PageHeading>,
    ]) {
      expect(inProse(node)).toBe(`<div class="text-base/7">${render(node)}</div>`);
    }
  });
});

describe("Prose stops at Dialog, Drawer and EmptyState", () => {
  const body = (
    <>
      <SectionHeading>Inside</SectionHeading>
      <SubsectionHeading>Sub</SubsectionHeading>
      <Text>Text</Text>
      <Callout>Note</Callout>
    </>
  );

  it("a Dialog inside a Prose renders exactly what it renders outside one", () => {
    const dialog = (
      <Dialog title="Title" description="Described" onClose={noop} footer={<span>f</span>}>
        {body}
      </Dialog>
    );
    expect(inProse(dialog)).toBe(`<div class="text-base/7">${render(dialog)}</div>`);
    expect(render(dialog)).not.toContain("text-2xl/8");
  });

  it("a Drawer inside a Prose renders exactly what it renders outside one", () => {
    const drawer = (
      <Drawer title="Title" onClose={noop} footer={<span>f</span>}>
        {body}
      </Drawer>
    );
    expect(inProse(drawer)).toBe(`<div class="text-base/7">${render(drawer)}</div>`);
    expect(render(drawer)).not.toContain("text-2xl/8");
  });

  it("an EmptyState inside a Prose renders exactly what it renders outside one", () => {
    const empty = <EmptyState title="Nothing yet">{body}</EmptyState>;
    expect(inProse(empty)).toBe(`<div class="text-base/7">${render(empty)}</div>`);
    expect(render(empty)).not.toContain("text-2xl/8");
  });

  it("content after them in the same Prose is still prose", () => {
    const html = inProse(
      <>
        <EmptyState title="Nothing yet" />
        <SectionHeading>After</SectionHeading>
      </>,
    );
    expect(html.slice(html.lastIndexOf("<h2"))).toContain("text-2xl/8");
  });
});
