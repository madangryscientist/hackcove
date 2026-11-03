/**
 * Button, the Text roles, Card, Input and Stack, each styled only by ui's own class strings
 * (harvested into tables.json) through useStyles. No colour, size or spacing is written here.
 */
import { useState, type ReactNode } from "react";
import {
  Pressable,
  Text as RNText,
  TextInput,
  View,
  type LayoutChangeEvent,
  type TextStyle,
} from "react-native";
import tables from "../generated/tables.json";
import { pick } from "./resolve";
import { useStyles, useTheme } from "./theme";

const T = tables as unknown as Record<
  "button" | "input" | "text" | "card" | "stack",
  Record<string, string>
>;
type Size = "sm" | "md" | "lg";

/** Logs a control's laid-out height (`HEIGHT <name>=<px>`): logcat on Android, the console on web. */
const logHeight = (name?: string) =>
  name
    ? (e: LayoutChangeEvent) => console.log(`HEIGHT ${name}=${e.nativeEvent.layout.height}`)
    : undefined;

/** Brings a control's touch target to 44pt without changing its drawn height (D9). */
const hit = (h: number) => {
  const v = Math.max(0, Math.ceil((44 - h) / 2));
  return { top: v, bottom: v, left: 0, right: 0 };
};
const HEIGHT: Record<Size, number> = { sm: 26, md: 38, lg: 46 };

export function Button({
  children,
  variant = "primary",
  tone = "default",
  size = "md",
  disabled = false,
  measure,
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "link";
  tone?: "default" | "positive" | "danger";
  size?: Size;
  disabled?: boolean;
  measure?: string;
}) {
  const { baseText } = useTheme();
  const r = useStyles(T.button[`${variant}.${tone}.${size}${disabled ? ".disabled" : ""}`]!);
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={hit(HEIGHT[size])}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onLayout={logHeight(measure)}
      style={(s) =>
        pick(r, { pressed: s.pressed || (s as { hovered?: boolean }).hovered, focused, disabled })
          .box
      }
    >
      {(s) => (
        <RNText
          style={[
            baseText,
            pick(r, {
              pressed: s.pressed || (s as { hovered?: boolean }).hovered,
              focused,
              disabled,
            }).text,
          ]}
        >
          {children}
        </RNText>
      )}
    </Pressable>
  );
}

function Typography({ k, children, role }: { k: string; children: ReactNode; role?: "header" }) {
  const { baseText } = useTheme();
  const r = useStyles(T.text[k]!);
  const { box, text } = pick(r);
  // A role that draws a box (SectionHeading's rule) wraps its text in a View: RN Text has no border-b.
  const hasBox = Object.keys(box).length > 0;
  const t = (
    <RNText accessibilityRole={role} style={[baseText, text as TextStyle]}>
      {children}
    </RNText>
  );
  return hasBox ? <View style={box}>{t}</View> : t;
}

export const PageHeading = ({ children }: { children: ReactNode }) => (
  <Typography k="pageHeading" role="header">
    {children}
  </Typography>
);
export const SectionHeading = ({ children, rule }: { children: ReactNode; rule?: boolean }) => (
  <Typography k={rule ? "sectionHeading.rule" : "sectionHeading"} role="header">
    {children}
  </Typography>
);
export const SubsectionHeading = ({ children }: { children: ReactNode }) => (
  <Typography k="subsectionHeading" role="header">
    {children}
  </Typography>
);
export const Overline = ({ children }: { children: ReactNode }) => (
  <Typography k="overline">{children}</Typography>
);
export const Caption = ({ children }: { children: ReactNode }) => (
  <Typography k="caption">{children}</Typography>
);
export function Text({
  children,
  strong,
  color,
  tone,
}: {
  children: ReactNode;
  strong?: boolean;
  color?: "default" | "secondary" | "tertiary" | "muted" | "brand";
  tone?: "muted" | "info" | "positive" | "warn" | "danger";
}) {
  const k = strong
    ? "text.strong"
    : tone
      ? `text.tone.${tone}`
      : color
        ? `text.color.${color}`
        : "text";
  return <Typography k={k}>{children}</Typography>;
}

export function Stack({
  gap = "md",
  children,
}: {
  gap?: "xs" | "sm" | "md" | "lg";
  children: ReactNode;
}) {
  return <View style={pick(useStyles(T.stack[gap]!)).box}>{children}</View>;
}

export function Card({
  title,
  count,
  children,
}: {
  title?: string;
  count?: number;
  children: ReactNode;
}) {
  const { baseText } = useTheme();
  const root = pick(useStyles(T.card.root!));
  const row = pick(useStyles(T.card.headingRow!));
  const t = pick(useStyles(T.card.title!));
  const c = pick(useStyles(T.card.count!));
  return (
    <View style={root.box}>
      {title !== undefined && (
        <View style={row.box}>
          <RNText accessibilityRole="header" style={[baseText, t.text]}>
            {title}
          </RNText>
          {count !== undefined && <RNText style={[baseText, c.text]}>{count}</RNText>}
        </View>
      )}
      {children}
    </View>
  );
}

export function Input({
  placeholder,
  size = "md",
  disabled = false,
  measure,
}: {
  placeholder?: string;
  size?: Size;
  disabled?: boolean;
  measure?: string;
}) {
  const { baseText } = useTheme();
  const r = useStyles(T.input[`${size}${disabled ? ".disabled" : ""}`]!);
  const [focused, setFocused] = useState(false);
  const { box, text } = pick(r, { focused, disabled });
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={r.placeholderTextColor}
      editable={!disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onLayout={logHeight(measure)}
      hitSlop={hit(HEIGHT[size])}
      style={[baseText, box, text]}
    />
  );
}
