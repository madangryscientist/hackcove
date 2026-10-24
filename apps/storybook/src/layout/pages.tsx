import { useId } from "react";
import {
  Body,
  BodyStrong,
  Breadcrumbs,
  Button,
  Card,
  CardGrid,
  DetailLayout,
  Empty,
  Field,
  FilterGroup,
  FormLayout,
  Input,
  KeyValue,
  KeyValueList,
  ListLayout,
  Pill,
  ProseLayout,
  Section,
  Select,
  Textarea,
  ToggleChip,
  crumbLinkClass,
} from "@hackcove/ui";

// Realistic page bodies, shared by the layout stories and the Pages stories. Each is the layout
// plus content; none sets a width or padding of its own.

const quotes = [
  ["Q-1042", "Naledi Mokoena", "R 1 240 / mo", "Accepted"],
  ["Q-1041", "Pieter van Wyk", "R 860 / mo", "Sent"],
  ["Q-1040", "Aisha Patel", "R 2 015 / mo", "Draft"],
  ["Q-1039", "Thabo Dlamini", "R 540 / mo", "Sent"],
] as const;

export function ListPage({ isEmpty = false }: { isEmpty?: boolean }) {
  return (
    <ListLayout
      title="Quotes"
      subtitle="Every quote you have sent."
      actions={<Button>New quote</Button>}
      filters={
        <FilterGroup legend="Status">
          <ToggleChip pressed>All</ToggleChip>
          <ToggleChip pressed={false}>Draft</ToggleChip>
          <ToggleChip pressed={false}>Sent</ToggleChip>
          <ToggleChip pressed={false}>Accepted</ToggleChip>
        </FilterGroup>
      }
      isEmpty={isEmpty}
      empty={<Empty>No quotes match these filters.</Empty>}
    >
      {quotes.map(([ref, name, premium, status]) => (
        <Card key={ref} as="article">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <BodyStrong as="p">{name}</BodyStrong>
              <Body as="p" color="secondary">
                {ref} · {premium}
              </Body>
            </div>
            <Pill tone={status === "Accepted" ? "emerald" : "slate"}>{status}</Pill>
          </div>
        </Card>
      ))}
    </ListLayout>
  );
}

export function DetailPage() {
  return (
    <DetailLayout
      breadcrumbs={
        <Breadcrumbs
          crumbs={[
            <a key="quotes" href="#quotes" className={crumbLinkClass}>
              Quotes
            </a>,
            "Q-1042",
          ]}
        />
      }
      title="Quote Q-1042"
      subtitle="Naledi Mokoena"
      actions={
        <>
          <Button variant="outline">Edit</Button>
          <Button>Send</Button>
        </>
      }
      aside={
        <Card title="Status">
          <KeyValueList>
            <KeyValue label="State">Accepted</KeyValue>
            <KeyValue label="Premium">R 1 240 / mo</KeyValue>
            <KeyValue label="Sent">12 Oct 2026</KeyValue>
            <KeyValue label="Valid until">11 Nov 2026</KeyValue>
          </KeyValueList>
        </Card>
      }
    >
      <Card title="Cover">
        <Body as="p">Life cover of R 1 500 000 with a funeral benefit, to age 65.</Body>
      </Card>
      <Card title="Notes">
        <Body as="p">Client asked for the premium to be debited on the 25th.</Body>
      </Card>
    </DetailLayout>
  );
}

export function FormPage() {
  const id = useId();
  return (
    <FormLayout
      title="New quote"
      subtitle="Start with who it is for."
      onSubmit={(event) => event.preventDefault()}
      actions={
        <>
          <Button type="submit">Save quote</Button>
          <Button variant="ghost">Cancel</Button>
        </>
      }
    >
      <Card title="Client">
        <div className="flex flex-col gap-4">
          <Field label="Full name" htmlFor={`${id}-name`}>
            <Input id={`${id}-name`} placeholder="Naledi Mokoena" />
          </Field>
          <Field
            label="Cover"
            htmlFor={`${id}-cover`}
            hint="Monthly premium is worked out on save."
          >
            <Select id={`${id}-cover`} defaultValue="1500000">
              <option value="500000">R 500 000</option>
              <option value="1500000">R 1 500 000</option>
              <option value="3000000">R 3 000 000</option>
            </Select>
          </Field>
        </div>
      </Card>
      <Card title="Notes">
        <Field label="Notes" htmlFor={`${id}-notes`}>
          <Textarea id={`${id}-notes`} />
        </Field>
      </Card>
    </FormLayout>
  );
}

export function ProsePage() {
  return (
    <ProseLayout
      breadcrumbs={
        <Breadcrumbs
          crumbs={[
            <a key="home" href="#home" className={crumbLinkClass}>
              Hack Cove
            </a>,
            "Privacy",
          ]}
        />
      }
      title="Privacy"
      subtitle="Last updated 12 October 2026"
      gap="lg"
    >
      <Section title="What we collect">
        <Body as="p">
          We keep the email address you write to us from and nothing else: no cookies, no analytics
          and no accounts. A message stays in one inbox until the question it asks is answered.
        </Body>
        <Body as="p">
          This paragraph is long on purpose: the column stops at the reading measure, so a line
          holds a comfortable number of words however wide the window is.
        </Body>
      </Section>
      <Section title="Who to ask">
        <Body as="p">Write to the address in the footer and we reply within a working week.</Body>
      </Section>
    </ProseLayout>
  );
}

const stats = [
  ["Open quotes", "14"],
  ["Accepted this month", "6"],
  ["Premium written", "R 18 420"],
  ["Lapse rate", "1.8%"],
] as const;

export function StatTiles({ columns }: { columns: 2 | 3 | 4 }) {
  return (
    <CardGrid columns={columns}>
      {stats.slice(0, columns).map(([label, value]) => (
        <Card key={label} title={label}>
          <p className="text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
        </Card>
      ))}
    </CardGrid>
  );
}
