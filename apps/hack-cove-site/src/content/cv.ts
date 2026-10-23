/* ---------------------------------------------------------------------------
   Public CV copy, in one typed place.
   ---------------------------------------------------------------------------
   One set of facts across OfferZen, the downloaded CV, and this page:
   OfferZen wins on current role, dates, titles, and descriptions; the PDF
   supplies photo, email, grouped skills, and education grades. Storybook
   letter, salary, notice, looking flags, leaving reasons, and blocked
   companies stay off.
   --------------------------------------------------------------------------- */

export type CvLink = {
  label: string;
  href: string;
};

export type CvHighlightGroup = {
  heading?: string;
  items: string[];
};

export type CvJob = {
  company: string;
  title: string;
  dates: string;
  location?: string;
  summary?: string;
  groups: CvHighlightGroup[];
  tech?: string;
};

export type CvEarlierRole = {
  company: string;
  title: string;
  dates: string;
  summary: string;
};

export type CvSkillGroup = {
  label: string;
  items: string[];
};

export const cv = {
  name: "Jacobus Langner",
  headline: "Staff-level Engineer",
  location: "Cape Town",
  photo: "/cv/jacobus.jpg",
  pdf: "/cv/jacobus.pdf",
  summary:
    "Staff-level engineer with 18 years in production TypeScript/React. I started Hack Cove in April 2026 to do contract work. Cue is my current client — I'm building their voice product (live call and transfer flows) remotely in a distributed team. At Zappi I owned the front-end guild and the shared UI platform. I enjoy TypeScript, C#, and Python, but I'm happy to learn whatever gets the job done well.",

  links: [
    { label: "jacobus@hack-cove.com", href: "mailto:jacobus@hack-cove.com" },
    { label: "+27 78 629 4044", href: "tel:+27786294044" },
    { label: "GitHub: madangryscientist", href: "https://github.com/madangryscientist" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/jacobuslangner/" },
  ] satisfies CvLink[],

  experience: [
    {
      company: "Hack Cove",
      title: "Founder / Contract Engineer",
      dates: "April 2026 – Present",
      location: "Remote",
      summary:
        "I started Hack Cove to do engineering contract work. Cue is my current client.\n\nFor Cue I have been building the Voice Inbox and live call and transfer flows in the TypeScript/React app.\n\nI work on the calls inbox as a product surface: listings, inbound answer that opens the voice session and contact context, and realtime updates. The call UI is a floating modal with a dialer, mic and speaker selection, and recipient and contact search.\n\nI have also been implementing cold and warm transfers, including a transfer picker with live directory and presence, and in-flight actions to pull a transfer back, complete it, or mute.",
      groups: [],
      tech: "TypeScript, React, Python",
    },
    {
      company: "Zappi",
      title: "Senior Frontend Engineer",
      dates: "April 2021 – April 2026",
      location: "Remote",
      summary:
        "Working in a fully remote, distributed team maintaining shared UI component libraries and driving modernization of the frontend tooling stack. I owned and led the front-end guild for the last year there, driving technical direction and best practices across teams.",
      groups: [
        {
          items: [
            "Maintain a TypeScript monorepo of 60+ packages: shared UI components and tooling consumed by multiple frontend applications. Design library APIs balancing end-user simplicity with extensibility for internal consumers.",
            "Jest to Vitest: reduced test suite runtime from 90s to 58s (35% faster), with 60% faster transforms using SWC—100% pass rate across 1,126 tests",
            "Cypress to Playwright: reduced E2E test runtime from 30 minutes to 5 minutes (83% faster)",
            "Migrated library builds from CommonJS to ESM-only using tsdown, reducing build time from 120s to 5s (96% faster)",
            "Refactored microfrontend architecture to library-based imports, reducing bundle size from 41MB to 24MB (41% reduction)",
            "React 18 migration, resolving concurrent rendering issues across a large codebase",
            "Redux to React Query and Zustand, modernizing state management and data fetching patterns application-wide",
            "Managed NX monorepo upgrades (v21 → v22) with build caching optimization",
          ],
        },
      ],
      tech: "TypeScript, Next.js, React, Ruby, Storybook, Playwright, Cypress, Amazon SQS",
    },
    {
      company: "FMI",
      title: "Frontend-API Architect",
      dates: "June 2018 – March 2021",
      location: "Remote",
      summary:
        "Led digital transformation of paper-based workflows at a life insurance company, architecting secure web applications handling sensitive medical and financial data. Built Kubernetes clusters from scratch and transformed releases from monthly FTP deployments to continuous delivery. Designed workflow engines for policy applications, claims processing, and underwriting. Architected role-based access control and POPI Act compliance patterns.",
      groups: [],
      tech: "Docker, TypeScript, C#, Next.js, React, Angular, Vue, Kubernetes",
    },
    {
      company: "Wonga",
      title: "Software Development Team Lead",
      dates: "August 2015 – May 2018",
      location: "Office-based",
      summary:
        "Starting as a back-end developer. Soon I moved into a technical lead developer position on the front-end as we migrated from our PHP site into an AngularJS site with ASP.NET Core Web API.\n\nAfter the completion of that project I was promoted to team lead where we developed new products in a full-stack environment. We developed isolated microservices using the CQRS pattern to scale and RabbitMQ to be more durable.\n\nThese efforts led to my team being awarded the CEO Recognition Award.\n\nIn mid-2017, I started doing more architectural work to help move away from our legacy system.",
      groups: [],
      tech: "C#, Octopus Deploy, AngularJS, RabbitMQ",
    },
  ] satisfies CvJob[],

  earlierRoles: [
    {
      company: "Sygnia Ltd",
      title: "Software Developer",
      dates: "September 2014 – August 2015",
      summary:
        "I worked as the bridge between web developers and the server-side developers, in an asset management and finance driven environment. I was often tasked with speeding up queries.",
    },
    {
      company: "Property24",
      title: "Software Developer",
      dates: "August 2011 – August 2014",
      summary:
        "As part of the Property24 team, I was involved with developing, maintaining and monitoring one of South Africa's most visited websites. This required software that scaled across multiple servers, with a heavy emphasis on caching. We upgraded from ASP Classic to ASP.NET to ASP MVC.",
    },
    {
      company: "ACI Worldwide",
      title: "Software Developer",
      dates: "January 2010 – August 2011",
      summary:
        "Java on Windows and AIX, SQL Server and DB2. First year on JSP bug fixes, then 3rd-level support for PostCard; patches across multiple versions and platforms.",
    },
    {
      company: "Business Intelligence",
      title: "Software Developer",
      dates: "July 2009 – December 2009",
      summary:
        "C# and ASP.NET. Most of the work was upgrading from ASP.NET 1.1 to ASP.NET 3.5; Ajax processing was the main focus, plus SQL Server 2008.",
    },
    {
      company: "Axxess Dsl",
      title: "Software Developer",
      dates: "September 2008 – July 2009",
      summary:
        "C# Windows applications, Windows services, ASP.NET 2 websites and web services. Basic knowledge of MySQL.",
    },
  ] satisfies CvEarlierRole[],

  education: {
    qualification: "Bachelor of Science (BSc), Computer Science",
    school: "NMMU, Port Elizabeth",
    detail:
      "2005–2008 • Automata Theory 83% • Linear Optimization 88% • Advanced Programming 71%/76%",
  },

  skills: [
    { label: "Languages", items: ["TypeScript", "JavaScript", "C#", "Python", "Ruby"] },
    { label: "Frameworks", items: ["React", "Next.js", "Angular", "Vue"] },
    { label: "Build Tools", items: ["Vite", "Vitest", "NX", "Webpack", "tsdown", "Biome"] },
    { label: "Testing", items: ["Vitest", "Playwright", "Storybook", "Chromatic"] },
    { label: "Infrastructure", items: ["GitHub Actions", "GitLab CI", "Kubernetes", "Docker"] },
    { label: "Databases", items: ["PostgreSQL", "SQL Server", "MongoDB"] },
    { label: "Spoken", items: ["English (Native)", "Afrikaans (Fluent)"] },
  ] satisfies CvSkillGroup[],
};

export type Cv = typeof cv;
