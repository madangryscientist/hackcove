import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Contact } from "../src/components/Contact";
import { Hero } from "../src/components/Hero";
import { PixelSlashPage } from "../src/components/PixelSlashPage";
import { Projects } from "../src/components/Projects";
import { SectionCards } from "../src/components/SectionCards";
import { SiteNav } from "../src/components/SiteNav";
import { Team } from "../src/components/Team";
import { UiPage } from "../src/components/UiPage";
import { type Person, type Project, site } from "../src/content/site";
import { scopeClassOf, themes } from "../src/content/themes";

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
  const html = renderToStaticMarkup(<PixelSlashPage />);

  test("Today lists what the CLI does now, marked in use", () => {
    const { today } = site.pixelslash;
    expect(html).toContain(">Today<");
    expect(html).toContain(">In use<");
    expect(today.items).toHaveLength(7);
    expect(html).toContain("pixelslash dev");
  });

  test("Coming soon lists the public release, CI and hosted review and uploads", () => {
    const { comingSoon } = site.pixelslash;
    expect(html).toContain(">Coming soon<");
    expect(comingSoon.items).toHaveLength(3);
    for (const item of comingSoon.items) expect(html).toContain(item);
  });

  test("it has no repo or npm link while PixelSlash is unpublished", () => {
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("github.com");
    expect(html).not.toContain("npmjs.com");
  });
});

describe("the Hack Cove UI page", () => {
  const html = renderToStaticMarkup(<UiPage />);

  test("it leads with the purpose and states the end goal as an aim", () => {
    expect(html).toContain("The aim is");
  });

  test("it shows the install commands and the GitHub and npm links", () => {
    expect(html).toContain("bun add @hackcove/ui @hackcove/theme-catppuccin-mocha");
    for (const link of site.ui.links.items) expect(html).toContain(`href="${link.href}"`);
    expect(html).toContain("Documentation for each component is coming soon.");
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

  test("the scope class is the first top-level class rule", () => {
    expect(scopeClassOf("@custom-variant dark (&:is(.dark *));\n.dark {\n  --x: 1;\n}")).toBe(
      "dark",
    );
    expect(scopeClassOf(".a-b {\n}\n.c {\n}")).toBe("a-b");
    expect(scopeClassOf("body {}")).toBeUndefined();
  });
});
