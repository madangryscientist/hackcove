import { Body, Stack, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

export function CvLink() {
  return (
    <Stack width="narrow" className="pb-16 sm:pb-24">
      <Body as="p">
        <TextLink href={site.contracting.cv.href}>{site.contracting.cv.text}</TextLink>
      </Body>
    </Stack>
  );
}
