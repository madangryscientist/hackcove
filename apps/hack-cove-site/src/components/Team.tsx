import { Avatar, Card, Section, SubsectionHeading, Text } from "@hackcove/ui";
import { type Person, site } from "../content/site";

function TeamMember({ person }: { person: Person }) {
  return (
    <div className="flex items-start gap-4">
      <Avatar name={person.name} src={person.photo} size="xl" />
      <div className="min-w-0">
        <SubsectionHeading>{person.name}</SubsectionHeading>
        <Text as="p" color="tertiary">
          {person.role}
        </Text>
        {person.bio && <Text as="p">{person.bio}</Text>}
      </div>
    </div>
  );
}

export function Team() {
  return (
    <Section title="The team">
      <Card>
        <div className="grid gap-8 sm:grid-cols-2">
          {site.team.map((person) => (
            <TeamMember key={person.name} person={person} />
          ))}
        </div>
      </Card>
    </Section>
  );
}
