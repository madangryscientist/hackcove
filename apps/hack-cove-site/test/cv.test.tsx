import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Cv } from "../src/components/Cv";
import { cv, type CvJob } from "../src/content/cv";

const html = renderToStaticMarkup(<Cv />)
  .replaceAll("&amp;", "&")
  .replaceAll("&#x27;", "'");
const blob = `${JSON.stringify(cv)}\n${html}`;

function jobFields(job: CvJob): string[] {
  const groups = job.groups.flatMap((group) => [group.heading ?? "", ...group.items]);
  return [
    job.company,
    job.title,
    job.dates,
    ...(job.summary ?? "").split("\n\n"),
    job.tech ?? "",
    ...groups,
  ].filter(Boolean);
}

function confirmedFields(): string[] {
  return [
    cv.name,
    cv.headline,
    cv.location,
    ...cv.summary.split("\n\n"),
    cv.photo,
    cv.pdf,
    "Download PDF",
    ...cv.experience.flatMap(jobFields),
    ...cv.earlierRoles.flatMap((role) => [role.company, role.title, role.summary]),
    cv.education.qualification,
    cv.education.school,
    cv.education.detail,
    ...cv.skills.flatMap((group) => group.items),
    ...cv.links.flatMap((link) => [link.href, link.label]),
  ];
}

describe("cv content", () => {
  test("header matches OfferZen current role", () => {
    expect(cv.name).toBe("Jacobus Langner");
    expect(cv.headline).toBe("Staff-level Engineer");
    expect(cv.location).toBe("Cape Town");
    expect(cv.summary).toContain("Cue is my current client");
    expect(cv.summary).toMatch(/^Staff-level engineer with 18 years/);
    expect(cv.summary).toContain("At Zappi I owned the front-end guild");
    expect(cv.experience[0].tech).toBe("TypeScript, React, Python");
  });

  test("experience dates and titles match OfferZen", () => {
    expect(cv.experience.map((job) => `${job.company} · ${job.title} · ${job.dates}`)).toEqual([
      "Hack Cove · Founder / Contract Engineer · April 2026 – Present",
      "Zappi · Senior Frontend Engineer · April 2021 – April 2026",
      "FMI · Frontend-API Architect · June 2018 – March 2021",
      "Wonga · Software Development Team Lead · August 2015 – May 2018",
    ]);
  });

  test("Zappi description matches the shortened OfferZen copy", () => {
    const zappi = cv.experience.find((job) => job.company === "Zappi");
    expect(zappi?.groups).toEqual([
      {
        items: [
          "Maintain a TypeScript monorepo of 60+ packages: shared UI components and tooling consumed by multiple frontend applications. Design library APIs balancing end-user simplicity with extensibility for internal consumers.",
          "Jest to Vitest: reduced test suite runtime from 90s to 58s (35% faster), with 60% faster transforms using SWC—100% pass rate across 1,126 tests",
          "Cypress to Playwright: reduced E2E test runtime from 30 minutes to 5 minutes (83% faster)",
          "Migrated library builds from CommonJS to ESM-only using tsdown, reducing build time from 120s to 5s (96% faster)",
          "Refactored microfrontend architecture to library-based imports, reducing bundle size from 41MB to 24MB (41% reduction)",
          "React 18 migration, resolving concurrent rendering issues across a large codebase",
          "Redux to React Query and Zustand, modernizing state management and data fetching patterns application-wide",
          "Managed NX monorepo upgrades (v21 → v22) with build caching optimization",
        ],
      },
    ]);
    expect(blob).not.toContain("Salesforce");
    expect(blob).not.toContain("HeadlessUI");
    expect(blob).not.toContain("Component Library & Developer Tooling");
  });

  test("earlier roles, education and grouped skills are present", () => {
    expect(cv.earlierRoles.map((r) => r.company)).toEqual([
      "Sygnia Ltd",
      "Property24",
      "ACI Worldwide",
      "Business Intelligence",
      "Axxess Dsl",
    ]);
    expect(cv.education.qualification).toBe("Bachelor of Science (BSc), Computer Science");
    expect(cv.education.school).toBe("NMMU, Port Elizabeth");
    expect(cv.skills.map((g) => g.label)).toEqual([
      "Languages",
      "Frameworks",
      "Build Tools",
      "Testing",
      "Infrastructure",
      "Databases",
      "Spoken",
    ]);
  });
});

describe("cv static HTML", () => {
  test("the confirmed fields reach the markup", () => {
    for (const text of confirmedFields()) expect(html).toContain(text);
  });

  test("no contact form", () => {
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
  });

  test("private OfferZen fields and the Storybook letter stay off the public page", () => {
    expect(blob).not.toMatch(/R\s*95/);
    expect(blob).not.toMatch(/R\s*120/);
    expect(blob).not.toMatch(/R\s*130/);
    expect(blob).not.toContain("95 000");
    expect(blob).not.toContain("120 000");
    expect(blob.toLowerCase()).not.toContain("notice period");
    expect(blob.toLowerCase()).not.toContain("open to opportunities");
    expect(blob.toLowerCase()).not.toContain("blocked companies");
    expect(blob.toLowerCase()).not.toContain("reason for leaving");
    expect(blob.toLowerCase()).not.toContain("open to new opportunities");
    expect(blob).not.toContain("Storybook Hiring Team");
    expect(blob).not.toContain("senior software engineer at Cue leading frontend architecture");
    expect(cv.experience[0].summary).toContain("Voice Inbox");
  });

  test("public cv pdf is next to the photo", () => {
    expect(cv.pdf).toBe("/cv/jacobus.pdf");
    expect(existsSync(join(import.meta.dirname, "../public/cv/jacobus.pdf"))).toBe(true);
  });
});

describe("cv layout", () => {
  test("the three section headings are ruled", () => {
    expect(html.match(/<h2 class="[^"]*border-b border-slate-200\/70[^"]*"/g)).toHaveLength(3);
  });

  test("a job's bullets are a BulletList", () => {
    expect(html).toMatch(/<ul class="list-disc[^"]*">/);
  });
});
