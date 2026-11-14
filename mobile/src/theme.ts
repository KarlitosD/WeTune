import type { TextStyle } from "react-native";

// Paleta base de WeTune: azul noche + cian.
// Fuente única para que toda la app comparta superficies y jerarquía.
export const theme = {
  primary: "#38bdf8",
  primaryContent: "#082f49",
  base100: "#0f172a",
  base200: "#1a2338",
  base300: "#24304a",
  text: "#e7ecf7",
  muted: "#a3b0c7",
  faint: "#78859c",
  outline: "rgba(148, 163, 184, 0.16)",
  danger: "#f87171",
  white: "#ffffff",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.text,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  body: {
    fontSize: 14,
    fontWeight: "400",
    color: theme.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.muted,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: theme.muted,
  },
} as const satisfies Record<string, TextStyle>;
