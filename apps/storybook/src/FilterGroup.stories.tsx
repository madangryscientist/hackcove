import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterGroup, ToggleChip } from "@hackcove/ui";

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
