import { Text, TextLink } from "@slashsuite/ui-react";
import { site } from "../content/site";

export function CvLink() {
  return (
    <Text>
      <TextLink href={site.contracting.cv.href}>{site.contracting.cv.text}</TextLink>
    </Text>
  );
}
