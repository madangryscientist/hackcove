import { Button, Section, SiteFooter, Text } from "@hackcove/ui-react";

/** The marketing blocks of the Gallery's header slice: a Section size lg and a SiteFooter. */
export function GalleryMarketing() {
  return (
    <>
      <Section
        size="lg"
        overline="Section size lg"
        title="A landing section."
        description="A kicker, a display title and a lede, then its calls to action."
        actions={<Button variant="outline">Read more</Button>}
      >
        <Text>The section's blocks, lg apart.</Text>
      </Section>

      <SiteFooter
        brand="Hack Cove"
        brandLabel="Hack Cove home"
        links={[
          { label: "Privacy", href: "#privacy" },
          { label: "Terms", href: "#terms" },
        ]}
        notes={["SiteFooter: the fine print under the links."]}
      >
        <Text>Email hello@example.com</Text>
      </SiteFooter>
    </>
  );
}
