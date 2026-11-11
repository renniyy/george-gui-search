/**
 * GEORGE GUI @Search — the GUI generation pipeline.
 *
 * Natural-language description → intent detection → design system →
 * GuiSpec (IR) → self-contained Luau ModuleScript → automatic self-critique
 * audit. Nothing is emitted without passing its own quality gate.
 */

import { DesignSystem, getPalette, Palette, ThemeMode } from "./tokens.js";
import { auditGuiSpec, AuditResult } from "./audit.js";
import { shell, ShellContext } from "./luau-shell.js";
import { templateFor } from "./kinds-a.js";
import { templateForB } from "./kinds-b.js";
import { KindOptions, KindTemplate, defaults, luauStr } from "./kinds-common.js";
import { GuiKind, GuiSpec, GuiNode, LabelNode, ButtonNode, FrameNode } from "./spec.js";
import { finalizeLuau } from "./luau-text.js";

export const GEORGE_VERSION = "1.0.1";

export interface GenerateGuiInput {
  description: string;
  kind?: GuiKind;
  palette?: string;
  mode?: ThemeMode;
  options?: KindOptions;
}

export interface GenerateGuiResult {
  kind: GuiKind;
  kindLabel: string;
  guiName: string;
  palette: { id: string; name: string };
  mode: ThemeMode;
  luau: string;
  spec: GuiSpec;
  audit: AuditResult;
  actions: string[];
  notes: string[];
}

/* ── Intent detection ───────────────────────────────────────────────────── */

const KIND_KEYWORDS: Record<GuiKind, string[]> = {
  "main-menu": ["main menu", "menu", "title screen", "title", "start screen", "play button", "lobby"],
  shop: ["shop", "store", "marketplace", "market", "buy", "purchase", "merchant", "currency", "gamepass"],
  inventory: ["inventory", "backpack", "items", "equip", "hotbar", "loadout", "bag"],
  settings: ["settings", "options", "preferences", "config", "volume", "keybind", "keybindings", "graphics"],
  hud: ["hud", "heads up display", "overlay", "stat display", "health bar", "coins display", "xp bar"],
  "loading-screen": ["loading", "load screen", "loading screen", "progress bar", "splash"],
  leaderboard: ["leaderboard", "leader board", "ranking", "ranks", "top players", "high scores"],
  notifications: ["notification", "toast", "alert", "popup message", "announcement"],
  dialogue: ["dialogue", "dialog", "npc", "talk", "speech", "conversation", "choices", "cutscene"],
  "quest-tracker": ["quest", "objective", "mission", "tracker", "tasks", "goals"],
  "profile-card": ["profile", "player card", "stats card", "badges", "avatar card"],
  custom: [],
};

export function detectKind(description: string): GuiKind {
  const text = ` ${description.toLowerCase()} `;
  let best: GuiKind = "custom";
  let bestScore = 0;
  for (const [kind, keywords] of Object.entries(KIND_KEYWORDS) as Array<[GuiKind, string[]]>) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += keyword.includes(" ") ? 3 : 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = kind;
    }
  }
  return best;
}

/* ── Naming ─────────────────────────────────────────────────────────────── */

const GUI_NAMES: Record<GuiKind, string> = {
  "main-menu": "MainMenuUI",
  shop: "ShopUI",
  inventory: "InventoryUI",
  settings: "SettingsUI",
  hud: "HudUI",
  "loading-screen": "LoadingScreenUI",
  leaderboard: "LeaderboardUI",
  notifications: "ToastUI",
  dialogue: "DialogueUI",
  "quest-tracker": "QuestTrackerUI",
  "profile-card": "ProfileCardUI",
  custom: "PanelUI",
};

/* ── Spec builders (IR mirrored from templates, used by the audit) ──────── */

function label(name: string, role: LabelNode["role"], color: LabelNode["color"], text: string, bg: FrameNode["background"]): GuiNode {
  return { kind: "Label", name, role, color, text, background: "transparent" } as LabelNode;
}

