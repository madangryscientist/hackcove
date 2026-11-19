import {
  BulletItem,
  BulletList,
  Callout,
  Code,
  CodeBlock,
  SectionHeading,
  Stack,
  SubsectionHeading,
  Text,
  TextLink,
} from "@slashsuite/ui-react";

/**
 * A short doc page: an h2, a paragraph, an h3, a list with a link and inline `Code`, an h4, a
 * `Callout` and a `CodeBlock`. The Prose story draws it with and without a `Prose` around it, and
 * the Gallery draws it inside one.
 */
export function ProseDoc() {
  return (
    <Stack gap="md">
      <SectionHeading>Install the kit</SectionHeading>
      <Text>
        Add the package, import its parts and build a page from them. The themes are a separate
        package, so a new theme never changes a component.
      </Text>
      <SubsectionHeading>What you need</SubsectionHeading>
      <BulletList>
        <BulletItem>
          React 19 and Tailwind v4, as in the <TextLink href="/ui/">component docs</TextLink>.
        </BulletItem>
        <BulletItem>
          Run <Code>bun add @slashsuite/ui-react</Code> in your app.
        </BulletItem>
      </BulletList>
      <SubsectionHeading as="h4" size="sm">
        Check the install
      </SubsectionHeading>
      <Callout tone="info" title="Note">
        Import a theme once, at the root of the app.
      </Callout>
      <CodeBlock label="bash" language="bash">
        bun add @slashsuite/ui-react @slashsuite/themes
      </CodeBlock>
    </Stack>
  );
}
