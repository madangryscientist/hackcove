import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CaseStudies } from "../src/components/CaseStudies";
import { Contact } from "../src/components/Contact";
import { Hero } from "../src/components/Hero";
import { Team } from "../src/components/Team";
import { type Person, site } from "../src/content/site";

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

  test("case studies render nothing while there are none (the later-addition seam)", () => {
    expect(renderToStaticMarkup(<CaseStudies />)).toBe("");
    const original = [...site.caseStudies];
    site.caseStudies.push({ slug: "x", title: "A project", summary: "What we did." });
    try {
      const html = renderToStaticMarkup(<CaseStudies />);
      expect(html).toContain("A project");
      expect(html).toContain("What we did.");
    } finally {
      site.caseStudies.splice(0, site.caseStudies.length, ...original);
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
