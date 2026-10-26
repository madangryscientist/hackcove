import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, FilterGroup, Stack, ToggleChip } from "@hackcove/ui";

const meta: Meta = { title: "UI/FilterGroup" };
export default meta;
type S = StoryObj;

export const WithChips: S = {
  render: () => (
    <FilterGroup legend="Type of shop">
      <ToggleChip pressed={false} dot="#e11d48">
        Charity
      </ToggleChip>
      <ToggleChip pressed dot="#7c3aed">
        Vintage
      </ToggleChip>
      <ToggleChip pressed={false} dot="#0891b2">
        Books
      </ToggleChip>
      <ToggleChip pressed={false} dot="#ca8a04">
        Furniture
      </ToggleChip>
    </FilterGroup>
  ),
};

/** A `FilterGroup` names a set of chips with a `legend`, so the group is announced and the chips wrap together. */
export const DoLegend: S = {
  render: () => (
    <FilterGroup legend="Type of shop">
      <ToggleChip pressed dot="#7c3aed">
        Vintage
      </ToggleChip>
      <ToggleChip pressed={false} dot="#0891b2">
        Books
      </ToggleChip>
      <ToggleChip pressed={false} dot="#ca8a04">
        Furniture
      </ToggleChip>
    </FilterGroup>
  ),
};

/** Chips with no group have no name: a screen reader hears a row of buttons and not what they filter. */
export const DontLegend: S = {
  render: () => (
    <Cluster gap="xs" wrap>
      <ToggleChip pressed>Vintage</ToggleChip>
      <ToggleChip pressed={false}>Books</ToggleChip>
      <ToggleChip pressed={false}>Furniture</ToggleChip>
    </Cluster>
  ),
};

/** One `FilterGroup` per facet, stacked: each keeps its own legend and its own row of chips. */
export const DoFacets: S = {
  render: () => (
    <Stack gap="sm">
      <FilterGroup legend="Type of shop">
        <ToggleChip pressed>Vintage</ToggleChip>
        <ToggleChip pressed={false}>Books</ToggleChip>
      </FilterGroup>
      <FilterGroup legend="Open">
        <ToggleChip pressed={false}>Now</ToggleChip>
        <ToggleChip pressed>Saturdays</ToggleChip>
      </FilterGroup>
    </Stack>
  ),
};
