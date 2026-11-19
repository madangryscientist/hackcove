import {
  Avatar,
  BulletItem,
  BulletList,
  Caption,
  Card,
  MetaList,
  ProseLayout,
  SectionHeading,
  SubsectionHeading,
  Text,
  TextLink,
} from "@hackcove/ui-react";
import { Fragment, type ReactNode } from "react";
import { cv, type CvHighlightGroup, type CvJob } from "../content/cv";
import { site } from "../content/site";

function Bullets({ items }: { items: string[] }) {
  return (
    <BulletList>
      {items.map((line) => (
        <BulletItem key={line}>{line}</BulletItem>
      ))}
    </BulletList>
  );
}

/**
 * A group's heading, with any link whose label it already names set inline as that link, so the
 * label is not printed again on a line of its own.
 */
function GroupHeading({ group }: { group: CvHighlightGroup }) {
  const heading = group.heading ?? "";
  const link = group.links?.find((candidate) => heading.includes(candidate.label));
  if (!link) return <Text strong>{heading}</Text>;
  const at = heading.indexOf(link.label);
  return (
    <Text strong>
      {heading.slice(0, at)}
      <TextLink href={link.href}>{link.label}</TextLink>
      {heading.slice(at + link.label.length)}
    </Text>
  );
}

function GroupLinks({ group }: { group: CvHighlightGroup }) {
  const links = group.links?.filter((link) => !group.heading?.includes(link.label)) ?? [];
  if (links.length === 0) return null;
  return (
    <Text>
      {links.map((link, index) => (
        <Fragment key={link.href}>
          {index > 0 && " · "}
          <TextLink href={link.href}>{link.label}</TextLink>
        </Fragment>
      ))}
    </Text>
  );
}

/**
 * One group of a job: its heading and first bullet in a `cv-keep` block that print never splits, so
 * a page break can fall between bullets but never strands a heading. `lead` (the job's title row and
 * summary, for its first group) joins that block. The rest of the bullets follow in a second list
 * set the same distance below.
 */
function Group({ group, lead }: { group: CvHighlightGroup; lead?: ReactNode }) {
  const [first = "", ...more] = group.items;
  return (
    <>
      <div className="cv-keep">
        {lead}
        <div className="mt-3">
          {group.heading && <GroupHeading group={group} />}
          <Bullets items={[first]} />
        </div>
      </div>
      {more.length > 0 && (
        <div className="mt-1">
          <Bullets items={more} />
        </div>
      )}
      <GroupLinks group={group} />
    </>
  );
}

function Job({ job }: { job: CvJob }) {
  const lead = (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <SubsectionHeading>
          {job.title}, {job.company}
        </SubsectionHeading>
        <Caption tone="accent">
          {job.location ? `${job.dates} (${job.location})` : job.dates}
        </Caption>
      </div>
      {job.summary?.split("\n\n").map((para) => (
        <Text key={para}>{para}</Text>
      ))}
    </>
  );
  return (
    <article className="cv-job">
      {job.groups.map((group, index) => (
        <Group
          key={group.heading ?? group.items[0]}
          group={group}
          lead={index === 0 ? lead : undefined}
        />
      ))}
      {job.tech && <Caption>Tech: {job.tech}</Caption>}
    </article>
  );
}

function Experience() {
  return (
    <section className="mt-12">
      <SectionHeading rule>Experience</SectionHeading>
      <div className="grid gap-10">
        {cv.experience.map((job) => (
          <Job key={job.company} job={job} />
        ))}
        <div className="cv-job">
          <SubsectionHeading>Earlier Roles</SubsectionHeading>
          <ul className="mt-3 space-y-4">
            {cv.earlierRoles.map((role) => (
              <li key={role.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <Text as="span" strong>
                    {role.title}, {role.company}
                  </Text>
                  <Caption as="span" tone="accent">
                    {role.dates}
                  </Caption>
                </div>
                <Text>{role.summary}</Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * The headline and location, split at each " · ". Each part is an inline block that carries the
 * separator after it, so a wrap falls between parts ("Cape Town" stays whole) and never puts a
 * separator at the start of a line.
 */
function HeadlineParts() {
  const parts = [...cv.headline.split(" · "), cv.location];
  return parts.map((part, index) => (
    <Fragment key={part}>
      {index > 0 && " "}
      <span className="inline-block">{index < parts.length - 1 ? `${part} ·` : part}</span>
    </Fragment>
  ));
}

export function Cv() {
  return (
    <div className="cv">
      <ProseLayout
        breadcrumbs={
          <div className="cv-screen-nav">
            <MetaList>
              <TextLink href="/">{site.name}</TextLink>
              <TextLink href={cv.pdf} download="jacobus.pdf">
                Download PDF
              </TextLink>
            </MetaList>
          </div>
        }
        title={cv.name}
        description={<HeadlineParts />}
        actions={<Avatar name={cv.name} src={cv.photo} size="3xl" />}
        tabs={
          <MetaList separator="•">
            {cv.links.map((link) => (
              <TextLink key={link.href} href={link.href}>
                {link.label}
              </TextLink>
            ))}
          </MetaList>
        }
      >
        {/* One block, so the sections keep their own mt-12 rhythm: no Stack gap is 48px. */}
        <div>
          <Card>
            <Text>{cv.summary}</Text>
          </Card>

          <Experience />

          <section className="mt-12">
            <SectionHeading rule>Education</SectionHeading>
            <SubsectionHeading>
              {cv.education.qualification} ({cv.education.school})
            </SubsectionHeading>
            <Caption tone="accent">{cv.education.detail}</Caption>
          </section>

          <section className="mt-12">
            <SectionHeading rule>Skills</SectionHeading>
            {/* Label above items on a phone; from sm up (and in print) a bold label column sized
                to the longest label, with each group's items wrapping in the second column. */}
            <dl className="grid gap-2 sm:grid-cols-[max-content_1fr] sm:gap-x-4">
              {cv.skills.map((group, i) => (
                <div
                  key={`${group.label}-${i}`}
                  className="sm:col-span-2 sm:grid sm:grid-cols-subgrid"
                >
                  <Text as="dt">
                    <strong>{group.label}:</strong>
                  </Text>
                  <Text as="dd">{group.items.join(", ")}</Text>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </ProseLayout>
    </div>
  );
}
