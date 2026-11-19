/**
 * Prints /cv to public/cv/jacobus.pdf and checks how it falls on the page.
 *
 * Run from apps/hack-cove-site after a build: `bun scripts/print-cv.ts`. It serves `dist` the way
 * the e2e's webServer does, prints the page in Playwright Chromium on its own `@page` rules
 * (cv-print.css), then reads the PDF back with poppler's `pdfinfo` and `pdftotext` and exits 1
 * unless the CV is 3 A4 pages, every job but the first sits whole on one page, each of the first
 * job's groups keeps its heading with its last bullet, every Tech line is on its job's last bullet's
 * page, Skills ends on page 3, and pages 1 and 2 are filled below 80% of their height.
 */
import { chromium } from "@playwright/test";
import { join } from "node:path";
import { cv, type CvJob } from "../src/content/cv";

const PAGES = 3;
const FILLED = 0.8;

const site = join(import.meta.dirname, "..");
const pdfPath = join(site, "public/cv/jacobus.pdf");

/** A port the loopback has free right now. */
function freePort(): number {
  const probe = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
  const { port } = probe;
  void probe.stop(true);
  if (port === undefined) throw new Error("no free port");
  return port;
}

async function waitFor(url: string): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const ok = await fetch(url).then(
      (res) => res.ok,
      () => false,
    );
    if (ok) return;
    await Bun.sleep(100);
  }
  throw new Error(`${url} did not answer`);
}

async function print(): Promise<void> {
  const port = freePort();
  const server = Bun.spawn(["bun", join(site, "../storybook/e2e/serve.ts")], {
    env: { ...process.env, PORT: String(port), STATIC_DIR: join(site, "dist") },
    stdout: "inherit",
    stderr: "inherit",
  });
  const browser = await chromium.launch();
  try {
    const url = `http://127.0.0.1:${port}/cv/`;
    await waitFor(url);
    // The CV is printed in the light scheme: dark text on the white page cv-print.css sets.
    const page = await browser.newPage({ colorScheme: "light" });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.pdf({ path: pdfPath, format: "A4", preferCSSPageSize: true, printBackground: true });
  } finally {
    await browser.close();
    server.kill();
    await server.exited;
  }
}

function run(command: string[]): string {
  const result = Bun.spawnSync(command);
  if (result.exitCode !== 0) {
    throw new Error(`${command.join(" ")}: ${result.stderr.toString()}`);
  }
  return result.stdout.toString();
}

const collapse = (text: string): string => text.replace(/\s+/g, " ").trim();

/** How a line is found on a page: its first 40 characters, with whitespace collapsed on both sides. */
const key = (line: string): string => collapse(line).slice(0, 40);

type Page = { text: string; filled: number };

function readPages(): Page[] {
  const pages = Number(/^Pages:\s+(\d+)/m.exec(run(["pdfinfo", pdfPath]))?.[1]);
  const layout = run(["pdftotext", "-bbox-layout", pdfPath, "-"]);
  const boxes = [
    ...layout.matchAll(/<page width="([\d.]+)" height="([\d.]+)">([\s\S]*?)<\/page>/g),
  ];
  return Array.from({ length: pages }, (_, index) => {
    const n = String(index + 1);
    const box = boxes[index];
    const height = Number(box?.[2]);
    const lowest = Math.max(
      0,
      ...[...(box?.[3] ?? "").matchAll(/<block [^>]*yMax="([\d.]+)"/g)].map((m) => Number(m[1])),
    );
    return {
      text: collapse(run(["pdftotext", "-f", n, "-l", n, pdfPath, "-"])),
      filled: lowest / height,
    };
  });
}

/** Two lines that must print on the same page, and what that keeps together. */
type Span = { what: string; first: string; last: string };

const lastBullet = (job: CvJob): string | undefined => job.groups.at(-1)?.items.at(-1);

/** The first job (the one with groups) may break, but only between its groups. */
function groupSpans(job: CvJob): Span[] {
  return job.groups.flatMap((group) => {
    const last = group.items.at(-1);
    if (!group.heading || last === undefined) return [];
    return [{ what: `${job.company}: "${key(group.heading)}"`, first: group.heading, last }];
  });
}

function techSpan(job: CvJob): Span[] {
  const last = lastBullet(job);
  if (!job.tech || last === undefined) return [];
  return [
    {
      what: `${job.company}: Tech line with its last bullet`,
      first: last,
      last: `Tech: ${job.tech}`,
    },
  ];
}

/** Every job but the first, and every earlier role, whole on one page. */
function wholeSpan(job: CvJob): Span {
  const last = job.tech ? `Tech: ${job.tech}` : (lastBullet(job) ?? job.title);
  return { what: `${job.company}: whole on one page`, first: `${job.title}, ${job.company}`, last };
}

function spans(): Span[] {
  const [first, ...rest]: CvJob[] = cv.experience;
  const roles = cv.earlierRoles;
  return [
    ...(first ? groupSpans(first) : []),
    ...cv.experience.flatMap(techSpan),
    ...rest.map(wholeSpan),
    ...roles.slice(0, 1).map((role) => ({
      what: "Earlier Roles: heading with its first role",
      first: "Earlier Roles",
      last: role.summary,
    })),
    ...roles.map((role) => ({
      what: `${role.company}: whole on one page`,
      first: `${role.title}, ${role.company}`,
      last: role.summary,
    })),
  ];
}

function check(pages: Page[]): string[] {
  /** The 1-based page a line is on, or 0 when no page holds it. */
  const pageOf = (line: string): number =>
    pages.findIndex((page) => page.text.includes(key(line))) + 1;
  const failures = spans().flatMap(({ what, first, last }) => {
    const [a, b] = [pageOf(first), pageOf(last)];
    return a !== 0 && a === b ? [] : [`${what}: starts on page ${a}, ends on page ${b}`];
  });
  if (pages.length !== PAGES) failures.push(`${pages.length} pages, not ${PAGES}`);
  const skillsEnd = pageOf(cv.skills.at(-1)?.items.join(", ") ?? "");
  if (skillsEnd !== PAGES) failures.push(`Skills ends on page ${skillsEnd}, not page ${PAGES}`);
  pages.slice(0, -1).forEach((page, index) => {
    if (page.filled < FILLED) {
      failures.push(
        `page ${index + 1} is filled to ${Math.round(page.filled * 100)}% of its height`,
      );
    }
  });
  return failures;
}

await print();
const pages = readPages();
const failures = check(pages);
const fill = pages
  .map((page, index) => `p${index + 1} ${Math.round(page.filled * 100)}%`)
  .join(", ");
process.stdout.write(`print-cv: ${pages.length} pages (${fill}) -> ${pdfPath}\n`);
for (const failure of failures) process.stderr.write(`print-cv: ${failure}\n`);
process.exit(failures.length === 0 ? 0 : 1);
