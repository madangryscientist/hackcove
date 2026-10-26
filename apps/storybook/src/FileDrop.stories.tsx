import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileDrop } from "@hackcove/ui";

const meta: Meta = { title: "UI/FileDrop" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => <FileDrop accept=".csv">Drop a bank statement here or click to choose</FileDrop>,
};
export const Disabled: S = {
  render: () => (
    <FileDrop accept=".csv" disabled>
      Drop a bank statement here or click to choose
    </FileDrop>
  ),
};
/** `size="sm"`: a compact chip or tile, with dense padding. */
export const Small: S = {
  render: () => (
    <div className="max-w-xs">
      <FileDrop size="sm" accept=".jpg,.png">
        Add a photo
      </FileDrop>
    </div>
  ),
};

/** Name the file the zone wants in its prompt, restrict it with `accept`, and show the chosen file's name from `onChange`. */
export const DoChosen: S = {
  render: () => {
    const [name, setName] = useState("");
    return (
      <FileDrop accept=".csv" onChange={(event) => setName(event.target.files?.[0]?.name ?? "")}>
        {name === "" ? "Drop a bank statement here or click to choose" : name}
      </FileDrop>
    );
  },
};

/** A prompt that never changes leaves the person unsure the file was taken, and with no `accept` any file is. */
export const DontChosen: S = {
  render: () => <FileDrop>Drop here</FileDrop>,
};
