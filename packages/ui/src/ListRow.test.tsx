import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListRow } from "./ListRow.js";

describe("ListRow", () => {
  it("is a full-width button with a hover fill and the label and trailing content", () => {
    const out = renderToStaticMarkup(<ListRow trailing="R 4 250">Rent</ListRow>);
    expect(out).toContain('<button type="button"');
    expect(out).toContain("w-full");
    expect(out).toContain("hover:bg-slate-50");
    expect(out).toContain('<div class="min-w-0 flex-1">Rent</div>');
    expect(out).toContain(">R 4 250</span>");
    expect(out).not.toContain("aria-expanded");
    expect(out).not.toContain("<svg");
  });

  it("passes button props through, onClick aside", () => {
    const out = renderToStaticMarkup(
      <ListRow disabled aria-controls="rows">
        Rent
      </ListRow>,
    );
    expect(out).toContain("disabled");
    expect(out).toContain('aria-controls="rows"');
  });

  it("expanded makes a collapsible header: aria-expanded and a chevron that turns when open", () => {
    const closed = renderToStaticMarkup(<ListRow expanded={false}>Details</ListRow>);
    const open = renderToStaticMarkup(<ListRow expanded>Details</ListRow>);
    expect(closed).toContain('aria-expanded="false"');
    expect(open).toContain('aria-expanded="true"');
    expect(closed).toContain("<svg");
    expect(closed).not.toContain("rotate-90");
    expect(open).toContain("rotate-90");
  });

  it("is a link with href", () => {
    const out = renderToStaticMarkup(
      <ListRow href="/status" trailing="3">
        Status
      </ListRow>,
    );
    expect(out).toContain('<a href="/status"');
    expect(out).toContain("hover:bg-slate-50");
    expect(out).not.toContain("<button");
  });

  it("render draws the app's own link, handed the row's classes", () => {
    const out = renderToStaticMarkup(
      <ListRow render={(props) => <a data-router="1" href="/x" {...props} />}>Go</ListRow>,
    );
    expect(out).toContain('data-router="1"');
    expect(out).toContain("hover:bg-slate-50");
  });
});

describe("ListRow size", () => {
  it("sm is dense padding, md the default, on a button and a link alike", () => {
    expect(renderToStaticMarkup(<ListRow>a</ListRow>)).toContain("px-4 py-3");
    expect(renderToStaticMarkup(<ListRow size="sm">a</ListRow>)).toContain("px-3 py-2");
    const link = renderToStaticMarkup(
      <ListRow size="sm" href="#x">
        a
      </ListRow>,
    );
    expect(link).toContain("px-3 py-2");
    expect(link).not.toContain('size="sm"');
  });

  it("divided draws a hairline above the row, on a button and a link alike", () => {
    const line = "border-t border-slate-200/70";
    expect(renderToStaticMarkup(<ListRow divided>a</ListRow>)).toContain(line);
    expect(renderToStaticMarkup(<ListRow>a</ListRow>)).not.toContain("border-t");
    const link = renderToStaticMarkup(
      <ListRow divided href="#x">
        a
      </ListRow>,
    );
    expect(link).toContain(line);
    expect(link).not.toContain("divided");
  });
});

describe("ListRow leading and selected", () => {
  it("leading sits before the label, on a button and a link alike", () => {
    const button = renderToStaticMarkup(<ListRow leading={<i data-av />}>Ada</ListRow>);
    expect(button).toMatch(
      /<span class="shrink-0"><i data-av[^>]*><\/i><\/span><div class="min-w-0 flex-1">Ada/,
    );
    const link = renderToStaticMarkup(
      <ListRow href="#a" leading="L">
        Ada
      </ListRow>,
    );
    expect(link.indexOf(">L<")).toBeLessThan(link.indexOf(">Ada<"));
    expect(renderToStaticMarkup(<ListRow>Ada</ListRow>)).not.toContain('shrink-0"><');
  });

  it("selected fills the row violet and sets aria-current, on every form", () => {
    for (const out of [
      renderToStaticMarkup(<ListRow selected>a</ListRow>),
      renderToStaticMarkup(
        <ListRow selected href="#a">
          a
        </ListRow>,
      ),
      renderToStaticMarkup(
        <ListRow selected static>
          a
        </ListRow>,
      ),
    ]) {
      expect(out).toContain('aria-current="true"');
      expect(out).toContain("bg-violet-50");
      expect(out).not.toContain("hover:bg-slate-50");
      expect(out).not.toContain("selected");
    }
    const plain = renderToStaticMarkup(<ListRow>a</ListRow>);
    expect(plain).not.toContain("aria-current");
    expect(plain).not.toContain("bg-violet-50");
  });
});

