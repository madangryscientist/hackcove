import { Text, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

export function CvLink() {
  return (
    <Text as="p">
      <TextLink href={site.contracting.cv.href}>{site.contracting.cv.text}</TextLink>
    </Text>
  );
}
