import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Contact } from "../src/components/Contact";
import { Hero } from "../src/components/Hero";
import { Projects } from "../src/components/Projects";
import { Team } from "../src/components/Team";
import { type Person, type Project, site } from "../src/content/site";

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
  test("the hero renders the tagline, the intro and a mailto link", () => {
    const html = renderToStaticMarkup(<Hero />);
    expect(html).toContain(site.tagline);
    expect(html).toContain(site.intro);
    expect(html).toContain(`mailto:${site.contactEmail}`);
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

  test("three projects render, each with its name and status", () => {
    expect(site.projects).toHaveLength(3);
    const html = renderToStaticMarkup(<Projects />);
    expect(html.match(/<article/g)).toHaveLength(3);
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
