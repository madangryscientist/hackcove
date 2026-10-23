import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LegalPage } from "../src/components/LegalPage";
import { privacy, terms } from "../src/content/legal";
import { site } from "../src/content/site";

const privacyHtml = renderToStaticMarkup(<LegalPage doc={privacy} />)
  .replaceAll("&amp;", "&")
  .replaceAll("&#x27;", "'");
const termsHtml = renderToStaticMarkup(<LegalPage doc={terms} />)
  .replaceAll("&amp;", "&")
  .replaceAll("&#x27;", "'");
const blob = `${JSON.stringify(privacy)}\n${JSON.stringify(terms)}\n${privacyHtml}\n${termsHtml}`;

describe("legal pages exist", () => {
  test("privacy.astro and terms.astro are in pages/", () => {
    expect(existsSync(join(import.meta.dirname, "../src/pages/privacy.astro"))).toBe(true);
    expect(existsSync(join(import.meta.dirname, "../src/pages/terms.astro"))).toBe(true);
  });
});

describe("legal copy", () => {
  test("both pages carry company and South Africa, without a review flag", () => {
    for (const html of [privacyHtml, termsHtml]) {
      expect(html).not.toContain("[REVIEW: legal]");
      expect(html).toContain(site.legalName);
      expect(html).toContain("South Africa");
      expect(html).toContain(site.contactEmail);
    }
  });

  test("privacy names POPIA and Google access without a contact form", () => {
    expect(privacyHtml).toContain("POPIA");
    expect(privacyHtml).toContain("Protection of Personal Information Act");
    expect(privacyHtml).toContain("Google");
    expect(privacyHtml).not.toContain("<form");
    expect(privacyHtml).not.toContain("<input");
  });

  test("terms are South African law, static, no form", () => {
    expect(termsHtml).toContain("governed by the law of South Africa");
    expect(termsHtml).toContain("as-is");
    expect(termsHtml).not.toContain("<form");
    expect(termsHtml).not.toContain("<input");
  });

  test("does not invent a company number, street address, or regulator contact", () => {
    expect(blob).not.toMatch(/\b\d{4}\/\d{6}\/\d{2}\b/);
    expect(blob.toLowerCase()).not.toContain("information regulator");
    expect(blob).not.toMatch(/\d+\s+\w+\s+(Street|Road|Avenue|Drive|Lane|Boulevard)/i);
  });
});

describe("legal static HTML", () => {
  test("every section reaches the markup", () => {
    for (const [doc, html] of [
      [privacy, privacyHtml],
      [terms, termsHtml],
    ] as const) {
      expect(html).toContain(doc.title);
      expect(html).toContain(doc.updated);
      for (const section of doc.sections) {
        expect(html).toContain(section.heading);
        for (const para of section.paragraphs) expect(html).toContain(para);
      }
    }
  });

  test("each page links home and to the other legal page", () => {
    expect(privacyHtml).toContain('href="/"');
    expect(privacyHtml).toContain('href="/terms"');
    expect(termsHtml).toContain('href="/"');
    expect(termsHtml).toContain('href="/privacy"');
  });
});
