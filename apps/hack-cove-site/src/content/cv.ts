/* ---------------------------------------------------------------------------
   Public CV copy, in one typed place.
   ---------------------------------------------------------------------------
   The CV approved by Jacobus on 2026-11-19 is the source of
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
    "Senior Full-Stack Engineer · TypeScript, Node, React, C#/.NET Core, PostgreSQL · AI developer tooling",
  location: "Cape Town",
  photo: "/cv/jacobus.jpg",
  pdf: "/cv/jacobus.pdf",
  summary:
    "Senior full-stack engineer with 18 years building production software. APIs and services in C#/.NET Core, Node and Python; front ends in TypeScript and React; PostgreSQL. Led a team of seven at Wonga, led the front-end guild at Zappi, and owned the developer platform used by 80 engineers there. Worked day to day with UK colleagues, and was on call in production at every company. Since 2026, building developer tools for AI coding agents.",

  links: [
    { label: "jacobus@hack-cove.com", href: "mailto:jacobus@hack-cove.com" },
    { label: "+27 78 629 4044", href: "tel:+27786294044" },
    { label: "GitHub: madangryscientist", href: "https://github.com/madangryscientist" },
    {
      label: "linkedin.com/in/jacobuslangner",
      href: "https://www.linkedin.com/in/jacobuslangner/",
    },
  ] satisfies CvLink[],

  experience: [
    {
      company: "Hack Cove (my contracting company)",
      title: "Contract Engineer",
      dates: "Apr 2026 to Present",
      location: "Remote",
      groups: [
        {
          heading: "Client: Cue (voice and telephony), a greenfield product, Apr 2026 to Nov 2026.",
          items: [
            "Built the Python service that integrates the app with the voice provider.",
            "Built the realtime call, transfer and presence flows on top of it in TypeScript and React: inbound answer, cold and warm transfers, and in-flight transfer actions.",
          ],
        },
        {
          heading:
            "Slash suite (slashslash.build): tools I built for problems I hit while building with AI coding agents, and use every day. Public on GitHub, in alpha.",
          items: [
            "PixelSlash, visual review: a Rust/WebAssembly engine pixel-diffs two versions of a page, and a vision model reviews only the regions that changed. Coding agents drive it through its MCP server. Published on npm.",
            "FlakeSlash finds flaky tests in GitHub Actions history with plain rules, then makes one model call per flaky test to explain it.",
            "ToggleSlash, feature flags: an ASP.NET Core server on .NET 10 with an admin API and audit trail, and C# and TypeScript SDKs that pass one shared set of evaluation tests.",
            "I build the suite with OmniSlash, a multi-agent system I designed for tasking and scheduling: a muse agent turns my ideas into designs, an architect agent plans them into tickets and schedules the builder agents, a sentinel agent gates and merges every pull request, and TaskSlash (Rust) queues their builds and tests so they do not overload the machine.",
          ],
          links: [{ label: "slashslash.build", href: "https://slashslash.build" }],
        },
      ],
      tech: "Python, PostgreSQL, TypeScript, React, C#/.NET 10 (ASP.NET Core), Rust/WebAssembly, Bun, TanStack Start, Cloudflare Workers, D1, Queues, Drizzle, SQLite, Playwright, moon, GitHub Actions, AI coding agents, MCP",
    },
    {
      company: "Zappi",
      title: "Senior Engineer",
      dates: "Apr 2021 to Apr 2026",
      location: "Remote",
      summary: "Developer platform, Node services, front-end guild lead (final year)",
      groups: [
        {
          items: [
            "Owned the developer platform: the front-end monorepo of 60+ TypeScript packages that 80 engineers worked in. Planned the shared build and test tooling with the directors of engineering, and built it with my team: library builds went from 2 minutes to 5 seconds (ESM-only builds), end-to-end runs from 30 minutes to 5 (Cypress to Playwright), 1,126 tests moved from Jest to Vitest, and Nx build caching added.",
            "Led the front-end guild in my final year, including the React 18 upgrade and the move from Redux to React Query and Zustand.",
            "Cut the initial page load from 41 MB to 2.7 MB. Reworked the Redux loading that had broken code splitting, so pages lazy-load what they need; wrote a shared UI framework every team used in place of its own mix of libraries; and moved to ES modules.",
            "Removed a 6 MB icon pack that the back end's generated HTML depended on: found every icon class in use across the database and several repos, and mapped each one to the new icons without breaking any.",
            "Built the microservices that integrated Salesforce, republishing its events on SQS/SNS for other services, with TypeScript types generated from the gRPC contracts the services shared.",
            "Built the checkout, front and back end, with Stripe subscriptions and webhooks.",
            "Handled front-end security with the security team: tracked Dependabot and CVE alerts, judged whether each one affected us and set its fix priority, fixed the critical ones myself, and fixed penetration-test findings.",
            "Owned the Node.js backend-for-frontend (BFF): its build, and the APIs the React app loaded its pages from.",
          ],
        },
      ],
      tech: "Node.js, Amazon SQS/SNS, TypeScript, Nx, Playwright, Vitest, Stripe, Ruby (exposure: the main back end), React, Next.js",
    },
    {
      company: "FMI",
      title: "API Architect",
      dates: "Jun 2018 to Mar 2021",
      location: "Remote",
      summary: "API and platform architecture for a life insurer moving off paper",
      groups: [
        {
          items: [
            "Architected 15 API services and the workflow engines for policy applications, claims and underwriting, in C# and TypeScript.",
            "Moved business logic out of stored procedures into those services.",
            "Built the company's Kubernetes clusters from scratch on Azure (AKS), and moved releases from monthly FTP drops to continuous delivery.",
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
      dates: "Aug 2015 to May 2018",
      location: "Office-based",
      summary: "Team lead: the back end to front end domain",
      groups: [
        {
          items: [
            "Led a team of seven that owned how the back end talked to the front end: C# microservices, event-driven with CQRS and RabbitMQ, pushing to the browser over WebSockets.",
            "NServiceBus was out of support with no upgrade path, so I built an interop layer that read and wrote its XML messages, letting the new RabbitMQ services run beside the old system while three teams migrated.",
            "Joined as a back-end developer, then became technical lead for the move from PHP to AngularJS on ASP.NET Core Web API. The team won the CEO Recognition Award.",
            "Moved the public content site to Umbraco Cloud, which kept it up with an offline notice while our hosting provider's data centre was down.",
          ],
        },
      ],
      tech: "C#, ASP.NET Core Web API, RabbitMQ, NServiceBus, CQRS, WebSockets, Umbraco, IIS, Octopus Deploy, AngularJS",
    },
  ] satisfies CvJob[],

  earlierRoles: [
    {
      company: "Sygnia",
      title: "Software Developer",
      dates: "Sep 2014 to Aug 2015",
      summary:
        "Asset management; web and server-side work in C# and SQL Server, and tuning slow queries.",
    },
    {
      company: "Property24",
      title: "Software Developer",
      dates: "Aug 2011 to Aug 2014",
      summary:
        "Built and ran one of South Africa's most visited websites across multiple servers with heavy caching; upgraded it from ASP Classic to ASP.NET to ASP.NET MVC.",
    },
    {
      company: "ACI Worldwide",
      title: "Software Developer",
      dates: "Jan 2010 to Aug 2011",
      summary:
        "Java on Windows and AIX with SQL Server and DB2; third-level support and patches for the PostCard payments product.",
    },
    {
      company: "Axxess DSL and Business Intelligence",
      title: "Software Developer",
      dates: "Sep 2008 to Dec 2009",
      summary:
        "C# Windows services, web services and ASP.NET sites on SQL Server; upgrades from ASP.NET 1.1 to 3.5.",
    },
  ] satisfies CvEarlierRole[],

  education: {
    qualification: "Bachelor of Science (BSc), Computer Science",
    school: "NMMU, Port Elizabeth",
    detail: "2005 to 2008",
  },

  skills: [
    {
      label: "Back end",
      items: [
        "C#/.NET (Core to .NET 10)",
        "ASP.NET Core Web API",
        "Node.js",
        "Python",
        "REST APIs",
        "microservices",
        "event-driven architecture",
        "CQRS",
        "gRPC contracts",
        "WebSockets",
        "Rust (WebAssembly)",
      ],
    },
    {
      label: "Messaging",
      items: ["RabbitMQ", "NServiceBus", "Amazon SQS/SNS", "Cloudflare Queues"],
    },
    {
      label: "Databases",
      items: [
        "PostgreSQL (schema design, migrations, indexing)",
        "SQL Server",
        "MongoDB",
        "SQLite",
        "Cloudflare D1",
      ],
    },
    {
      label: "Platform & DevEx",
      items: [
        "Nx and moon monorepos",
        "CI/CD",
        "build and test tooling",
        "internal developer tooling",
      ],
    },
    {
      label: "Infrastructure",
      items: [
        "Kubernetes (Azure AKS)",
        "Docker",
        "AWS (SQS and SNS hands-on; S3, CloudFront and RDS as a consumer)",
        "Cloudflare Workers",
        "GitHub Actions",
        "GitLab CI",
        "Octopus Deploy",
      ],
    },
    { label: "Front end", items: ["TypeScript", "React", "Next.js", "Angular"] },
    {
      label: "Build & testing",
      items: ["Vite", "tsdown", "Webpack", "Vitest", "Playwright", "Storybook"],
    },
    {
      label: "AI development",
      items: [
        "agentic development",
        "LLM integration",
        "MCP",
        "multi-agent workflows",
        "Claude Code",
        "OpenCode",
      ],
    },
    { label: "Spoken", items: ["English (native)", "Afrikaans (fluent)"] },
  ] satisfies CvSkillGroup[],
};

export type Cv = typeof cv;
