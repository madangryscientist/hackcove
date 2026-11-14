import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Contact } from "../src/components/Contact";
import { Logo } from "../src/components/Logo";
import { PixelSlashHero, PixelSlashPage } from "../src/components/PixelSlashPage";
import { ProductCards } from "../src/components/ProductCards";
import { SiteNav } from "../src/components/SiteNav";
import { Team } from "../src/components/Team";
import { UiPage } from "../src/components/UiPage";
import { componentPages, componentSections } from "../src/content/components/index";
import { type Person, sectionOf, site } from "../src/content/site";
import { themeFiles } from "@hackcove/themes-shared/files";
import { themes } from "../src/content/themes";

/* The point of these tests is that the words and the people survive rendering as
   REAL HTML — the reason the site is Astro-with-islands rather than an SPA. They
   render the same components the pages render, server-side, with no browser. */

describe("content", () => {
  test("the copy is present and is Jacobus's words", () => {
    expect(site.tagline).toBe("Hack Cove builds software for small businesses.");
    expect(site.intro).toBe("We design and engineer, focusing on prototyping.");
    expect(site.contactEmail).toBe("hello@hack-cove.com");
  });

  test("the team is the three people, first names only", () => {
    expect(site.team.map((p) => `${p.name} — ${p.role}`)).toEqual([
      "Jacobus — Engineer",
      "Erin — Design Engineer",
      "Silindile — Client Service agent",
    ]);
  });
});

