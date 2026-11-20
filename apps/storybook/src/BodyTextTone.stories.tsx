import type { Meta, StoryObj } from "@storybook/react-vite";
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
        <tr>
          <td>
            <Caption as="span" tone="muted">
              Text
            </Caption>
          </td>
          {TONES.map((t) => (
            <td key={t}>
              <Text tone={t}>Text</Text>
            </td>
          ))}
        </tr>
        <tr>
          <td>
            <Caption as="span" tone="muted">
              Text strong
            </Caption>
          </td>
          {TONES.map((t) => (
            <td key={t}>
              <Text strong tone={t}>
                Text strong
              </Text>
            </td>
          ))}
        </tr>
        <tr>
          <td>
            <Caption as="span" tone="muted">
              Caption
            </Caption>
          </td>
          {TONES.map((t) => (
            <td key={t}>
              <Caption tone={t}>Caption</Caption>
            </td>
          ))}
        </tr>
        <tr>
          <td>
            <Caption as="span" tone="muted">
              Overline
            </Caption>
          </td>
          {TONES.map((t) => (
            <td key={t}>
              <Overline tone={t}>Overline</Overline>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  ),
};
