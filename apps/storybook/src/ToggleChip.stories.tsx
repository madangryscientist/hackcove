import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, ToggleChip } from "@hackcove/ui";

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

/** A filter is a `ToggleChip`: `pressed` shows whether it is on, and the caller toggles it in `onClick`. */
export const DoToggle: S = {
  render: () => {
    const [on, setOn] = useState(["Vintage"]);
    const toggle = (name: string) =>
      setOn((now) => (now.includes(name) ? now.filter((n) => n !== name) : [...now, name]));
    return (
      <Cluster gap="xs" wrap>
        {["Charity", "Vintage", "Books"].map((name) => (
          <ToggleChip key={name} pressed={on.includes(name)} onClick={() => toggle(name)}>
            {name}
          </ToggleChip>
        ))}
      </Cluster>
    );
  },
};

/** A chip that does something once, such as clearing the filters, is an action: use a `Button`. */
export const DontToggle: S = {
  render: () => <ToggleChip pressed={false}>Clear filters</ToggleChip>,
};

/** `dot` is a category colour before the label, so a chip matches its marker elsewhere. */
export const DoDot: S = {
  render: () => (
    <Cluster gap="xs" wrap>
      <ToggleChip pressed dot="#7c3aed">
        Vintage
      </ToggleChip>
      <ToggleChip pressed={false} dot="#0891b2">
        Books
      </ToggleChip>
    </Cluster>
  ),
};

/** `sm` is the default, a chip in a filter row; `md` and `lg` sit beside controls of their size. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap gap-1.5">
          <ToggleChip size={size} pressed={false}>
            Charity {size}
          </ToggleChip>
          <ToggleChip size={size} pressed>
            Vintage {size}
          </ToggleChip>
        </div>
      ))}
    </div>
  ),
};