describe("logo", () => {
  test("is named Hack Cove, with the halo hidden from assistive tech", () => {
    const html = renderToStaticMarkup(<Logo />);
    expect(html).toContain(`role="img" aria-label="${site.name}"`);
    expect(html).toContain('class="logo-glow');
    expect(html).toContain('aria-hidden="true"');
  });

  test("is one fixed #4f86f7 that no theme remaps, favicon included", () => {
    const css = readFileSync(`${import.meta.dirname}/../src/styles/global.css`, "utf8");
    expect(css).toMatch(/:root\s*{\s*--logo:\s*#4f86f7;/);
    expect(readFileSync(`${import.meta.dirname}/../public/favicon.svg`, "utf8")).toContain(
      'fill="#4f86f7"',
    );
    for (const theme of themeFiles(`${import.meta.dirname}/../../../themes`)) {
      expect(theme.css).not.toMatch(/--logo|4f86f7/i);
    }
  });
});

describe("static HTML", () => {
  test("every person reaches the markup with their role", () => {
    const html = renderToStaticMarkup(<Team />);
    for (const person of site.team) {
      expect(html).toContain(person.name);
      expect(html).toContain(person.role);
    }
  });

  test("a person with no photo gets a monogram, not a broken image", () => {
    const html = renderToStaticMarkup(<Team />);
    expect(html).not.toContain("<img");
    expect(html).toContain(">JA</span>");
  });

  test("a person's bio renders when one is filled in", () => {
    const withBio: Person = { name: "Erin", role: "Design Engineer", bio: "A line about Erin." };
    const original = [...site.team];
    site.team.splice(0, site.team.length, withBio);
    try {
      expect(renderToStaticMarkup(<Team />)).toContain("A line about Erin.");
    } finally {
      site.team.splice(0, site.team.length, ...original);
    }
  });

  test("the footer offers email, privacy, terms, and no form", () => {
    const html = renderToStaticMarkup(<Contact />);
    expect(html).toContain(`mailto:${site.contactEmail}`);
    expect(html).toContain(site.legalName);
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/terms"');
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
  });
});

/** The words of some markup, tags dropped and the apostrophe decoded. */
const wordsOf = (fragment: string) =>
  fragment
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&#x27;", "'")
    .replace(/\s+/g, " ");

const hrefs = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

describe("sections", () => {
  test("the header nav links to the three sections", () => {
    const html = renderToStaticMarkup(<SiteNav pathname="/" />);
    expect(hrefs(html)).toEqual(["/contracting/", "/ui/", "/pixelslash/"]);
    expect(html).not.toContain("aria-current");
  });

  test.each([
    ["/contracting/", "Contracting"],
    ["/contracting", "Contracting"],
    ["/cv/", "Contracting"],
    ["/ui/", "UI"],
    ["/pixelslash/", "PixelSlash"],
  ])("%s marks %s as the current section", (pathname, label) => {
    const html = renderToStaticMarkup(<SiteNav pathname={pathname} />);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toMatch(new RegExp(`aria-current="page"[^>]*>${label}<`));
  });
});

/** A split part's markup up to its element's close. */
const inner = (part: string, tag: string) => part.split(`</${tag}>`)[0] ?? "";

const product = (name: string) => site.products.find((p) => p.name === name);

describe("the home page", () => {
  const html = renderToStaticMarkup(<ProductCards />);
  // Each <section>'s markup: the three products ready to use, how they fit, the cards to come.
  const sections = html.split("<section").slice(1);
  const fit = sections.at(-2) ?? "";
  const coming = sections.at(-1) ?? "";
  const cards = [
    ...sections.slice(0, -2).map((part) => inner(part, "section")),
    ...coming
      .split("<article")
      .slice(1)
      .map((part) => inner(part, "article")),
  ];

  const expected = [
    {
      overline: "01 / Component library",
      name: "Hack Cove UI",
      label: "Available now",
      pitch:
        "Our opinionated React component library, fully integrated with its themes. This site is built with it.",
      href: "/ui/",
      action: "Read the docs",
    },
    {
      overline: "02 / Visual review",
      name: "PixelSlash",
      label: "Available now",
      pitch: "See what your change did to the page.",
      href: "https://pixelslash.dev",
      action: "Visit pixelslash.dev",
    },
    {
      overline: "03 / Feature switches",
      name: "ToggleSlash",
      label: "Available now",
      pitch: "It keeps track of feature switches, so you know what turning one on will do.",
      href: "https://slashslash.build/developers",
      action: "Read more on slashslash.build",
    },
    {
      name: "FlakeSlash",
      label: "In early development",
      pitch:
        "It spots automated checks that pass and fail at random, so a failure means something.",
      href: "https://slashslash.build/developers",
      action: "Read more on slashslash.build",
    },
    {
      name: "ThriftLoop",
      label: "Coming soon",
      pitch: "A home for South Africa's thrift, charity and second-hand shops.",
    },
  ];

  test("opens on one h1 under a Products overline, with a lead", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain(">Products<");
    expect(html).toContain(site.home.title);
    expect(wordsOf(html)).toContain(site.home.lead);
    expect(html).not.toContain(site.tagline);
    expect(html).not.toContain(site.legalName);
  });

  test("has the five products in order, each with its name, status, pitch and what it does", () => {
    expect(cards).toHaveLength(5);
    expected.forEach((want, i) => {
      const { features, sample } = product(want.name) ?? {};
      // The product's whole text (from inside its opening tag), so extra copy fails too.
      expect(wordsOf((cards[i] ?? "").replace(/^[^>]*>/, "")).trim()).toBe(
        [
          "overline" in want ? want.overline : undefined,
          want.name,
          want.label,
          want.pitch,
          ...(features ?? []),
          want.action,
          sample?.label,
          ...(sample?.lines ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " "),
      );
    });
    expect(site.products.map((p) => p.name)).toEqual(expected.map((p) => p.name));
  });

  test("every product but ThriftLoop has one link out, only an external one in a new tab", () => {
    expected.forEach((want, i) => {
      const links = [...(cards[i] ?? "").matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]);
      expect(links).toEqual(want.href ? [want.href] : []);
      expect(cards[i]?.includes("_blank")).toBe(want.href?.startsWith("https://") ?? false);
    });
    expect(fit).not.toContain("<a ");
  });

  test("the three products ready to use come first, each a block with a picture or real output", () => {
    expect(sections).toHaveLength(5);
    // Five section headings, three questions and two coming cards (a Card's title is an h2).
    expect(html.match(/<h2/g)).toHaveLength(10);
    expect(coming).toContain(`>${site.home.coming.title}<`);
    expect(coming.match(/<article/g)).toHaveLength(2);
    expect(html.match(/<img /g)).toHaveLength(2);
    ["/home/hack-cove-ui.webp", "/home/pixelslash.webp"].forEach((src, i) => {
      expect(cards[i]).toContain(`src="${src}"`);
      expect(cards[i]).toMatch(/alt="[^"]+"/);
      expect(readFileSync(new URL(`../public${src}`, import.meta.url)).length).toBeGreaterThan(0);
    });
    expect(cards[2]).toContain("<pre");
  });

  test("how they fit asks one question per slash tool, and names the tool that answers it", () => {
    expect(fit).toContain(`>${site.home.fit.title}<`);
    expect(fit.match(/<article/g)).toHaveLength(3);
    for (const { question, product: name, answer } of site.home.fit.questions)
      for (const copy of [`>${question}<`, `>${name}<`, answer]) expect(fit).toContain(copy);
  });
});

describe("the PixelSlash page", () => {
  const { pixelslash } = site;
  const html = renderToStaticMarkup(<PixelSlashHero />) + renderToStaticMarkup(<PixelSlashPage />);
  // The command and code runs sit in spans: compare the text, not the markup.
  const text = html.replace(/<[^>]+>/g, " ").replaceAll("&quot;", '"');

  test("the hero says what it is, with the badges, the calls to action and the install line", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain(pixelslash.hero.title);
    for (const label of ["Source available", "ELv2", "Local first"])
      expect(html).toContain(`>${label}<`);
    expect(html).toContain('href="https://pixelslash.dev/docs"');
    expect(html).toContain('href="https://github.com/madangryscientist/pixelslash"');
    expect(html).toContain(">npm i -D @hackcove/pixelslash</code>");
    expect(html).toContain('aria-label="copy"');
  });

  test("the proof is the real report image, with alt text and a caption", () => {
    expect(html).toContain('src="/pixelslash/report.webp"');
    expect(html).toContain(`alt="${pixelslash.report.alt}"`);
    expect(html).toContain("<figcaption");
    expect(readFileSync(new URL("../public/pixelslash/report.webp", import.meta.url)).length).toBe(
      39310,
    );
  });

  test("it walks through Capture, Diff and Review, then the features, CI and agents", () => {
    for (const step of ["Capture", "Diff", "Review"]) expect(html).toContain(step);
    expect(pixelslash.features.items.length).toBeGreaterThanOrEqual(6);
    expect(pixelslash.features.items.length).toBeLessThanOrEqual(8);
    for (const item of pixelslash.features.items) expect(html).toContain(item.title);
    for (const command of ["pixelslash upload", "pixelslash check", "pixelslash mcp"])
      expect(text).toContain(command);
  });

  test("privacy, free and source available, and the Hack Cove UI proof", () => {
    expect(text).toContain("--upload");
    expect(text).toContain("Self-host");
    expect(text).toContain("Paid hosting is planned, not available yet.");
    expect(html).toContain('href="/ui/"');
  });

  test("it calls PixelSlash source available, never open source or MIT, here or on the home card", () => {
    const section = sectionOf("pixelslash");
    // The block as the home page renders it, and the page itself. Markup too, since an alt
    // or aria-label could carry the claim. Hack Cove UI is MIT, so only PixelSlash's own
    // block and page are read; a licence claim in the page's Hack Cove UI proof block would
    // be a true one and would need this check scoped to the PixelSlash blocks.
    const homeCard = renderToStaticMarkup(<ProductCards />)
      .split("<section")
      .find((block) => block.includes('aria-labelledby="product-pixelslash"'))
      ?.split("</section>")[0];
    expect(homeCard).toBeDefined();
    for (const copy of [homeCard ?? "", html, section.summary, section.description]) {
      expect(copy).not.toMatch(/open[-\s]?source/i);
      expect(copy).not.toMatch(/\bMIT\b/i);
    }
  });

  test("it no longer says PixelSlash is unreleased, here or on the home card", () => {
    const section = sectionOf("pixelslash");
    for (const copy of [text, section.summary, section.description]) {
      expect(copy).not.toMatch(/coming soon|not published|nothing to install|public release/i);
    }
  });
});

