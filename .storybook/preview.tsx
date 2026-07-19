import type { Preview } from "@storybook/react-vite";
import "./tailwind.css";

// Render every story inside `.dark` on the Catppuccin `base` surface (#1e1e2e) so the
// colour tokens resolve to their real Mocha values (see tailwind.css).
const preview: Preview = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="min-h-screen p-8" style={{ backgroundColor: "#1e1e2e" }}>
          <Story />
        </div>
      </div>
    ),
  ],
};
export default preview;
