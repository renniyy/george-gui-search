/**
 * GEORGE GUI @Search — Design token system.
 *
 * Curated palettes and token scales that every generated asset shares.
 * A design system is emitted as a Luau `Theme` module plus JSON so both
 * Studio scripts and external tooling consume identical values.
 */

import { finalizeLuau } from "./luau-text.js";

export type ThemeMode = "dark" | "light";

export interface PaletteSide {
  bg: string;
  surface: string;
  surfaceAlt: string;
  stroke: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
}

export interface Palette {
  id: string;
  name: string;
  mood: string;
  dark: PaletteSide;
  light: PaletteSide;
}

/** Shared, non-color token scales (4px base grid). */
export const SCALES = {
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64] as const,
  radius: { none: 0, sm: 6, md: 10, lg: 16, xl: 24, pill: 999 } as const,
  text: {
    caption: 12,
    body: 14,
    label: 15,
    subtitle: 17,
    title: 22,
    headline: 30,
    display: 42,
    stat: 26,
  } as const,
  motion: {
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
    ease: "Quint",
    easeIn: "Cubic",
    easeOut: "Back",
  } as const,
  /** Minimum comfortable touch target in pixels (Roblox mobile guidance). */
  touchTarget: 36,
} as const;

export const PALETTES: Palette[] = [
  {
    id: "midnight-nebula",
    name: "Midnight Nebula",
    mood: "deep-space indigo with a cyan pulse — premium, focused, futuristic",
    dark: {
      bg: "#0B0E1A", surface: "#151A2E", surfaceAlt: "#1E2440", stroke: "#2C3354",
      text: "#F2F5FF", textMuted: "#8597DC", primary: "#6886FF", primaryText: "#0B0E1A",
      secondary: "#8B5CF6", accent: "#22D3EE", success: "#1D845F", warning: "#FBBF24", danger: "#E80B0B",
    },
    light: {
      bg: "#F5F7FF", surface: "#FFFFFF", surfaceAlt: "#EEF1FC", stroke: "#D5DBF2",
      text: "#141829", textMuted: "#3249AC", primary: "#3859FF", primaryText: "#FFFFFF",
      secondary: "#7C3AED", accent: "#0891B2", success: "#04855D", warning: "#A25904", danger: "#DC2626",
    },
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    mood: "molten amber and ember orange — energetic, arcade-hot, loud",
    dark: {
      bg: "#1A0F08", surface: "#2A180C", surfaceAlt: "#3A2110", stroke: "#57351B",
      text: "#FFF4E6", textMuted: "#D7A375", primary: "#FF8A3D", primaryText: "#1A0F08",
      secondary: "#FFC24B", accent: "#FF5470", success: "#338527", warning: "#FFC24B", danger: "#EA0026",
    },
    light: {
      bg: "#FFF8F0", surface: "#FFFFFF", surfaceAlt: "#FDEEDC", stroke: "#F0D5B4",
      text: "#2A180C", textMuted: "#985E2C", primary: "#B24E10", primaryText: "#FFFFFF",
      secondary: "#D99A1F", accent: "#E23D5F", success: "#27862B", warning: "#AF5109", danger: "#C2304C",
    },
  },
  {
    id: "emerald-terminal",
    name: "Emerald Terminal",
    mood: "phosphor green on carbon — hacker, precise, engineering-first",
    dark: {
      bg: "#071108", surface: "#0E1D12", surfaceAlt: "#14291A", stroke: "#1F4229",
      text: "#E8FFEF", textMuted: "#5DD07F", primary: "#2ECC71", primaryText: "#071108",
      secondary: "#A7F3D0", accent: "#FDE047", success: "#1E854A", warning: "#FDE047", danger: "#E71414",
    },
    light: {
      bg: "#F2FBF4", surface: "#FFFFFF", surfaceAlt: "#E3F5E8", stroke: "#C4E3CD",
      text: "#0B1F12", textMuted: "#247A3F", primary: "#117D39", primaryText: "#FFFFFF",
      secondary: "#0F766E", accent: "#CA8A04", success: "#12863D", warning: "#906303", danger: "#DC2626",
    },
  },
  {
    id: "candy-pop",
    name: "Candy Pop",
    mood: "bubblegum pastels with punchy outlines — playful, kid-friendly, bright",
    dark: {
      bg: "#1C1030", surface: "#2A1B47", surfaceAlt: "#37245F", stroke: "#4D3280",
      text: "#FFF0FC", textMuted: "#C3A3E4", primary: "#FF6FB5", primaryText: "#1C1030",
      secondary: "#7DD3FC", accent: "#FDE047", success: "#188640", warning: "#FB923C", danger: "#E90727",
    },
    light: {
      bg: "#FDF4FF", surface: "#FFFFFF", surfaceAlt: "#FBE8F8", stroke: "#EDCFF2",
      text: "#331B4D", textMuted: "#733CC6", primary: "#CB156F", primaryText: "#FFFFFF",
      secondary: "#0EA5E9", accent: "#EAB308", success: "#178640", warning: "#B14B05", danger: "#E80D33",
    },
  },
  {
    id: "mono-slate",
    name: "Mono Slate",
    mood: "restrained grayscale with one decisive blue — minimal, professional, tool-like",
    dark: {
      bg: "#0D0F12", surface: "#16191E", surfaceAlt: "#1F232B", stroke: "#2E3440",
      text: "#EDF0F4", textMuted: "#7499D7", primary: "#3E9BFF", primaryText: "#0D0F12",
      secondary: "#7C8798", accent: "#3E9BFF", success: "#20825E", warning: "#F5A623", danger: "#E22213",
    },
    light: {
      bg: "#F7F8FA", surface: "#FFFFFF", surfaceAlt: "#EFF1F5", stroke: "#D9DEE7",
      text: "#16191E", textMuted: "#3163AA", primary: "#0A68D9", primaryText: "#FFFFFF",
      secondary: "#5F6B7C", accent: "#0B6FE8", success: "#108453", warning: "#965F08", danger: "#D33A2C",
    },
  },
  {
    id: "royal-arcade",
    name: "Royal Arcade",
    mood: "royal purple with gold trim — luxurious, retro-arcade, celebratory",
    dark: {
      bg: "#12081F", surface: "#1E1035", surfaceAlt: "#2A1850", stroke: "#452A75",
      text: "#F7EDFF", textMuted: "#B395E0", primary: "#FFD166", primaryText: "#12081F",
      secondary: "#9D6BFF", accent: "#FF8FA3", success: "#26844F", warning: "#FFD166", danger: "#EB0000",
    },
    light: {
      bg: "#FAF6FF", surface: "#FFFFFF", surfaceAlt: "#F1E9FD", stroke: "#DDC9F5",
      text: "#241340", textMuted: "#6433B0", primary: "#886308", primaryText: "#FFFFFF",
      secondary: "#7C3AED", accent: "#D6336C", success: "#278539", warning: "#A15300", danger: "#DF2D2D",
    },
  },
];