function button(name: string, variant: ButtonNode["variant"], w: number, h: number, text: string, bg: FrameNode["background"]): GuiNode {
  return {
    kind: "Button", name, variant, text, background: bg,
    size: { xScale: 0, xOffset: w, yScale: 0, yOffset: h },
  } as ButtonNode;
}

function frame(name: string, background: FrameNode["background"], children: GuiNode[]): GuiNode {
  return { kind: "Frame", name, background, children } as FrameNode;
}

function buildSpecFor(kind: GuiKind, o: Required<KindOptions>, paletteId: string, mode: ThemeMode): GuiSpec {
  let children: GuiNode[] = [];
  let fullscreen = true;

  switch (kind) {
    case "main-menu":
      children = [
        frame("Overlay", "bg", [
          label("Title", "display", "text", o.title, "bg"),
          label("Subtitle", "subtitle", "textMuted", o.subtitle, "bg"),
          button("Play", "primary", 280, 56, "PLAY", "bg"),
          button("Shop", "ghost", 88, 44, "SHOP", "bg"),
          button("Loadout", "ghost", 88, 44, "LOADOUT", "bg"),
          button("Settings", "ghost", 88, 44, "SETTINGS", "bg"),
        ]),
      ];
      break;
    case "shop":
    case "inventory": {
      const actionLabel = kind === "shop" ? "BUY" : "EQUIP";
      const actionW = kind === "shop" ? 80 : 84;
      const cards = o.items.slice(0, 3).map((item) =>
        frame(`Card_${item.name}`, "surfaceAlt", [
          label("ItemName", "body", "text", item.name, "surfaceAlt"),
          label("ItemKind", "caption", "textMuted", item.subtitle ?? "", "surfaceAlt"),
          ...(kind === "shop" ? [label("Price", "body", "primary", item.price ?? "", "surfaceAlt")] : []),
          button(actionLabel, kind === "shop" ? "primary" : "ghost", actionW, 36, actionLabel, "surfaceAlt"),
        ])
      );
      children = [
        frame("Panel", "surface", [
          label("Title", "title", "text", o.title, "surface"),
          label("Wallet", "body", "text", `${o.stats[0].label} ${o.stats[0].value}`, "surface"),
          button("Close", "ghost", 36, 36, "X", "surface"),
          ...o.tabs.slice(0, 3).map((t, i) => button(`Tab_${t}`, "ghost", 96, 36, t, "surface")),
          ...cards,
        ]),
      ];
      break;
    }
    case "settings":
      children = [
        frame("Panel", "surface", [
          label("Title", "title", "text", o.title, "surface"),
          button("Close", "ghost", 36, 36, "X", "surface"),
          frame("Row_Toggle", "surfaceAlt", [
            label("Label", "body", "text", "Camera Shake", "surfaceAlt"),
            button("Switch", "ghost", 64, 36, "", "surfaceAlt"),
          ]),
          frame("Row_Slider", "surfaceAlt", [
            label("Label", "body", "text", "Master Volume", "surfaceAlt"),
            label("Value", "body", "primary", "75", "surfaceAlt"),
          ]),
          frame("Row_Keybind", "surfaceAlt", [
            label("Label", "body", "text", "Sprint", "surfaceAlt"),
            button("Key", "ghost", 96, 36, "LeftShift", "surfaceAlt"),
          ]),
          button("Reset", "ghost", 104, 40, "RESET", "surface"),
          button("Apply", "primary", 104, 40, "APPLY", "surface"),
        ]),
      ];
      break;
    case "hud":
      fullscreen = false;
      children = [
        frame("Stats", "transparent", [
          frame("Chip", "surface", [
            label("StatName", "caption", "textMuted", o.stats[0].label, "surface"),
            label("StatValue", "body", "text", o.stats[0].value, "surface"),
          ]),
          frame("Chip2", "surface", [
            label("StatName2", "caption", "textMuted", o.stats[1].label, "surface"),
            label("StatValue2", "body", "text", o.stats[1].value, "surface"),
          ]),
        ]),
        button("Map", "ghost", 128, 128, "MAP", "transparent"),
        button("Action1", "ghost", 52, 52, "1", "transparent"),
        button("Action2", "ghost", 52, 52, "2", "transparent"),
      ];
      break;
    case "loading-screen":
      children = [
        frame("Loading", "bg", [
          label("Title", "headline", "text", o.title, "bg"),
          label("Subtitle", "subtitle", "textMuted", o.subtitle, "bg"),
          label("Status", "caption", "textMuted", "Loading...", "bg"),
          label("Tip", "body", "textMuted", `TIP ${o.tips[0]}`, "bg"),
        ]),
      ];
      break;
    case "leaderboard":
      fullscreen = false;
      children = [
        frame("Panel", "surface", [
          label("Title", "subtitle", "text", o.title, "surface"),
          button("Close", "ghost", 36, 36, "X", "surface"),
          frame("Row", "surface", [
            label("Rank", "body", "warning", "#1", "surface"),
            label("Name", "body", "text", "NovaKnight", "surface"),
            label("Value", "body", "primary", "18,420", "surface"),
          ]),
          frame("PlayerRow", "surfaceAlt", [
            label("RankP", "body", "textMuted", "#5", "surfaceAlt"),
            label("NameP", "body", "text", "You", "surfaceAlt"),
            label("ValueP", "body", "primary", "7,215", "surfaceAlt"),
          ]),
        ]),
      ];
      break;
    case "notifications":
      fullscreen = false;
      children = [
        frame("Toast", "surface", [
          label("Title", "body", "text", "Level up!", "surface"),
          label("Message", "caption", "textMuted", "You reached level 12", "surface"),
        ]),
      ];
      break;
    case "dialogue":
      children = [
        frame("Dialogue", "surface", [
          label("Speaker", "subtitle", "primary", "Elder Rowan", "surface"),
          label("Text", "body", "text", "The nebula stirs, traveller...", "surface"),
          button("Choice1", "ghost", 0, 40, "Ask about the temple", "surfaceAlt"),
        ]),
      ];
      break;
    case "quest-tracker":
      fullscreen = false;
      children = [
        frame("QuestTracker", "surface", [
          label("Title", "subtitle", "text", o.title, "surface"),
          label("Objective1", "body", "text", o.objectives[0].text, "surface"),
          label("Objective2", "body", "textMuted", o.objectives[1].text, "surface"),
          label("Progress", "caption", "textMuted", "1 / 3 COMPLETE", "surface"),
        ]),
      ];
      break;
    case "profile-card":
      children = [
        frame("Card", "surface", [
          label("DisplayName", "headline", "text", o.playerName, "surface"),
          label("Handle", "body", "textMuted", `@${o.playerName.toLowerCase()}`, "surface"),
          frame("LevelChip", "primary", [label("Level", "caption", "primaryText", "LEVEL 12", "primary")]),
          frame("StatCell", "surfaceAlt", [
            label("StatValue", "stat", "text", "132", "surfaceAlt"),
            label("StatLabel", "caption", "textMuted", "WINS", "surfaceAlt"),
          ]),
          button("ViewProfile", "primary", 0, 44, "VIEW FULL PROFILE", "surface"),
          button("Close", "ghost", 36, 36, "X", "surface"),
        ]),
      ];
      break;
    default:
      children = [
        frame("Panel", "surface", [
          label("Title", "title", "text", o.title, "surface"),
          label("Subtitle", "body", "textMuted", o.subtitle, "surface"),
          button("Confirm", "primary", 132, 44, "CONFIRM", "surface"),
          button("Cancel", "ghost", 132, 44, "CANCEL", "surface"),
          button("Close", "ghost", 36, 36, "X", "surface"),
        ]),
      ];
  }

  return {
    kind,
    name: GUI_NAMES[kind],
    title: o.title,
    subtitle: o.subtitle,
    paletteId,
    mode,
    fullscreen,
    children,
    notes: [],
  };
}

