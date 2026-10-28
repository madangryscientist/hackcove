import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container, PageHeader, Text } from "@hackcove/ui";
import { DemoShell, layoutPage } from "./DemoShell";

const meta: Meta = {
  title: "Layout/Container",
  parameters: { bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

/** A `bleed` shell: the band spans the page, and the Container inside it keeps the content edge. */
export const InABleedShell: S = {
  render: () => (
    <DemoShell bleed>
      <div className="border-b border-slate-200 bg-slate-50">
        <Container>
          <div className="py-8">
            <PageHeader
              title="Full-bleed band"
              subtitle="The band is edge to edge; its content is not."
            />
          </div>
        </Container>
      </div>
      <Container>
        <div className="py-8">
          <Text as="p">Below the band, another Container.</Text>
        </div>
      </Container>
    </DemoShell>
  ),
};
