import {
  Card,
  CodeBlock,
  MetaList,
  Prose,
  Section,
  Stack,
  Text,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextLink,
} from "@hackcove/ui-react";
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
      <Table caption={ui.themes.title}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>{ui.themes.themeLabel}</TableHeaderCell>
            <TableHeaderCell>{ui.themes.importLabel}</TableHeaderCell>
            <TableHeaderCell>{ui.themes.scopeLabel}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {themes.map((theme) => (
            <TableRow key={theme.id}>
              <TableCell tone="strong">{theme.title}</TableCell>
              <TableCell mono>{theme.specifier}</TableCell>
              <TableCell mono>{theme.scopeClass}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
}

function Components() {
  return (
    <Section title={ui.components.title} gap="md">
      <Text as="p">{ui.components.intro}</Text>
      <Stack gap="md">
        {componentSections.map((section) => (
          <Card
            key={section.title}
            as="article"
            icon={section.icon}
            title={section.title}
            count={section.pages.length}
          >
            <Stack gap="sm">
              <Text as="p">{section.description}</Text>
              <MetaList nowrap>
                {section.pages.map((page) => (
                  <TextLink key={page.slug} href={`/ui/${page.slug}/`}>
                    {page.name}
                  </TextLink>
                ))}
              </MetaList>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Section>
  );
}

/** Getting started: the purpose, install, themes, the component docs and where to find it. */
export function UiPage() {
  return (
    <Prose>
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
          <MetaList nowrap>
            {ui.links.items.map((link) => (
              <TextLink key={link.href} href={link.href}>
                {link.label}
              </TextLink>
            ))}
          </MetaList>
        </Section>
      </Stack>
    </Prose>
  );
}
