import { Body, Card, CardGrid, Section, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

/** The home page's way into the three sections: one card each, from `site.sections`. */
export function SectionCards() {
  return (
    <Section title="Explore">
      <CardGrid>
        {site.sections.map((section) => (
          <Card key={section.slug} as="article" title={section.name}>
            <Body as="p">{section.summary}</Body>
            <Body as="p" className="mt-4">
              <TextLink href={section.href}>{section.cta}</TextLink>
            </Body>
          </Card>
        ))}
      </CardGrid>
    </Section>
  );
}
