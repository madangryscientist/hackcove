/* ---------------------------------------------------------------------------
   The site's content, in one typed place.
   ---------------------------------------------------------------------------
   Every word on hack-cove.com comes from Jacobus, so it lives here as data
   rather than being scattered through markup: editing copy means editing this
   file, and nothing else. The optional slots (a person's `bio` / `photo`, and
   `caseStudies`) are the seams the ticket asked for — a bio or a case study can
   be filled in later without touching a component.
   --------------------------------------------------------------------------- */

export type Person = {
  /** First name only — how the team is introduced on this site. */
  name: string;
  role: string;
  /** A line or two, in their own words. Omitted until they've written it. */
  bio?: string;
  /** Path under public/, e.g. "/team/erin.jpg". Falls back to an initial monogram. */
  photo?: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
};

const caseStudies: CaseStudy[] = [];

export const site = {
  name: "Hack Cove",
  legalName: "Hack Cove (Pty) Ltd",
  url: "https://hack-cove.com",

  /** The hero line. */
  tagline: "Hack Cove builds software for small businesses.",

  /** What we actually do. */
  intro: "We design and engineer, focusing on prototyping.",

  contactEmail: "hello@hack-cove.com",

  team: [
    { name: "Jacobus", role: "Engineer" },
    { name: "Erin", role: "Design Engineer" },
    { name: "Silindile", role: "Client Service agent" },
  ] satisfies Person[],

  /** Out of scope for now (ticket 164); the team page renders nothing when empty. */
  caseStudies,
};

/** The monogram shown when a person has no photo. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