describe("ListRow static", () => {
  it("is a div, not a button or a link, with no hover fill and no static attribute", () => {
    const out = renderToStaticMarkup(
      <ListRow static leading="L" trailing="admin" actions={<button type="button">Remove</button>}>
        Ada
      </ListRow>,
    );
    expect(out.startsWith("<div")).toBe(true);
    expect(out).not.toContain("<a ");
    expect(out).toContain("w-full");
    expect(out).not.toContain("hover:bg-slate-50");
    expect(out).not.toContain("static");
    expect(out.indexOf(">L<")).toBeLessThan(out.indexOf(">Ada<"));
    expect(out.indexOf(">Ada<")).toBeLessThan(out.indexOf(">admin<"));
    expect(out.indexOf(">admin<")).toBeLessThan(out.indexOf("Remove"));
  });

  it("actions are shown always, unless revealOnHover hides them until hover or focus", () => {
    const shown = renderToStaticMarkup(
      <ListRow static actions="X">
        a
      </ListRow>,
    );
    expect(shown).not.toContain("opacity-0");
    const hidden = renderToStaticMarkup(
      <ListRow static revealOnHover actions="X">
        a
      </ListRow>,
    );
    expect(hidden).toContain("opacity-0");
    expect(hidden).toContain("group-hover/row:opacity-100");
    expect(hidden).toContain("group-focus-within/row:opacity-100");
    expect(hidden).toContain("any-pointer-coarse:opacity-100");
    expect(hidden).toContain("group/row ");
    expect(hidden).toContain("hover:bg-slate-50");
    expect(hidden).not.toContain("revealOnHover");
  });

  it("takes size, divided, data-* and aria-*, and draws no empty slots", () => {
    const out = renderToStaticMarkup(
      <ListRow static size="sm" divided data-testid="row" aria-label="Ada">
        a
      </ListRow>,
    );
    expect(out).toContain("px-3 py-2");
    expect(out).toContain("border-t border-slate-200/70");
    expect(out).toContain('data-testid="row"');
    expect(out).toContain('aria-label="Ada"');
    expect(out).not.toContain("opacity");
    expect(out.match(/<span/g)).toBeNull();
    expect(out.match(/<div/g)).toHaveLength(2);
  });
});

describe("ListRow focused and leadingWidth", () => {
  it("focused draws an inset violet ring on every form, without a focused attribute", () => {
    const ring = "outline-2 -outline-offset-2 outline-violet-600";
    for (const out of [
      renderToStaticMarkup(<ListRow focused>a</ListRow>),
      renderToStaticMarkup(
        <ListRow focused href="#a">
          a
        </ListRow>,
      ),
      renderToStaticMarkup(
        <ListRow focused static>
          a
        </ListRow>,
      ),
    ]) {
      expect(out).toContain(ring);
      expect(out).not.toContain("focused");
    }
    expect(renderToStaticMarkup(<ListRow>a</ListRow>)).not.toContain("outline-2 -outline-offset-2");
  });

  it("focused is independent of selected: a row can be both", () => {
    const out = renderToStaticMarkup(
      <ListRow focused selected>
        a
      </ListRow>,
    );
    expect(out).toContain("outline-violet-600");
    expect(out).toContain("bg-violet-50");
  });

  it('leadingWidth="thumbnail" gives the leading slot a w-32 box that sizes an image to it', () => {
    const out = renderToStaticMarkup(
      <ListRow leading={<img alt="" src="/s.png" />} leadingWidth="thumbnail">
        Shot
      </ListRow>,
    );
    expect(out).toContain('<span class="shrink-0 block w-32 ');
    expect(out).toContain('w-full"><img');
    expect(out).not.toContain("leadingWidth");
    const plain = renderToStaticMarkup(<ListRow leading={<i />}>Shot</ListRow>);
    expect(plain).toContain('<span class="shrink-0"><i');
    expect(plain).not.toContain("w-32");
  });

  it("the label takes block children: it is a div, so a div or a paragraph inside is valid", () => {
    const out = renderToStaticMarkup(
      <ListRow static>
        <div>Title</div>
      </ListRow>,
    );
    expect(out).toContain('<div class="min-w-0 flex-1"><div>Title</div></div>');
  });
});

describe("ListRow active", () => {
  it("holds the hover look on every form; selected wins", () => {
    expect(renderToStaticMarkup(<ListRow active>Rent</ListRow>)).toContain("bg-slate-50");
    expect(
      renderToStaticMarkup(
        <ListRow href="/r" active>
          Rent
        </ListRow>,
      ),
    ).toMatch(/<div id="[^"]*" class="[^"]*\bbg-slate-50\b/);
    expect(
      renderToStaticMarkup(
        <ListRow static active>
          Rent
        </ListRow>,
      ),
    ).toContain("bg-slate-50");
    const both = renderToStaticMarkup(
      <ListRow active selected>
        Rent
      </ListRow>,
    );
    expect(both).toContain("bg-violet-50");
    expect(both).not.toMatch(/ bg-slate-50\b/);
  });

  it("a plain static row has no fill until active", () => {
    expect(renderToStaticMarkup(<ListRow static>Rent</ListRow>)).not.toContain("bg-slate-50");
  });

  it("shows actions that revealOnHover hides", () => {
    const hidden = renderToStaticMarkup(
      <ListRow static revealOnHover actions={<button type="button">Edit</button>}>
        Rent
      </ListRow>,
    );
    const shown = renderToStaticMarkup(
      <ListRow static revealOnHover active actions={<button type="button">Edit</button>}>
        Rent
      </ListRow>,
    );
    expect(hidden).toContain("opacity-0");
    expect(shown).not.toContain("opacity-0");
  });
});
