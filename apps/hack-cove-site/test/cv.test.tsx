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
  test("header leads with back end and developer productivity", () => {
    expect(cv.name).toBe("Jacobus Langner");
    expect(cv.headline).toBe(
      "Full-Stack Engineer · Developer productivity · APIs, messaging and platform · .NET Core, Node, Python",
    );
    expect(cv.location).toBe("Cape Town");
    expect(cv.summary).toMatch(/^Senior full-stack engineer with 18 years/);
    expect(cv.summary).toContain("tooling that let other developers excel");
    expect(cv.summary).toContain("On call for the systems I build.");
  });

  test("experience dates and titles match the v2 CV", () => {
    expect(cv.experience.map((job) => `${job.company} · ${job.title} · ${job.dates}`)).toEqual([
      "Hack Cove · Founder / Contract Engineer · Apr 2026 – Present",
      "Zappi · Senior Engineer · Apr 2021 – Apr 2026",
      "FMI · API Architect · Jun 2018 – Mar 2021",
      "Wonga · Software Development Team Lead · Aug 2015 – May 2018",
    ]);
  });

  test("Zappi leads with the developer platform", () => {
    const zappi = cv.experience.find((job) => job.company === "Zappi");
    const items = zappi?.groups.flatMap((group) => group.items) ?? [];
    expect(items[0]).toContain("used by 80 engineers");
    expect(items.join(" ")).toContain("SQS/SNS");
    expect(zappi?.tech).toMatch(/^Node\.js, Amazon SQS\/SNS/);
  });

  test("Hack Cove lists Cue, PixelSlash, Omnibus and Hack Cove UI", () => {
    const hackCove: CvJob = cv.experience[0];
    expect(hackCove.groups.map((group) => group.heading)).toEqual([
      "Client: Cue (voice and telephony)",
      "PixelSlash",
      "Omnibus",
      "Hack Cove UI",
    ]);
    expect(hackCove.groups[0].items).toContain(
      "Built the Python service that integrates the app with the voice provider.",
    );
    expect(hackCove.groups[1].links?.map((link) => link.href)).toEqual([
      "https://pixelslash.dev",
      "https://github.com/madangryscientist/pixelslash",
    ]);
    expect(hackCove.groups[3].links?.map((link) => link.href)).toEqual([
      "https://hack-cove.com/ui",
      "https://github.com/madangryscientist/hackcove",
    ]);
    expect(html).toContain('href="https://pixelslash.dev"');
    expect(html).toContain('href="https://hack-cove.com/ui"');
    expect(html).toContain('href="https://github.com/madangryscientist/pixelslash"');
    expect(html).toContain('href="https://github.com/madangryscientist/hackcove"');
  });

  test("FMI and Wonga lead with architecture", () => {
    const fmi = cv.experience.find((job) => job.company === "FMI");
    const wonga = cv.experience.find((job) => job.company === "Wonga");
    expect(fmi?.groups[0].items[0]).toMatch(/^Architected 15 API services/);
    expect(wonga?.groups[0].items[0]).toContain("NServiceBus");
    expect(wonga?.groups[0].items.join(" ")).toContain("CEO Recognition Award");
  });

  test("earlier roles, education and grouped skills are present", () => {
    expect(cv.earlierRoles.map((r) => r.company)).toEqual([
      "Sygnia",
      "Property24",
      "ACI Worldwide",
      "Axxess DSL and Business Intelligence",
    ]);
    expect(cv.education.qualification).toBe("Bachelor of Science (BSc), Computer Science");
    expect(cv.education.school).toBe("NMMU, Port Elizabeth");
    expect(cv.skills.map((g) => g.label)).toEqual([
      "Back end",
      "Messaging",
      "Databases",
      "Platform & DevEx",
      "Infrastructure",
      "Front end",
      "Build & testing",
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

describe("cv layout", () => {
  test("the three section headings are ruled", () => {
    expect(html.match(/<h2 class="[^"]*border-b border-slate-200\/70[^"]*"/g)).toHaveLength(3);
  });

  test("a job's bullets are a BulletList", () => {
    expect(html).toMatch(/<ul class="list-disc[^"]*">/);
  });
});
