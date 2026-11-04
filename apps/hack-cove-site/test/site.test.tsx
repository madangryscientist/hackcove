import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Contact } from "../src/components/Contact";
import { Hero } from "../src/components/Hero";
import { Logo } from "../src/components/Logo";
import { PixelSlashHero, PixelSlashPage } from "../src/components/PixelSlashPage";
import { Projects } from "../src/components/Projects";
import { SectionCards } from "../src/components/SectionCards";
import { SiteNav } from "../src/components/SiteNav";
import { Team } from "../src/components/Team";
import { UiPage } from "../src/components/UiPage";
import { componentPages, componentSections } from "../src/content/components/index";
import { type Person, type Project, sectionOf, site } from "../src/content/site";
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
    for (const { folder } of themes) {
      const theme = readFileSync(
        `${import.meta.dirname}/../../../themes/${folder}/theme.css`,
        "utf8",
      );
      expect(theme).not.toMatch(/--logo|4f86f7/i);
    }
  });
});

const countWith = (status: Project["status"]) =>
  site.projects.filter((p) => p.status === status).length;

describe("static HTML", () => {
  test("the hero renders the tagline", () => {
    expect(renderToStaticMarkup(<Hero />)).toContain(site.tagline);
  });

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

  test("the project renders with its name and status", () => {
    expect(site.projects).toHaveLength(1);
    const html = renderToStaticMarkup(<Projects />);
    expect(html.match(/<article/g)).toHaveLength(1);
    for (const project of site.projects) expect(html).toContain(project.name);
    expect(html.match(/>Available</g) ?? []).toHaveLength(countWith("available"));
    expect(html.match(/>Coming soon</g) ?? []).toHaveLength(countWith("coming-soon"));
  });

  test("links render exactly where the content has them", () => {
    const html = renderToStaticMarkup(<Projects />);
    const links = site.projects.flatMap((p) => p.links ?? []);
    expect(html.match(/<a /g) ?? []).toHaveLength(links.length);
    for (const link of links) expect(html).toContain(`href="${link.href}"`);
  });

  test("a project's copy, status and links come from the content file alone", () => {
    const original = [...site.projects];
    const extra: Project = {
      slug: "x",
      name: "A new project",
      status: "available",
      summary: "What it is.",
      details: ["One detail."],
      links: [{ label: "Home", href: "https://example.com/x" }],
    };
    site.projects.splice(0, site.projects.length, extra);
    try {
      const html = renderToStaticMarkup(<Projects />);
      expect(html).toContain("A new project");
      expect(html).toContain("One detail.");
      expect(html).toContain('href="https://example.com/x"');
      expect(html).toContain(">Home<");
    } finally {
      site.projects.splice(0, site.projects.length, ...original);
    }
  });

  test("the projects section renders nothing while there are none", () => {
    const original = [...site.projects];
    site.projects.splice(0, site.projects.length);
    try {
      expect(renderToStaticMarkup(<Projects />)).toBe("");
    } finally {
      site.projects.splice(0, site.projects.length, ...original);
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

  test("the home page has one card per section, linking to its page", () => {
    const html = renderToStaticMarkup(<SectionCards />);
    expect(html.match(/<article/g)).toHaveLength(site.sections.length);
    expect(hrefs(html)).toEqual(site.sections.map((s) => s.href));
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
    for (const label of ["Open source", "MIT", "Local first"]) expect(html).toContain(`>${label}<`);
    expect(html).toContain('href="https://pixelslash.dev/docs"');
    expect(html).toContain('href="https://github.com/madangryscientist/pixelslash"');
    expect(html).toContain(">npm i -D @hackcove/pixelslash</code>");
    expect(html).toContain(">copy</button>");
  });

  test("the proof is the real report image, with alt text and a caption", () => {
    expect(html).toContain('src="/pixelslash/report.png"');
    expect(html).toContain(`alt="${pixelslash.report.alt}"`);
    expect(html).toContain("<figcaption");
    expect(readFileSync(new URL("../public/pixelslash/report.png", import.meta.url)).length).toBe(
      26214,
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

  test("privacy, free and open source, and the Hack Cove UI proof", () => {
    expect(text).toContain("--upload");
    expect(text).toContain("Self-host");
    expect(text).toContain("Paid hosting is planned, not available yet.");
    expect(html).toContain('href="/ui/"');
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
    expect(text).toContain("bun add @hackcove/ui-react @hackcove/theme-catppuccin-mocha");
    expect(text).toContain('@import "tailwindcss";');
    for (const link of site.ui.links.items) expect(html).toContain(`href="${link.href}"`);
    expect(html).toContain(site.ui.docs.text.replaceAll("'", "&#x27;"));
    for (const link of site.ui.docs.links) expect(html).toContain(`href="${link.href}"`);
  });

  test("it links the full component list: every section and every component page", () => {
    for (const section of componentSections) expect(html).toContain(section.title);
    for (const { slug } of componentPages) expect(html).toContain(`href="/ui/${slug}/"`);
  });

  test("the theme list is the themes/* folders, read by the glob and not written in code", () => {
    const folders = readdirSync(new URL("../../../themes", import.meta.url), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .toSorted();
    expect(folders.length).toBeGreaterThan(0);
    expect(themes.map((t) => t.folder)).toEqual(folders);
    for (const theme of themes) {
      const manifest: unknown = JSON.parse(
        readFileSync(
          new URL(`../../../themes/${theme.folder}/package.json`, import.meta.url),
          "utf8",
        ),
      );
      expect(manifest).toMatchObject({ name: theme.name });
      expect(theme.scopeClass).not.toBe("");
      expect(html).toContain(theme.name);
      expect(html).toContain(`<code`);
      expect(html).toContain(theme.scopeClass);
    }
  });
});
