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

describe("cv static HTML", () => {
  test("the confirmed fields reach the markup", () => {
    for (const text of confirmedFields()) expect(html).toContain(text);
  });

  test("the approved 2026-11-19 lines render as written", () => {
    expect(html).toContain(
      "Senior Full-Stack Engineer · TypeScript, Node, React, C#/.NET Core, PostgreSQL · AI developer tooling · Cape Town",
    );
    expect(html).toContain("Contract Engineer, Hack Cove (my contracting company)");
    expect(html).toContain(
      "Slash suite (slashslash.build): tools I built for problems I hit while building with AI coding agents, and use every day. Public on GitHub, in alpha.",
    );
    expect(html).toContain("Cut the initial page load from 41 MB to 2.7 MB.");
  });

  test("no em dash or en dash in the CV copy", () => {
    expect(blob).not.toMatch(/[\u2013\u2014]/);
  });

  test("no contact form", () => {
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
  });

  test("private fields and the Storybook letter stay off the public page", () => {
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
    expect(blob.toLowerCase()).not.toContain("current client");
  });

  test("public cv pdf is next to the photo", () => {
    expect(cv.pdf).toBe("/cv/jacobus.pdf");
    expect(existsSync(join(import.meta.dirname, "../public/cv/jacobus.pdf"))).toBe(true);
  });
});
