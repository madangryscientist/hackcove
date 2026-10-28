import { Card, CardGrid, Section, Text, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

/** The home page's way into the three sections: one card each, from `site.sections`. */
export function SectionCards() {
  return (
    <Section title="Explore">
      <CardGrid>
        {site.sections.map((section) => (
          <Card key={section.slug} as="article" title={section.name}>
            <Text as="p">{section.summary}</Text>
            <Text as="p">
              <TextLink href={section.href}>{section.cta}</TextLink>
            </Text>
          </Card>
        ))}
      </CardGrid>
    </Section>
  );
}
