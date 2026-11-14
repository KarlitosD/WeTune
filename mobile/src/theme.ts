import type { TextStyle } from "react-native";

// Paleta base de WeTune: neutral casi negro + blanco/slate.
// Fuente única para que toda la app comparta superficies y jerarquía.
export const theme = {
  primary: "#F8FAFC",
  primaryContent: "#0F172A",
  base100: "#0F172A",
  base200: "#1A2338",
  base300: "#24304A",
  text: "#E7ECF7",
  muted: "#A3B0C7",
  faint: "#78859C",
  outline: "rgba(148, 163, 184, 0.18)",
  danger: "#F87171",
  white: "#FFFFFF",
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
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  screenTitle: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
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
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: theme.muted,
  },
} as const satisfies Record<string, TextStyle>;
