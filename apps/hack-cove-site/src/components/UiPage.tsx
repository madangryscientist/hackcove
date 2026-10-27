import {
  Body,
  Card,
  CardGrid,
  Code,
  CodeBlock,
  InlineLinks,
  Section,
  Stack,
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
          <Body as="p">{step.text}</Body>
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
      <Body as="p">{ui.themes.intro}</Body>
      <CardGrid columns={2}>
        {themes.map((theme) => (
          <Card key={theme.folder} as="article" title={theme.title}>
            <Stack gap="sm">
              <Body as="p">{theme.description}</Body>
              <Stack gap="xs">
                <Body as="p" color="tertiary">
                  <Code>{theme.name}</Code>
                </Body>
                <Body as="p" color="tertiary">
                  {ui.themes.scopeLabel}: <Code>{theme.scopeClass}</Code>
                </Body>
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
      <Body as="p">{ui.components.intro}</Body>
      <CardGrid columns={2}>
        {componentSections.map((section) => (
          <Card key={section.title} as="article" title={section.title} count={section.pages.length}>
            <Stack gap="sm">
              <Body as="p">{section.description}</Body>
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
          <Body as="p" key={paragraph}>
            {paragraph}
          </Body>
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
