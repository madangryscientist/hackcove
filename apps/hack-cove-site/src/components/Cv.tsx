import {
  Body,
  BodyStrong,
  Caption,
  Card,
  PageHeader,
  SectionHeading,
  SubsectionHeading,
} from "@hackcove/ui";
import { cv, type CvJob } from "../content/cv";
import { site } from "../content/site";

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {items.map((line) => (
        <li key={line}>
          <Body>{line}</Body>
        </li>
      ))}
    </ul>
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
        <Body key={para} as="p" className="mt-2">
          {para}
        </Body>
      ))}
      {job.groups.map((group) => (
        <div key={group.heading ?? group.items[0]} className="mt-3">
          {group.heading && <BodyStrong as="p">{group.heading}</BodyStrong>}
          <Bullets items={group.items} />
        </div>
      ))}
      {job.tech && (
        <Caption as="p" className="mt-3">
          Tech: {job.tech}
        </Caption>
      )}
    </article>
  );
}

function CvHeader() {
  return (
    <PageHeader
      breadcrumbs={
        <p className="cv-screen-nav">
          <a className="link text-sm" href="/">
            {site.name}
          </a>
          <Caption aria-hidden="true" className="mx-3">
            ·
          </Caption>
          <a className="link text-sm" href={cv.pdf} download="jacobus.pdf">
            Download PDF
          </a>
        </p>
      }
      title={cv.name}
      subtitle={
        <>
          {cv.headline} · {cv.location}
        </>
      }
      actions={
        <img
          src={cv.photo}
          alt={cv.name}
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 rounded-full object-cover"
        />
      }
      tabs={
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {cv.links.map((link, i) => (
            <span key={link.href} className="inline-flex items-center gap-x-3 whitespace-nowrap">
              {i > 0 && <Caption aria-hidden="true">•</Caption>}
              <a className="link" href={link.href}>
                {link.label}
              </a>
            </span>
          ))}
        </p>
      }
    />
  );
}

function Experience() {
  return (
    <section className="mt-12">
      <SectionHeading className="mb-4 border-b border-slate-200/70 pb-2">Experience</SectionHeading>
      <div className="grid gap-10">
        {cv.experience.map((job) => (
          <Job key={job.company} job={job} />
        ))}
        <div className="cv-job">
          <SubsectionHeading>Earlier Roles</SubsectionHeading>
          <ul className="mt-3 space-y-2">
            {cv.earlierRoles.map((role) => (
              <li key={role.company}>
                <Body as="p">
                  <BodyStrong>
                    {role.title} — {role.company} ({role.dates})
                  </BodyStrong>
                  {" — "}
                  {role.summary}
                </Body>
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
    <div className="cv max-w-3xl">
      <CvHeader />

      <Card>
        <Body as="p" className="italic">
          {cv.summary}
        </Body>
      </Card>

      <Experience />

      <section className="mt-12">
        <SectionHeading className="mb-4 border-b border-slate-200/70 pb-2">
          Education
        </SectionHeading>
        <SubsectionHeading>
          {cv.education.qualification} — {cv.education.school}
        </SubsectionHeading>
        <Caption as="p" className="mt-1" color="brand">
          {cv.education.detail}
        </Caption>
      </section>

      <section className="mt-12">
        <SectionHeading className="mb-4 border-b border-slate-200/70 pb-2">Skills</SectionHeading>
        <dl className="grid gap-2">
          {cv.skills.map((group, i) => (
            <div key={`${group.label}-${i}`} className="flex flex-wrap gap-x-2">
              <BodyStrong as="dt">{group.label}:</BodyStrong>
              <Body as="dd">{group.items.join(", ")}</Body>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
