import {
  Body,
  BulletList,
  Card,
  InlineLinks,
  Pill,
  Section,
  SubsectionHeading,
  TextLink,
} from "@hackcove/ui";
import { type Project, site } from "../content/site";

const STATUS = {
  available: { label: "Available", tone: "emerald" },
  "coming-soon": { label: "Coming soon", tone: "amber" },
} as const;

function ProjectCard({ project }: { project: Project }) {
  const status = STATUS[project.status];
  return (
    <Card as="article">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <SubsectionHeading>{project.name}</SubsectionHeading>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <Body as="p" className="mt-2">
        {project.summary}
      </Body>
      <BulletList className="mt-3">
        {project.details.map((detail) => (
          <Body as="li" key={detail} color="secondary">
            {detail}
          </Body>
        ))}
      </BulletList>
      {project.links && project.links.length > 0 && (
        <InlineLinks separator="none" className="mt-4">
          {project.links.map((link) => (
            <TextLink key={link.href} href={link.href}>
              {link.label}
            </TextLink>
          ))}
        </InlineLinks>
      )}
    </Card>
  );
}

/**
 * The projects, straight from `site.projects`: copy, status and links are edits
 * to the content file, and the section renders nothing while the list is empty.
 */
export function Projects() {
  if (site.projects.length === 0) return null;

  return (
    <Section title="Projects" className="max-w-3xl pb-16 sm:pb-24">
      {site.projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </Section>
  );
}