describe("the Hack Cove UI page", () => {
  const html = renderToStaticMarkup(<UiPage />);

  test("it leads with the purpose and states the end goal as an aim", () => {
    expect(html).toContain("The aim is");
  });

  test("it shows the install commands and the GitHub and npm links", () => {
    // The command is coloured, so its runs sit in spans: compare the text, not the markup.
    const text = html.replace(/<[^>]+>/g, "").replaceAll("&quot;", '"');
    expect(text).toContain("bun add @hackcove/ui-react @hackcove/themes");
    expect(text).toContain('@import "tailwindcss";');
    for (const link of site.ui.links.items) expect(html).toContain(`href="${link.href}"`);
    expect(html).toContain(site.ui.docs.text.replaceAll("'", "&#x27;"));
    for (const link of site.ui.docs.links) expect(html).toContain(`href="${link.href}"`);
  });

  test("it links the full component list: every section and every component page", () => {
    for (const section of componentSections) expect(html).toContain(section.title);
    for (const { slug } of componentPages) expect(html).toContain(`href="/ui/${slug}/"`);
  });

  test("the theme list is one entry per themes/*.css file, read by the glob and not written in code", () => {
    const files = themeFiles(`${import.meta.dirname}/../../../themes`);
    expect(files.length).toBeGreaterThan(0);
    expect(themes.map((t) => t.id)).toEqual(files.map((f) => f.id));
    for (const theme of themes) {
      expect(theme.scopeClass).not.toBe("");
      expect(html).toContain(theme.specifier);
      expect(html).toContain(`<code`);
      expect(html).toContain(theme.scopeClass);
    }
  });
});