/* ── Custom panel (generic dialog) ──────────────────────────────────────── */

const customTemplate: KindTemplate = {
  kindLabel: "Custom panel / dialog",
  usageNote: `-- Actions: "confirm", "cancel", "close".`,
  buildBody: (o) => `\tlocal overlay = create("CanvasGroup", {
		Name = "Overlay",
		BackgroundColor3 = Theme.Colors.bg,
		BackgroundTransparency = 0.5,
		GroupTransparency = 1,
		Size = UDim2.fromScale(1, 1),
	}, screen)

	local root = create("Frame", {
		Name = "Panel",
		BackgroundColor3 = Theme.Colors.surface,
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5),
		Size = UDim2.new(0.88, 0, 0, 0),
		AutomaticSize = Enum.AutomaticSize.Y,
	}, overlay)
	create("UIScale", { Scale = 0.97 }, root)
	create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.lg) }, root)
	create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.15 }, root)
	create("UISizeConstraint", { MaxSize = Vector2.new(480, 640), MinSize = Vector2.new(300, 200) }, root)
	create("UIPadding", {
		PaddingLeft = UDim.new(0, Theme.Space.xl),
		PaddingRight = UDim.new(0, Theme.Space.xl),
		PaddingTop = UDim.new(0, Theme.Space.xl),
		PaddingBottom = UDim.new(0, Theme.Space.xl),
	}, root)
	create("UIListLayout", {
		FillDirection = Enum.FillDirection.Vertical,
		Padding = UDim.new(0, Theme.Space.lg),
		HorizontalAlignment = Enum.HorizontalAlignment.Center,
		SortOrder = Enum.SortOrder.LayoutOrder,
	}, root)

	local title = create("TextLabel", {
		Name = "Title",
		BackgroundTransparency = 1,
		FontFace = Font.fromEnum(Enum.Font.GothamBold),
		Text = "${luauStr(o.title)}",
		TextColor3 = Theme.Colors.text,
		TextSize = Theme.Text.title,
		Size = UDim2.new(1, 0, 0, 32),
		LayoutOrder = 1,
		TextWrapped = true,
	}, root)

	local subtitle = create("TextLabel", {
		Name = "Subtitle",
		BackgroundTransparency = 1,
		FontFace = Font.fromEnum(Enum.Font.Gotham),
		Text = "${luauStr(o.subtitle)}",
		TextColor3 = Theme.Colors.textMuted,
		TextSize = Theme.Text.body,
		Size = UDim2.new(1, 0, 0, 0),
		AutomaticSize = Enum.AutomaticSize.Y,
		LayoutOrder = 2,
		TextXAlignment = Enum.TextXAlignment.Left,
		TextWrapped = true,
	}, root)

	local buttons = create("Frame", {
		Name = "Buttons",
		BackgroundTransparency = 1,
		Size = UDim2.new(1, 0, 0, 44),
		LayoutOrder = 3,
	}, root)
	create("UIListLayout", {
		FillDirection = Enum.FillDirection.Horizontal,
		Padding = UDim.new(0, Theme.Space.md),
		HorizontalAlignment = Enum.HorizontalAlignment.Center,
		SortOrder = Enum.SortOrder.LayoutOrder,
	}, buttons)

	local cancel = create("TextButton", {
		Name = "Cancel",
		BackgroundColor3 = Theme.Colors.surfaceAlt,
		FontFace = Font.fromEnum(Enum.Font.GothamMedium),
		Text = "CANCEL",
		TextColor3 = Theme.Colors.text,
		TextSize = Theme.Text.body,
		Size = UDim2.fromOffset(132, 44),
		LayoutOrder = 1,
	}, buttons)
	create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, cancel)
	hookButton(cancel, "cancel", fire)

	local confirm = create("TextButton", {
		Name = "Confirm",
		BackgroundColor3 = Theme.Colors.primary,
		FontFace = Font.fromEnum(Enum.Font.GothamBold),
		Text = "CONFIRM",
		TextColor3 = Theme.Colors.primaryText,
		TextSize = Theme.Text.body,
		Size = UDim2.fromOffset(132, 44),
		LayoutOrder = 2,
	}, buttons)
	create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, confirm)
	hookButton(confirm, "confirm", fire)
`,
  controllerExtras: () => `\tfunction controller.setTitle(newTitle: string)
		title.Text = newTitle
	end

	function controller.setSubtitle(newSubtitle: string)
		subtitle.Text = newSubtitle
	end
`,
  open: `\t\toverlay.GroupTransparency = 1
\t\twithTween(overlay, { GroupTransparency = 0 }, Theme.Motion.base)
\t\twithTween(root:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base, Enum.EasingStyle.Back)`,
  close: `\t\twithTween(overlay, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

/* ── Main entry ─────────────────────────────────────────────────────────── */

function templateForAny(kind: GuiKind): KindTemplate {
  return templateFor(kind) ?? templateForB(kind) ?? customTemplate;
}

export function generateGui(input: GenerateGuiInput): GenerateGuiResult {
  const kind: GuiKind = input.kind && input.kind !== "custom" ? input.kind : detectKind(input.description);
  const palette: Palette = getPalette(input.palette);
  const mode: ThemeMode = input.mode ?? "dark";
  const ds: DesignSystem = { palette, mode };
  const o = defaults(input.options ?? {}, kind);
  const template = templateForAny(kind);
  const guiName = GUI_NAMES[kind];

  const ctx: ShellContext = {
    guiName,
    kindLabel: template.kindLabel,
    ds,
    version: GEORGE_VERSION,
  };

  const luau = finalizeLuau(shell(ctx, template.usageNote, template.buildBody(o), template.controllerExtras(o), template.open, template.close));
  const spec = buildSpecFor(kind, o, palette.id, mode);
  const audit = auditGuiSpec(spec, ds);

  const notes = [
    `Place this single ModuleScript (named ${guiName}) anywhere shared, e.g. ReplicatedStorage/UI.`,
    `Mount it from a LocalScript: local ui = require(...).mount(); ui:open(); wire behaviour with ui:on(action, handler).`,
    `Icon placeholders are marked "DROP ICON HERE" — assign ImageLabel.Image assets or swap the frame for your own art.`,
    `All styling flows from the embedded Theme table; change tokens once and the whole interface updates.`,
  ];
  if (kind === "shop" || kind === "inventory") {
    notes.push(`Feed live data with ui:setItems(...), and re-render categories with ui:setTab(name).`);
  }
  if (kind === "settings") {
    notes.push(`Read current setting values any time via ui.values.<id>; listen for changes on the "setting_changed" action.`);
  }
  if (!audit.passed) {
    notes.push(`Audit found blocking issues (${audit.summary}) — fix them before shipping.`);
  }

  const actions = kind === "main-menu"
    ? ["play", "shop", "loadout", "settings"]
    : kind === "shop"
      ? ["close", "tab", "buy"]
      : kind === "inventory"
        ? ["close", "tab", "equip"]
        : kind === "settings"
          ? ["close", "reset", "apply", "setting_changed", "rebind"]
          : kind === "hud"
            ? ["map", "action_1", "action_2"]
            : kind === "dialogue"
              ? ["choice", "advance"]
              : kind === "profile-card"
                ? ["close", "view_profile"]
                : ["close", "confirm", "cancel"];

  return {
    kind,
    kindLabel: template.kindLabel,
    guiName,
    palette: { id: palette.id, name: palette.name },
    mode,
    luau,
    spec,
    audit,
    actions,
    notes,
  };
}

export { buildSpecFor };
