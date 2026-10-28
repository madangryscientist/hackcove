import {
  Card,
  CardGrid,
  Code,
  CodeBlock,
  InlineLinks,
  Section,
  Stack,
  Text,
  TextLink,
} from "@hackcove/ui";
import { componentSections } from "../content/components/index";
import { site } from "../content/site";
import { themes } from "../content/themes";
import { StatusCard } from "./StatusCard";

const { ui } = site;

function Install() {
  return (
    <Section title={ui.install.title} gap="md">
      {ui.install.steps.map((step) => (
        <Stack key={step.text} gap="xs">
          <Text as="p">{step.text}</Text>
          {step.code !== undefined && (
            <CodeBlock
              lines={[step.code].flat()}
              label={step.label ?? "bash"}
              language={step.language}
            />
          )}
        </Stack>
      ))}
    </Section>
  );
}

function Themes() {
  return (
    <Section title={ui.themes.title} gap="md">
      <Text as="p">{ui.themes.intro}</Text>
      <CardGrid columns={2}>
        {themes.map((theme) => (
          <Card key={theme.folder} as="article" title={theme.title}>
            <Stack gap="sm">
              <Text as="p">{theme.description}</Text>
              <Stack gap="xs">
                <Text as="p" color="tertiary">
                  <Code>{theme.name}</Code>
                </Text>
                <Text as="p" color="tertiary">
                  {ui.themes.scopeLabel}: <Code>{theme.scopeClass}</Code>
                </Text>
              </Stack>
            </Stack>
          </Card>
        ))}
      </CardGrid>
    </Section>
  );
}

function Components() {
  return (
    <Section title={ui.components.title} gap="md">
      <Text as="p">{ui.components.intro}</Text>
      <CardGrid columns={2}>
        {componentSections.map((section) => (
          <Card key={section.title} as="article" title={section.title} count={section.pages.length}>
            <Stack gap="sm">
              <Text as="p">{section.description}</Text>
              <InlineLinks separator="none">
                {section.pages.map((page) => (
                  <TextLink key={page.slug} href={`/ui/${page.slug}/`}>
                    {page.name}
                  </TextLink>
                ))}
              </InlineLinks>
            </Stack>
          </Card>
        ))}
      </CardGrid>
    </Section>
  );
}

/** Getting started: the purpose, install, themes, the component docs and where to find it. */
export function UiPage() {
  return (
    <Stack gap="xl">
      <Stack gap="md">
        {ui.intro.map((paragraph) => (
          <Text as="p" key={paragraph}>
            {paragraph}
          </Text>
        ))}
      </Stack>
      <Install />
      <Themes />
      <Components />
      <StatusCard
        title={ui.docs.title}
        status={ui.docs.status}
        summary={ui.docs.text}
        links={ui.docs.links}
      />
      <Section title={ui.links.title}>
        <InlineLinks>
          {ui.links.items.map((link) => (
            <TextLink key={link.href} href={link.href}>
              {link.label}
            </TextLink>
          ))}
        </InlineLinks>
      </Section>
    </Stack>
  );
}
