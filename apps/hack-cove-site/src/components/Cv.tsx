import {
  Avatar,
  BulletList,
  Caption,
  Card,
  MetaList,
  ProseLayout,
  SectionHeading,
  SubsectionHeading,
  Text,
  TextLink,
} from "@hackcove/ui";
import { cv, type CvJob } from "../content/cv";
import { site } from "../content/site";

function Bullets({ items }: { items: string[] }) {
  return (
    <BulletList>
      {items.map((line) => (
        <li key={line}>
          <Text>{line}</Text>
        </li>
      ))}
    </BulletList>
  );
}

function Job({ job }: { job: CvJob }) {
  return (
    <article className="cv-job">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <SubsectionHeading>
          {job.title} — {job.company}
        </SubsectionHeading>
        <Caption color="brand">{job.dates}</Caption>
      </div>
      {job.summary?.split("\n\n").map((para) => (
        <Text key={para} as="p">
          {para}
        </Text>
      ))}
      {job.groups.map((group) => (
        <div key={group.heading ?? group.items[0]} className="mt-3">
          {group.heading && (
            <Text strong as="p">
              {group.heading}
            </Text>
          )}
          <Bullets items={group.items} />
        </div>
      ))}
      {job.tech && <Caption as="p">Tech: {job.tech}</Caption>}
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
          <ul className="mt-3 space-y-2">
            {cv.earlierRoles.map((role) => (
              <li key={role.company}>
                <Text as="p">
                  <Text strong>
                    {role.title} — {role.company} ({role.dates})
                  </Text>
                  {" — "}
                  {role.summary}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Cv() {
  return (
    <div className="cv">
      <ProseLayout
        breadcrumbs={
          <div className="cv-screen-nav">
            <MetaList nowrap>
              <TextLink href="/">{site.name}</TextLink>
              <TextLink href={cv.pdf} download="jacobus.pdf">
                Download PDF
              </TextLink>
            </MetaList>
          </div>
        }
        title={cv.name}
        subtitle={
          <>
            {cv.headline} · {cv.location}
          </>
        }
        actions={<Avatar name={cv.name} src={cv.photo} size="2xl" />}
        tabs={
          <MetaList nowrap separator="•">
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
            <Text as="p">{cv.summary}</Text>
          </Card>

          <Experience />

          <section className="mt-12">
            <SectionHeading rule>Education</SectionHeading>
            <SubsectionHeading>
              {cv.education.qualification} — {cv.education.school}
            </SubsectionHeading>
            <Caption as="p" color="brand">
              {cv.education.detail}
            </Caption>
          </section>

          <section className="mt-12">
            <SectionHeading rule>Skills</SectionHeading>
            <dl className="grid gap-2">
              {cv.skills.map((group, i) => (
                <div key={`${group.label}-${i}`} className="flex flex-wrap gap-x-2">
                  <Text strong as="dt">
                    {group.label}:
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
