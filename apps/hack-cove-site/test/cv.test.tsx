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
/** The page's text as a reader sees it: tags dropped, so inline links and spans do not split a line. */
const text = html.replace(/<[^>]*>/g, "");
/** The markup of every `tag` element (one that does not nest inside itself). */
function elements(tag: string): string[] {
  return [...html.matchAll(new RegExp(`<${tag}[ >][\\s\\S]*?</${tag}>`, "g"))].map((m) => m[0]);
}

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
    "Download PDF",
    ...cv.experience.flatMap(jobFields),
    ...cv.earlierRoles.flatMap((role) => [role.company, role.title, role.summary]),
    cv.education.qualification,
    cv.education.school,
    cv.education.detail,
    ...cv.skills.flatMap((group) => group.items),
    ...cv.links.map((link) => link.label),
  ];
}

/** The confirmed values that live in attributes (a photo, the PDF, each link's address). */
function confirmedAddresses(): string[] {
  return [cv.photo, cv.pdf, ...cv.links.map((link) => link.href)];
}

describe("cv static HTML", () => {
  test("the confirmed fields reach the markup", () => {
    for (const field of confirmedFields()) expect(text).toContain(field);
    for (const address of confirmedAddresses()) expect(html).toContain(address);
  });

  test("the approved 2026-11-19 lines render as written", () => {
    expect(text).toContain(
      "Senior Full-Stack Engineer · TypeScript, Node, React, C#/.NET Core, PostgreSQL · AI developer tooling · Cape Town",
    );
    expect(text).toContain("Contract Engineer, Hack Cove (my contracting company)");
    expect(text).toContain(
      "Slash suite (slashslash.build): tools I built for problems I hit while building with AI coding agents, and use every day. Public on GitHub, in alpha.",
    );
    expect(text).toContain("Cut the initial page load from 41 MB to 2.7 MB.");
  });

  test("the two lines approved later on 2026-11-19 render as written, and the old wording is gone", () => {
    expect(text).toContain("Developer platform, Node services, front-end guild lead (final year)");
    expect(text).toContain(
      "I build the suite with OmniSlash, a multi-agent system I designed for tasking and scheduling: a muse agent turns my ideas into designs, an architect agent plans them into tickets and schedules the builder agents, a sentinel agent gates and merges every pull request, and TaskSlash (Rust) queues their builds and tests so they do not overload the machine.",
    );
    expect(text).not.toContain("Multi-tenant");
    expect(text).not.toContain("isolated git worktrees");
  });

  test("the Slash suite heading carries the slashslash.build link, with no links line of its own", () => {
    const heading = elements("p").find((p) => p.includes("Slash suite ("));
    expect(heading).toContain('<a href="https://slashslash.build"');
    expect(heading).toContain(">slashslash.build</a>");
    const paragraphs = elements("p").map((p) => p.replace(/<[^>]*>/g, "").trim());
    expect(paragraphs).not.toContain("slashslash.build");
    expect(html.match(/href="https:\/\/slashslash\.build"/g)).toHaveLength(1);
  });

  test("every Skills label is bold in a dt", () => {
    const labels = elements("dt").map((dt) => dt.match(/<strong>([^<]*)<\/strong>/)?.[1]);
    expect(labels).toEqual(cv.skills.map((group) => `${group.label}:`));
  });

  test("each job's dates carry its location, as approved", () => {
    expect(text).toContain("Apr 2026 to Present (Remote)");
    expect(text).toContain("Apr 2021 to Apr 2026 (Remote)");
    expect(text).toContain("Jun 2018 to Mar 2021 (Remote)");
    expect(text).toContain("Aug 2015 to May 2018 (Office-based)");
  });

  test("the headline breaks only between its parts, each holding its separator", () => {
    const shown = [...cv.headline.split(" · ").map((part) => `${part} ·`), cv.location];
    for (const part of shown) expect(html).toContain(`<span class="inline-block">${part}</span>`);
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
