/* ---------------------------------------------------------------------------
   Public CV copy, in one typed place.
   ---------------------------------------------------------------------------
   The back-end-led CV (v2, confirmed by Jacobus 2026-11-04) is the source of
   truth for titles, dates and descriptions; the downloadable PDF is printed
   from this page. Salary, notice, looking flags, leaving reasons, blocked
   companies and "current client" call-outs stay off.
   --------------------------------------------------------------------------- */

export type CvLink = {
  label: string;
  href: string;
};

export type CvHighlightGroup = {
  heading?: string;
  items: string[];
  links?: CvLink[];
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
  headline:
    "Full-Stack Engineer · Developer productivity · APIs, messaging and platform · .NET Core, Node, Python",
  location: "Cape Town",
  photo: "/cv/jacobus.jpg",
  pdf: "/cv/jacobus.pdf",
  summary:
    "Senior full-stack engineer with 18 years of production software. Alongside delivering features, I have spent the last ten years building the architecture, APIs and tooling that let other developers excel, finding where they struggle and fixing it at the source. Back end in C#/.NET Core, Node and Python; front end in TypeScript and React. On call for the systems I build.",

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
      dates: "Apr 2026 – Present",
      location: "Remote",
      groups: [
        {
          heading: "Client: Cue (voice and telephony)",
          items: [
            "Built the Python service that integrates the app with the voice provider.",
            "Built the realtime call, transfer and presence flows on top of it in TypeScript and React: inbound answer, cold and warm transfers, and in-flight transfer actions.",
          ],
        },
        {
          heading: "PixelSlash",
          items: [
            "Built a visual-regression service on Cloudflare Workers, D1 and Queues, with a Rust/WebAssembly pixel-diff engine, queued vision review of changed regions, and an MCP server so coding agents can drive it.",
          ],
          links: [
            { label: "pixelslash.dev", href: "https://pixelslash.dev" },
            {
              label: "github.com/madangryscientist/pixelslash",
              href: "https://github.com/madangryscientist/pixelslash",
            },
          ],
        },
        {
          heading: "Omnibus",
          items: [
            "Built a multi-agent engineering system in Bun/TypeScript: a planner agent dispatches builder agents into isolated git worktrees, each runs the test gate and opens a pull request, and leases stop agents colliding.",
          ],
        },
        {
          heading: "Hack Cove UI",
          items: [
            "Built a reusable GitHub Action that reviews UI pull requests in two layers, deterministic rules then an LLM review, for an open-source React design system on npm.",
          ],
          links: [
            { label: "hack-cove.com/ui", href: "https://hack-cove.com/ui" },
            {
              label: "github.com/madangryscientist/hackcove",
              href: "https://github.com/madangryscientist/hackcove",
            },
          ],
        },
      ],
      tech: "Python, PostgreSQL, TypeScript, Node/Bun, Cloudflare Workers, D1, Queues, Drizzle, Rust/WebAssembly, React",
    },
    {
      company: "Zappi",
      title: "Senior Engineer",
      dates: "Apr 2021 – Apr 2026",
      location: "Remote",
      summary: "Developer platform and Node services · front-end guild lead (final year)",
      groups: [
        {
          items: [
            "Owned the developer platform for a 60+ package TypeScript monorepo used by 80 engineers across multiple applications.",
            "Cut library builds from 120 s to 5 s (CommonJS to ESM-only) and E2E runs from 30 to 5 min (Cypress to Playwright); moved 1,126 tests from Jest to Vitest (35% faster) and added Nx build caching.",
            "Built a Node microservice that took events from Salesforce's messaging system and republished them on SQS/SNS for other services to consume.",
            "Owned the Node.js backend-for-frontend (BFF): its build, and the APIs that sped up page loads.",
            "Led the front-end guild in the final year, setting technical direction across teams; led the React 18 migration and the move from Redux to React Query and Zustand, and cut bundle size from 41 MB to 24 MB.",
          ],
        },
      ],
      tech: "Node.js, Amazon SQS/SNS, TypeScript, Nx, Playwright, Vitest, Ruby (back-end codebase), React, Next.js",
    },
    {
      company: "FMI",
      title: "API Architect",
      dates: "Jun 2018 – Mar 2021",
      location: "Remote",
      summary: "API and platform architecture for a life insurer moving off paper",
      groups: [
        {
          items: [
            "Architected 15 API services and the workflow engines for policy applications, claims and underwriting, in C# and TypeScript.",
            "Built the company's Kubernetes clusters from scratch on Azure, and moved releases from monthly FTP drops to continuous delivery.",
            "Designed role-based access control and POPI Act compliance for medical and financial data.",
            "Delivered the React and Next.js front ends on those APIs.",
          ],
        },
      ],
      tech: "C#, .NET Core, PostgreSQL, MongoDB, Kubernetes (AKS), Docker, TypeScript, React, Next.js",
    },
    {
      company: "Wonga",
      title: "Software Development Team Lead",
      dates: "Aug 2015 – May 2018",
      location: "Office-based",
      summary: "Migration architecture and tooling · team lead",
      groups: [
        {
          items: [
            "Drove the architecture to move the business off an unsupported PHP site and NServiceBus, and was key in building the migration tooling used by three teams.",
            "Led a team of seven building new products as C# microservices with CQRS and RabbitMQ on ASP.NET Core Web API.",
            "Joined as a back-end developer, then became technical lead for the move from PHP to AngularJS on ASP.NET Core Web API. The team won the CEO Recognition Award.",
          ],
        },
      ],
      tech: "C#, ASP.NET Core Web API, RabbitMQ, NServiceBus, CQRS, Octopus Deploy, AngularJS",
    },
  ] satisfies CvJob[],

  earlierRoles: [
    {
      company: "Sygnia",
      title: "Software Developer",
      dates: "Sep 2014 – Aug 2015",
      summary: "Linked the web and server-side teams in asset management; tuned slow queries.",
    },
    {
      company: "Property24",
      title: "Software Developer",
      dates: "Aug 2011 – Aug 2014",
      summary:
        "Built and ran one of South Africa's most visited websites across multiple servers with heavy caching; upgraded it from ASP Classic to ASP.NET to ASP.NET MVC.",
    },
    {
      company: "ACI Worldwide",
      title: "Software Developer",
      dates: "Jan 2010 – Aug 2011",
      summary:
        "Java on Windows and AIX with SQL Server and DB2; third-level support and patches for the PostCard payments product.",
    },
    {
      company: "Axxess DSL and Business Intelligence",
      title: "Software Developer",
      dates: "Sep 2008 – Dec 2009",
      summary:
        "C# Windows services, web services and ASP.NET sites on SQL Server; upgrades from ASP.NET 1.1 to 3.5.",
    },
  ] satisfies CvEarlierRole[],

  education: {
    qualification: "Bachelor of Science (BSc), Computer Science",
    school: "NMMU, Port Elizabeth",
    detail:
      "2005–2008 • Automata Theory 83% • Linear Optimization 88% • Advanced Programming 71%/76%",
  },

  skills: [
    {
      label: "Back end",
      items: [
        "C#/.NET Core",
        "ASP.NET Core Web API",
        "Node.js",
        "Python",
        "REST APIs",
        "microservices",
        "event-driven architecture",
        "CQRS",
      ],
    },
    {
      label: "Messaging",
      items: ["RabbitMQ", "NServiceBus", "Amazon SQS/SNS", "Cloudflare Queues"],
    },
    { label: "Databases", items: ["PostgreSQL", "SQL Server", "MongoDB", "Cloudflare D1"] },
    {
      label: "Platform & DevEx",
      items: [
        "Nx monorepos",
        "CI/CD",
        "build and test performance",
        "internal developer tooling",
        "AI-agent tooling (MCP)",
      ],
    },
    {
      label: "Infrastructure",
      items: [
        "Kubernetes (Azure AKS)",
        "Docker",
        "AWS",
        "Cloudflare Workers",
        "GitHub Actions",
        "GitLab CI",
        "Octopus Deploy",
      ],
    },
    { label: "Front end", items: ["TypeScript", "React", "Next.js", "Angular", "Vue"] },
    {
      label: "Build & testing",
      items: ["Vite", "tsdown", "Webpack", "Vitest", "Playwright", "Storybook"],
    },
    { label: "Spoken", items: ["English (native)", "Afrikaans (fluent)"] },
  ] satisfies CvSkillGroup[],
};

export type Cv = typeof cv;
