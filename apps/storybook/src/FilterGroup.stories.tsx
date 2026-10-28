import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, FilterGroup, Stack, Button } from "@hackcove/ui";

const meta: Meta = { title: "UI/FilterGroup" };
export default meta;
type S = StoryObj;

export const WithChips: S = {
  render: () => (
    <FilterGroup legend="Type of shop">
      <Button variant="outline" size="sm" pressed={false}>
        Charity
      </Button>
      <Button variant="outline" size="sm" pressed>
        Vintage
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Books
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Furniture
      </Button>
    </FilterGroup>
  ),
};

/** A `FilterGroup` names a set of chips with a `legend`, so the group is announced and the chips wrap together. */
export const DoLegend: S = {
  render: () => (
    <FilterGroup legend="Type of shop">
      <Button variant="outline" size="sm" pressed>
        Vintage
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Books
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Furniture
      </Button>
    </FilterGroup>
  ),
};

/** Chips with no group have no name: a screen reader hears a row of buttons and not what they filter. */
export const DontLegend: S = {
  render: () => (
    <Cluster gap="xs" wrap>
      <Button variant="outline" size="sm" pressed>
        Vintage
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Books
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Furniture
      </Button>
    </Cluster>
  ),
};

/** One `FilterGroup` per facet, stacked: each keeps its own legend and its own row of chips. */
export const DoFacets: S = {
  render: () => (
    <Stack gap="sm">
      <FilterGroup legend="Type of shop">
        <Button variant="outline" size="sm" pressed>
          Vintage
        </Button>
        <Button variant="outline" size="sm" pressed={false}>
          Books
        </Button>
      </FilterGroup>
      <FilterGroup legend="Open">
        <Button variant="outline" size="sm" pressed={false}>
          Now
        </Button>
        <Button variant="outline" size="sm" pressed>
          Saturdays
        </Button>
      </FilterGroup>
    </Stack>
  ),
};
