import type { Preview } from "@storybook/react-vite";
import type { ReactNode } from "react";
import "./tailwind.css";

// Every folder under themes/ ships a theme.css. Globbing them means a new theme appears in the
// toolbar the moment its folder exists; nothing here names a theme.
const themeCss = import.meta.glob<string>("../../../themes/*/theme.css", {
  query: "?inline",
  import: "default",
  eager: true,
});

const THEMES: Record<string, string> = Object.fromEntries(
  Object.entries(themeCss).map(([path, css]) => [path.split("/").at(-2) ?? path, css]),
);
const NONE = "default";
const themeNames = Object.keys(THEMES).toSorted();

/** `.dark` is the scope every theme remaps under; `default` is the components' own Tailwind classes. */
function ThemeFrame({ theme, children }: { theme: string; children: ReactNode }) {
  const css = THEMES[theme];
  return (
    <div className={css === undefined ? undefined : "dark"} data-theme={theme}>
      {css !== undefined && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div className="min-h-screen bg-white p-8">{children}</div>
    </div>
  );
}

const preview: Preview = {
  parameters: { layout: "fullscreen" },
  initialGlobals: { theme: themeNames[0] ?? NONE },
  globalTypes: {
    theme: {
      description: "Theme (one per folder under themes/)",
      toolbar: {
        icon: "paintbrush",
        dynamicTitle: true,
        items: [NONE, ...themeNames].map((name) => ({ value: name, title: name })),
      },
    },
  },
  decorators: [
    (Story, context) => (
      <ThemeFrame theme={String(context.globals["theme"] ?? NONE)}>
        <Story />
      </ThemeFrame>
    ),
  ],
};
export default preview;