export function getPalette(id: string | undefined): Palette {
  const found = PALETTES.find((p) => p.id === id);
  if (found) return found;
  return PALETTES[0];
}

export function listPalettes(): Array<{ id: string; name: string; mood: string; swatch: string[] }> {
  return PALETTES.map((p) => ({
    id: p.id,
    name: p.name,
    mood: p.mood,
    swatch: [p.dark.bg, p.dark.surface, p.dark.primary, p.dark.accent, p.dark.text],
  }));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Luau Color3.fromRGB literal for a hex token. */
export function luauColor3(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `Color3.fromRGB(${r}, ${g}, ${b})`;
}

/** Full theme payload shared by every generator. */
export interface DesignSystem {
  palette: Palette;
  mode: ThemeMode;
}

export function resolveSide(ds: DesignSystem): PaletteSide {
  return ds.mode === "light" ? ds.palette.light : ds.palette.dark;
}

/** Emit the `local Theme = { ... }` token table embedded in generated modules. */
export function emitThemeModuleTokens(ds: DesignSystem, guiName: string): string {
  const s = resolveSide(ds);
  const c = (hex: string) => luauColor3(hex);
  return `-- Design tokens (${ds.palette.name} · ${ds.mode}) generated for "${guiName}".
-- Keep this table as the single source of truth for styling.
local Theme = {
        Name = "${ds.palette.id}",
        Colors = {
                bg = ${c(s.bg)},
                surface = ${c(s.surface)},
                surfaceAlt = ${c(s.surfaceAlt)},
                stroke = ${c(s.stroke)},
                text = ${c(s.text)},
                textMuted = ${c(s.textMuted)},
                primary = ${c(s.primary)},
                primaryText = ${c(s.primaryText)},
                secondary = ${c(s.secondary)},
                accent = ${c(s.accent)},
                success = ${c(s.success)},
                warning = ${c(s.warning)},
                danger = ${c(s.danger)},
        },
        Text = {
                caption = ${SCALES.text.caption},
                body = ${SCALES.text.body},
                label = ${SCALES.text.label},
                subtitle = ${SCALES.text.subtitle},
                title = ${SCALES.text.title},
                headline = ${SCALES.text.headline},
                display = ${SCALES.text.display},
                stat = ${SCALES.text.stat},
        },
        Space = { xs = 4, sm = 8, md = 12, lg = 16, xl = 24, xxl = 32, xxxl = 48 },
        Radius = { sm = ${SCALES.radius.sm}, md = ${SCALES.radius.md}, lg = ${SCALES.radius.lg}, xl = ${SCALES.radius.xl}, pill = ${SCALES.radius.pill} },
        Motion = { fast = ${SCALES.motion.fast}, base = ${SCALES.motion.base}, slow = ${SCALES.motion.slow} },
}`;
}

/** Emit a standalone Theme ModuleScript (for the design-system tool). */
export function emitThemeModule(ds: DesignSystem, guiName: string): string {
  return finalizeLuau(`${emitThemeModuleTokens(ds, guiName)}

return Theme`);
}
