/**
 * D2 spike: ThemeProvider + useStyles. The theme is a name; its map comes from the generated
 * themes.json, so a theme folder added under themes/* appears here after `bun run generate`.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Platform, type TextStyle } from "react-native";
import generated from "../generated/themes.json";
import { resolve, type Resolved, type ThemeMap } from "./resolve";

export const THEMES = generated.themes as unknown as Record<string, ThemeMap>;
export const THEME_NAMES = Object.keys(THEMES);

/** Tailwind v4's own --default-font-family: what the web renders with no theme. */
const TAILWIND_SANS =
  'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

type Ctx = { name: string; map: ThemeMap; baseText: TextStyle };
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ name, children }: { name: string; children: ReactNode }) {
  const map = THEMES[name];
  if (!map) throw new Error(`ThemeProvider: no theme "${name}" (have ${THEME_NAMES.join(", ")})`);
  const value = useMemo<Ctx>(() => {
    // No cascade in RN: the scope's colour and font reach every Text through context instead.
    // A web font stack means nothing to Android (no Inter, no system-ui); it keeps Roboto.
    const baseText: TextStyle = {
      ...(map.base.color ? { color: map.base.color } : {}),
      ...(Platform.OS === "web" ? { fontFamily: map.base.fontFamily ?? TAILWIND_SANS } : {}),
    };
    return { name, map, baseText };
  }, [name, map]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme: no ThemeProvider above");
  return ctx;
}

const cache = new Map<string, Resolved>();
/** A ui class string → memoised RN styles per state slot, for the current theme. */
export function useStyles(classString: string): Resolved {
  const { name, map } = useTheme();
  const key = `${name}\u0000${classString}`;
  let r = cache.get(key);
  if (!r) {
    r = resolve(classString, map);
    cache.set(key, r);
  }
  return r;
}
