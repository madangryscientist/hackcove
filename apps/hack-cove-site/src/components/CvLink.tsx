import { Body, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

export function CvLink() {
  return (
    <Body as="p">
      <TextLink href={site.contracting.cv.href}>{site.contracting.cv.text}</TextLink>
    </Body>
  );
}
