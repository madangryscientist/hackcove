import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Field, Input, Textarea } from "@hackcove/ui-react";

const meta: Meta = { title: "Forms/Textarea" };
export default meta;
type S = StoryObj;

export const Default: S = {
  render: () => <Textarea placeholder="What did you find? How were the prices?" />,
};
export const Small: S = {
  render: () => <Textarea size="sm" rows={2} placeholder="A short note" />,
};
export const FixedWidth: S = {
  render: () => <Textarea width="lg" placeholder="A short note" />,
};
/** `width="fill"` grows to the room left in a row, so the button beside it stays on the line. */
export const FillWidth: S = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex max-w-lg flex-wrap items-start gap-2">
      <Textarea width="fill" rows={2} aria-label="Note" placeholder="Fills the row" />
      <Button>Post</Button>
    </div>
  ),
};
export const Disabled: S = {
  render: () => <Textarea placeholder="What did you find? How were the prices?" disabled />,
};

/** Text that runs to a paragraph is a `Textarea` in a `Field`, so the person can see what they wrote. */
export const DoLongText: S = {
  render: () => (
    <Field label="Review" htmlFor="do-review" hint="What did you find? How were the prices?">
      <Textarea id="do-review" rows={4} />
    </Field>
  ),
};

/** An `Input` is one line: a paragraph typed into it scrolls out of sight. */
export const DontLongText: S = {
  render: () => (
    <Field label="Review" htmlFor="dont-review" hint="What did you find? How were the prices?">
      <Input id="dont-review" />
    </Field>
  ),
};

/** `mono` sets the monospace face, for pasted CSV or statement text where the columns must line up. */
export const Mono: S = {
  render: () => (
    <Textarea
      mono
      rows={4}
      defaultValue={
        "Date,Description,Amount\n2026-10-01,Groceries,-84.20\n2026-10-03,Salary,3200.00"
      }
      aria-label="Pasted statement"
    />
  ),
};

/** The `ref` reaches the `<textarea>`, so a parent can move focus into it. */
export const FocusRef: S = {
  render: function FocusRefStory() {
    const note = useRef<HTMLTextAreaElement>(null);
    return (
      <div className="flex flex-col items-start gap-2">
        <Textarea ref={note} rows={2} aria-label="Note" placeholder="Focus moves here" />
        <Button size="sm" onClick={() => note.current?.focus()}>
          Focus the note
        </Button>
      </div>
    );
  },
};

/** `sm`, `md` (the default) and `lg`. */
export const Sizes: S = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Textarea
          key={size}
          size={size}
          rows={2}
          placeholder={`A note, ${size}`}
          aria-label={`Note ${size}`}
        />
      ))}
    </div>
  ),
};
