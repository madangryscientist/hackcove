import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleChip } from "@hackcove/ui";

const meta: Meta = { title: "UI/ToggleChip" };
export default meta;
type S = StoryObj;

export const States: S = {
  render: () => (
    <div className="flex flex-wrap gap-1.5">
      <ToggleChip pressed={false}>Charity</ToggleChip>
      <ToggleChip pressed>Vintage</ToggleChip>
    </div>
  ),
};

const CHIPS = [
  { label: "Charity", dot: "#e11d48" },
  { label: "Vintage", dot: "#7c3aed" },
  { label: "Books", dot: "#0891b2" },
  { label: "Furniture", dot: "#ca8a04" },
];

function InteractiveChips() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (label: string) =>
    setSelected((current) =>
      current.includes(label) ? current.filter((l) => l !== label) : [...current, label],
    );
  return (
    <div className="flex flex-wrap gap-1.5">
      {CHIPS.map((chip) => (
        <ToggleChip
          key={chip.label}
          dot={chip.dot}
          pressed={selected.includes(chip.label)}
          onClick={() => toggle(chip.label)}
        >
          {chip.label}
        </ToggleChip>
      ))}
    </div>
  );
}

export const Interactive: S = {
  render: () => <InteractiveChips />,
};
