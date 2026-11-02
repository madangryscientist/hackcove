/**
 * One Nx project per visual group, `visual-<slug>`, so `nx affected -t visual` captures only the
 * groups a change reaches and `nx run-many -t visual` captures them all. The groups are the
 * sections of the site's component docs (`visual.ts --groups`), never a list kept here.
 *
 * A group's project has no folder of its own: it depends on Storybook, every theme and the site
 * (whose docs sections decide the groups), so a change to any of them makes it affected, and the
 * plan (`storybook:visual-plan`) then says which of the affected groups the change actually
 * reaches. Its targets are never cached, since what they capture lives outside any project.
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import type { CreateNodesV2, TargetConfiguration } from "nx/src/devkit-exports";

const script = "scripts/visual.ts";

function target(slug: string, upload: boolean): TargetConfiguration {
  const flag = upload ? " --upload" : "";
  return {
    executor: "nx:run-commands",
    options: { command: `bun ${script} --group ${slug}${flag}`, cwd: "apps/storybook" },
    dependsOn: [
      {
        projects: ["storybook"],
        target: upload ? "visual-plan-upload" : "visual-plan",
        params: "forward",
      },
    ],
    inputs: [],
    cache: false,
    parallelism: false,
  };
}

export const createNodesV2: CreateNodesV2 = [
  "apps/storybook/package.json",
  (files, _options, context) => {
    const slugs = execFileSync("bun", [script, "--groups"], {
      cwd: join(context.workspaceRoot, "apps", "storybook"),
      encoding: "utf8",
    })
      .split("\n")
      .filter(Boolean);
    const projects = Object.fromEntries(
      slugs.map((slug) => [
        `apps/storybook/visual/${slug}`,
        {
          name: `visual-${slug}`,
          tags: ["visual-group"],
          implicitDependencies: ["storybook", "theme-*", "hack-cove-site"],
          targets: { visual: target(slug, false), "visual-upload": target(slug, true) },
        },
      ]),
    );
    return files.map((file) => [file, { projects }]);
  },
];
