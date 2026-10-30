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
  headline: "Staff-level Full Stack Engineer",
  location: "Cape Town",
  photo: "/cv/jacobus.jpg",
  pdf: "/cv/jacobus.pdf",
  summary:
    "Staff-level full stack engineer with 18 years of production software: TypeScript/React front ends, and the Node, Python and C#/.NET services behind them, connected through messaging (SQS/SNS, RabbitMQ), on Kubernetes and Cloudflare. I started Hack Cove in April 2026 for contract work. At Cue, my current client, I build the voice product on both sides: the live call and transfer flows in React, and the Python service that integrates with the voice provider. At Zappi I owned the front-end guild and the shared UI platform, and built the Node service that carried Salesforce events to the rest of the platform.",

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
      summary: "I started Hack Cove to do engineering contract work. Cue is my current client.",
      groups: [
        {
          heading: "Cue",
          items: [
            "Building the Voice Inbox and live call and transfer flows in the TypeScript/React app.",
            "I work on the calls inbox as a product surface: listings, inbound answer that opens the voice session and contact context, and realtime updates. The call UI is a floating modal with a dialer, mic and speaker selection, and recipient and contact search.",
            "Implementing cold and warm transfers, including a transfer picker with live directory and presence, and in-flight actions to pull a transfer back, complete it, or mute.",
            "Built the Python service that integrates the app with the voice service provider.",
          ],
        },
        {
          heading: "Hack Cove UI",
          items: [
            "An open-source React design system on npm (@hackcove/ui plus theme packages), in an Nx and Bun monorepo with Storybook. Every theme reskins every component with no code change.",
            "Its reusable GitHub Action reviews UI pull requests in two layers: deterministic rules that fail on off-system styling, then an LLM review through OpenCode Zen against the published component reference (llms.txt).",
          ],
          links: [
            { label: "hack-cove.com/ui", href: "https://hack-cove.com/ui" },
            {
              label: "github.com/madangryscientist/hackcove",
              href: "https://github.com/madangryscientist/hackcove",
            },
          ],
        },
        {
          heading: "PixelSlash",
          items: [
            "A visual-regression tool. It has a Bun CLI and a pixel-diff engine in Rust compiled to WebAssembly. Its review app runs TanStack Start on Cloudflare Workers, with D1 through Drizzle, R2 for screenshots, GitHub sign-in, and AES-256-GCM encryption for the API keys it stores.",
            "AI review: a vision model judges each shot against the design system (local mlx or ollama, or a hosted model), and the server sends each changed region to an OpenAI-compatible vision endpoint on a Cloudflare Queue to explain the change, with retries and per-build token accounting. An MCP server lets coding agents such as Claude Code read builds and drive the tool.",
          ],
          links: [
            { label: "pixelslash.dev", href: "https://pixelslash.dev" },
            {
              label: "github.com/madangryscientist/pixelslash",
              href: "https://github.com/madangryscientist/pixelslash",
            },
          ],
        },
      ],
      tech: "TypeScript, React, Python, Node/Bun, Rust/WebAssembly, Cloudflare Workers, D1, Drizzle",
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
            "Built a Node microservice that took events from Salesforce's messaging system and republished them on SQS/SNS so other services could consume them.",
            "Ran the front-end Node server: its build and the APIs I built to speed up page loads.",
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
      tech: "TypeScript, Node.js, Next.js, React, Ruby, Storybook, Playwright, Cypress, Amazon SQS, Amazon SNS",
    },
    {
      company: "FMI",
      title: "Frontend-API Architect",
      dates: "June 2018 – March 2021",
      location: "Remote",
      summary:
        "Architected the APIs and workflow engines (policy applications, claims, underwriting) for a life insurer moving off paper, in C# and TypeScript, with React/Next.js front ends. Built Kubernetes clusters from scratch and moved releases from monthly FTP drops to continuous delivery. Designed role-based access control and POPI Act compliance for medical and financial data.",
      groups: [],
      tech: "Docker, TypeScript, C#, Next.js, React, Angular, Vue, Kubernetes",
    },
    {
      company: "Wonga",
      title: "Software Development Team Lead",
      dates: "August 2015 – May 2018",
      location: "Office-based",
      summary:
        "Led a full stack team building new products as C# microservices (CQRS, RabbitMQ), with ASP.NET Core Web API back ends and AngularJS front ends.\n\nStarting as a back-end developer. Soon I moved into a technical lead developer position on the front-end as we migrated from our PHP site into an AngularJS site with ASP.NET Core Web API.\n\nAfter the completion of that project I was promoted to team lead.\n\nThese efforts led to my team being awarded the CEO Recognition Award.\n\nIn mid-2017, I started doing more architectural work to help move away from our legacy system.",
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
