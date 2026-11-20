import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Caption, Overline, Text, type TextTone } from "@slashsuite/ui-react";

const meta: Meta = { title: "Text/Body text" };
export default meta;
type S = StoryObj;

const TONES: TextTone[] = ["neutral", "muted", "accent", "info", "positive", "warn", "danger"];

export const TextToneStory: S = {
  name: "Text tone",
  render: () => (
    <div className="flex max-w-xl flex-col gap-1">
      <Text tone="positive">Saved.</Text>
      <Text tone="danger">Could not save: the name is taken.</Text>
      <Text tone="warn">This quote expires tomorrow.</Text>
      <Text tone="info">Changes sync in the background.</Text>
      <Text tone="muted">Nothing to show yet.</Text>
    </div>
  ),
};

export const ToneAxis: S = {
  name: "Tone axis (inline role × tone)",
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3 text-left">
      <thead>
        <tr>
          <th />
          {TONES.map((t) => (
            <th key={t}>
              <Overline tone="muted">{t}</Overline>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(
          [
            ["Text", (t: TextTone) => <Text tone={t}>Text</Text>],
            [
              "Text strong",
              (t: TextTone) => (
                <Text strong tone={t}>
                  Text strong
                </Text>
              ),
            ],
            ["Caption", (t: TextTone) => <Caption tone={t}>Caption</Caption>],
            ["Overline", (t: TextTone) => <Overline tone={t}>Overline</Overline>],
          ] satisfies Array<[string, (t: TextTone) => ReactNode]>
        ).map(([label, render]) => (
          <tr key={label}>
            <td>
              <Caption as="span" tone="muted">
                {label}
              </Caption>
            </td>
            {TONES.map((t) => (
              <td key={t}>{render(t)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
