import { Body, Card, Section, SubsectionHeading } from "@hackcove/ui";
import { site } from "../content/site";

/**
 * Case studies are out of scope for the front door (ticket 164), so this renders
 * nothing while `site.caseStudies` is empty. Adding one to the content file is
 * all it takes to make the section appear — no component change, no rebuild of
 * the page's structure.
 */
export function CaseStudies() {
  if (site.caseStudies.length === 0) return null;

  return (
    <Section title="Work" className="max-w-3xl pb-16 sm:pb-24">
      {site.caseStudies.map((study) => (
        <Card key={study.slug}>
          <SubsectionHeading>{study.title}</SubsectionHeading>
          <Body as="p" className="mt-1">
            {study.summary}
          </Body>
        </Card>
      ))}
    </Section>
  );
}
