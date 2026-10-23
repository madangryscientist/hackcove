import { Avatar, Body, Card, Section, SubsectionHeading } from "@hackcove/ui";
import { type Person, site } from "../content/site";

function TeamAvatar({ person }: { person: Person }) {
  if (person.photo) {
    return (
      <img
        src={person.photo}
        alt={person.name}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
    );
  }
  return <Avatar name={person.name} size="lg" />;
}

function TeamMember({ person }: { person: Person }) {
  return (
    <div className="flex items-start gap-4">
      <TeamAvatar person={person} />
      <div className="min-w-0">
        <SubsectionHeading>{person.name}</SubsectionHeading>
        <Body as="p" className="mt-0.5" color="tertiary">
          {person.role}
        </Body>
        {person.bio && (
          <Body as="p" className="mt-2">
            {person.bio}
          </Body>
        )}
      </div>
    </div>
  );
}

export function Team() {
  return (
    <Section title="The team" className="max-w-3xl pb-16 sm:pb-24">
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
