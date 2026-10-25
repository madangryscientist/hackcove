import { Section } from "@hackcove/ui";
import { site } from "../content/site";
import { StatusCard } from "./StatusCard";

/**
 * The projects, straight from `site.projects`: copy, status and links are edits
 * to the content file, and the section renders nothing while the list is empty.
 */
export function Projects() {
  if (site.projects.length === 0) return null;

  return (
    <Section title="Projects" width="narrow" className="pb-16 sm:pb-24">
      {site.projects.map((project) => (
        <StatusCard
          key={project.slug}
          title={project.name}
          status={project.status}
          summary={project.summary}
          items={project.details}
          links={project.links}
        />
      ))}
    </Section>
  );
}
