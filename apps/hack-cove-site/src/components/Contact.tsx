import { Caption, MetaList, SectionHeading, Stack, Text, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

/**
 * Email only — there is deliberately no contact form (ticket 164), which is also
 * why the site needs no server: a form would arrive later as its own section
 * plus a Worker, without changing anything here.
 */
export function Contact() {
  return (
    <Stack width="narrow" gap="lg">
      <Stack gap="xs">
        <SectionHeading>Get in touch</SectionHeading>
        <Text as="p">
          Email <TextLink href={`mailto:${site.contactEmail}`}>{site.contactEmail}</TextLink>.
        </Text>
      </Stack>
      <Stack gap="xs">
        <Caption as="p">{site.legalName}</Caption>
        <MetaList nowrap>
          <TextLink href="/privacy">Privacy</TextLink>
          <TextLink href="/terms">Terms</TextLink>
        </MetaList>
      </Stack>
    </Stack>
  );
}
