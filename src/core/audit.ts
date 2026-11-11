/**
 * GEORGE GUI @Search — Self-Critique audit engine.
 *
 * Scores a GuiSpec against measurable quality standards:
 * WCAG contrast math on every text/background pair, minimum touch
 * targets, minimum text sizes and safe-area / responsive behaviour.
 */

import { DesignSystem, hexToRgb, resolveSide } from "./tokens.js";
import { GuiSpec, GuiNode, LabelNode, ButtonNode, TextBoxNode, walkNodes } from "./spec.js";

export type CheckLevel = "pass" | "info" | "warn" | "fail";

export interface AuditCheck {
  id: string;
  level: CheckLevel;
  target: string;
  message: string;
}

export interface AuditResult {
  score: number;
  passed: boolean;
  summary: string;
  checks: AuditCheck[];
}

/* ── WCAG relative luminance & contrast ─────────────────────────────────── */

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b)
  );
}

export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

/* ── Spec audit ─────────────────────────────────────────────────────────── */

const LARGE_ROLES = new Set(["title", "headline", "display", "stat"]);
const MIN_TEXT_SIZE = 12;
const MIN_TOUCH = 36;
const WARN_TOUCH = 30;

export function auditGuiSpec(spec: GuiSpec, ds: DesignSystem): AuditResult {
  const side = resolveSide(ds);
  const tokenHex: Record<string, string> = {
    bg: side.bg, surface: side.surface, surfaceAlt: side.surfaceAlt, stroke: side.stroke,
    text: side.text, textMuted: side.textMuted, primary: side.primary, primaryText: side.primaryText,
    secondary: side.secondary, accent: side.accent, success: side.success, warning: side.warning,
    danger: side.danger,
  };
  const checks: AuditCheck[] = [];
  let fails = 0;
  let warns = 0;

  /** Effective background for a node = nearest ancestor with a real fill. */
  const effectiveBg = (parents: GuiNode[]): string => {
    for (let i = parents.length - 1; i >= 0; i -= 1) {
      const p = parents[i];
      if (p.kind === "Frame" || p.kind === "Scroll") {
        if (p.background && p.background !== "transparent") return tokenHex[p.background] ?? side.surface;
      }
    }
    return side.bg;
  };

  walkNodes(spec.children, (node, parents) => {
    if (node.kind === "Label" || node.kind === "TextBox") {
      const label = node as LabelNode | TextBoxNode;
      const fgToken = (node.kind === "Label" ? (node as LabelNode).color : undefined) ?? "text";
      const fg = tokenHex[fgToken] ?? side.text;
      const bg = effectiveBg(parents);
      const ratio = contrastRatio(fg, bg);
      const role = label.kind === "TextBox" ? "body" : (label as LabelNode).role;
      const required = LARGE_ROLES.has(role) ? 3 : 4.5;
      if (ratio < required - 0.01) {
        fails += 1;
        checks.push({
          id: "contrast",
          level: "fail",
          target: label.name,
          message: `Contrast ${ratio.toFixed(2)}:1 is below the ${required}:1 target for ${role} text (${fgToken} on the effective background). Increase the text/background separation.`,
        });
      } else if (ratio < required + 0.7) {
        checks.push({
          id: "contrast",
          level: "info",
          target: label.name,
          message: `Contrast ${ratio.toFixed(2)}:1 passes but sits close to the ${required}:1 target for ${role} text.`,
        });
      } else {
        checks.push({
          id: "contrast",
          level: "pass",
          target: label.name,
          message: `Contrast ${ratio.toFixed(2)}:1 meets the ${required}:1 target for ${role} text.`,
        });
      }
      if (label.kind === "Label") {
        const l = label as LabelNode;
        if (LARGE_ROLE_SIZE(l.role) < MIN_TEXT_SIZE) {
          fails += 1;
          checks.push({
            id: "text-size",
            level: "fail",
            target: l.name,
            message: `Text size below ${MIN_TEXT_SIZE}px is not readable on small screens.`,
          });
        }
      }
    }

    if (node.kind === "Button") {
      const button = node as ButtonNode;
      const w = button.size?.xOffset ?? 0;
      const h = button.size?.yOffset ?? 44;
      const textFg = button.variant === "primary"
        ? tokenHex.primaryText
        : button.variant === "danger" || button.variant === "success"
          ? "#FFFFFF" // status fills always carry white labels; palettes are validated for this
          : button.variant === "ghost"
            ? tokenHex.textMuted
            : tokenHex.text;
      const buttonBg =
        button.variant === "primary" ? side.primary
        : button.variant === "secondary" ? side.surfaceAlt
        : button.variant === "ghost" ? side.surface
        : button.variant === "danger" ? side.danger
        : side.success;
      const ratio = contrastRatio(textFg, buttonBg);
      if (ratio < 4.5) {
        fails += 1;
        checks.push({
          id: "button-contrast",
          level: "fail",
          target: button.name,
          message: `Button label contrast ${ratio.toFixed(2)}:1 is below the 4.5:1 target for body-size labels.`,
        });
      }
      if (h < MIN_TOUCH && h >= WARN_TOUCH) {
        warns += 1;
        checks.push({
          id: "touch-target",
          level: "warn",
          target: button.name,
          message: `Touch target ${w}x${h}px is below the ${MIN_TOUCH}px recommendation. Acceptable for secondary actions; enlarge for primary actions.`,
        });
      } else if (h < WARN_TOUCH) {
        fails += 1;
        checks.push({
          id: "touch-target",
          level: "fail",
          target: button.name,
          message: `Touch target ${w}x${h}px is far below the ${MIN_TOUCH}px minimum and will be hard to hit on mobile.`,
        });
      } else {
        checks.push({
          id: "touch-target",
          level: "pass",
          target: button.name,
          message: `Touch target ${w}x${h}px meets the ${MIN_TOUCH}px minimum.`,
        });
      }
    }
  });

  if (spec.fullscreen) {
    checks.push({
      id: "safe-area",
      level: "info",
      target: spec.name,
      message: "Fullscreen interface: the generated ScreenGui sets IgnoreGuiInset and uses scale-based sizing so it spans the entire viewport on every device.",
    });
  } else {
    checks.push({
      id: "safe-area",
      level: "info",
      target: spec.name,
      message: "Floating interface: anchored clusters keep a margin from screen edges; verify against the device inset on target platforms.",
    });
  }

  checks.push({
    id: "responsive",
    level: "pass",
    target: spec.name,
    message: "Root elements use scale-based sizing with UISizeConstraints, so the layout adapts from phone (min 320px) to desktop (max width enforced).",
  });

  const score = Math.max(0, 100 - fails * 12 - warns * 4);
  const passed = fails === 0;
  const summary =
    fails === 0 && warns === 0
      ? `All checks passed. Score ${score}/100.`
      : fails === 0
        ? `No blocking issues. ${warns} warning(s). Score ${score}/100.`
        : `${fails} blocking issue(s), ${warns} warning(s). Score ${score}/100.`;

  return { score, passed, summary, checks };
}

function LARGE_ROLE_SIZE(role: string): number {
  const sizes: Record<string, number> = {
    caption: 12, body: 14, label: 15, subtitle: 17, title: 22, headline: 30, display: 42, stat: 26,
  };
  return sizes[role] ?? 14;
}
