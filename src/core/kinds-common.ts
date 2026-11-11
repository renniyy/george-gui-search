/**
 * GEORGE GUI @Search — shared types and helpers for interface kind templates.
 */

export interface ItemDef {
  name: string;
  subtitle?: string;
  price?: string;
  badge?: string;
}

export interface StatDef {
  label: string;
  value: string;
}

export interface ObjectiveDef {
  text: string;
  done?: boolean;
}

export interface KindOptions {
  title?: string;
  subtitle?: string;
  tabs?: string[];
  items?: ItemDef[];
  stats?: StatDef[];
  objectives?: ObjectiveDef[];
  actions?: string[];
  tips?: string[];
  version?: string;
  playerName?: string;
  sections?: Array<{ name: string }>;
}

export interface KindTemplate {
  kindLabel: string;
  usageNote: string;
  buildBody: (o: Required<KindOptions>) => string;
  controllerExtras: (o: Required<KindOptions>) => string;
  open: string;
  close: string;
}

/** Escape a string for a double-quoted Luau literal. */
export function luauStr(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, " ")
    .replace(/\t/g, " ");
}

/** Emit a Luau table of item definitions. */
export function itemsLuau(items: ItemDef[]): string {
  const rows = items.map(
    (i) =>
      `\t\t{ name = "${luauStr(i.name)}", subtitle = "${luauStr(i.subtitle ?? "")}", price = "${luauStr(i.price ?? "")}", badge = "${luauStr(i.badge ?? "")}" },`
  );
  return `{\n${rows.join("\n")}\n\t}`;
}

/** Standard controller extra: expose a widget by name. */
export function widgetExtras(widgetNames: string[]): string {
  return widgetNames
    .map(
      (w) => `\twidgets["${w}"] = ${w}
`
    )
    .join("");
}

export function defaults(options: KindOptions, kind: string): Required<KindOptions> {
  const o: Required<KindOptions> = {
    title: options.title ?? defaultTitle(kind),
    subtitle: options.subtitle ?? defaultSubtitle(kind),
    tabs: options.tabs && options.tabs.length > 0 ? options.tabs : ["Featured", "Gear", "Bundles"],
    items:
      options.items && options.items.length > 0
        ? options.items
        : [
            { name: "Speed Coil", subtitle: "Movement", price: "250", badge: "HOT" },
            { name: "Gravity Belt", subtitle: "Movement", price: "400" },
            { name: "Laser Blade", subtitle: "Weapon", price: "750", badge: "NEW" },
            { name: "Arc Visor", subtitle: "Cosmetic", price: "120" },
            { name: "Nova Wings", subtitle: "Cosmetic", price: "1500", badge: "RARE" },
            { name: "Compass Drone", subtitle: "Utility", price: "600" },
          ],
    stats:
      options.stats && options.stats.length > 0
        ? options.stats
        : [
            { label: "COINS", value: "1,250" },
            { label: "GEMS", value: "42" },
          ],
    objectives:
      options.objectives && options.objectives.length > 0
        ? options.objectives
        : [
            { text: "Collect 3 star fragments", done: true },
            { text: "Defeat the nebula guardian", done: false },
            { text: "Reach the sky temple", done: false },
          ],
    actions:
      options.actions && options.actions.length > 0
        ? options.actions
        : kind === "main-menu"
          ? ["play", "shop", "loadout", "settings"]
          : ["close", "confirm"],
    tips:
      options.tips && options.tips.length > 0
        ? options.tips
        : [
            "Hold shift to sprint",
            "Double jump unlocks after the sky temple",
            "Trade spare coils at the merchant",
            "Daily rewards reset at midnight",
          ],
    version: options.version ?? "v1.0.0",
    playerName: options.playerName ?? "Player",
    sections: options.sections ?? [{ name: "Gameplay" }, { name: "Audio" }, { name: "Controls" }],
  };
  return o;
}

function defaultTitle(kind: string): string {
  switch (kind) {
    case "main-menu": return "NEBULA RUN";
    case "shop": return "Shop";
    case "inventory": return "Inventory";
    case "settings": return "Settings";
    case "hud": return "HUD";
    case "loading-screen": return "NEBULA RUN";
    case "leaderboard": return "Leaderboard";
    case "notifications": return "Notifications";
    case "dialogue": return "Dialogue";
    case "quest-tracker": return "Active Quest";
    case "profile-card": return "Player Profile";
    default: return "Panel";
  }
}

function defaultSubtitle(kind: string): string {
  switch (kind) {
    case "main-menu": return "Build beyond imagination";
    case "loading-screen": return "Charging the nebula";
    case "shop": return "Spend your hard-earned coins";
    case "inventory": return "Everything you carry";
    default: return "";
  }
}
