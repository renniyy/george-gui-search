/**
 * GEORGE GUI @Search — GuiSpec intermediate representation.
 *
 * Every generated interface is first described as a GuiSpec tree, then:
 *  - the emitter turns it into a self-contained Luau ModuleScript,
 *  - the audit engine scores the same tree for contrast, touch targets,
 *    readability and responsive behaviour.
 */

export type ColorToken =
  | "bg" | "surface" | "surfaceAlt" | "stroke" | "text" | "textMuted"
  | "primary" | "primaryText" | "secondary" | "accent" | "success" | "warning" | "danger";

export type TextRole =
  | "display" | "headline" | "title" | "subtitle" | "label" | "body" | "caption" | "stat";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type CornerSize = "sm" | "md" | "lg" | "xl" | "pill" | "none";
export type GuiKind =
  | "main-menu" | "shop" | "inventory" | "settings" | "hud" | "loading-screen"
  | "leaderboard" | "notifications" | "dialogue" | "quest-tracker" | "profile-card" | "custom";

export interface UDim2Spec {
  xScale: number; xOffset: number;
  yScale: number; yOffset: number;
}

export interface NodeBase {
  name: string;
  size?: UDim2Spec;
  position?: UDim2Spec;
  anchorPoint?: { x: number; y: number };
  background?: ColorToken | "transparent";
  corner?: CornerSize;
  stroke?: { color: ColorToken; thickness: number; transparency?: number };
  padding?: number;
  transparency?: number;
  layoutOrder?: number;
  visible?: boolean;
}

export interface ListLayout {
  direction: "Vertical" | "Horizontal";
  gap: number;
  horizontalAlign?: "Left" | "Center" | "Right";
  verticalAlign?: "Top" | "Center" | "Bottom";
}

export interface FrameNode extends NodeBase {
  kind: "Frame";
  children?: GuiNode[];
  list?: ListLayout;
}

export interface ScrollNode extends NodeBase {
  kind: "Scroll";
  children?: GuiNode[];
  scrollbarThickness?: number;
}

export interface LabelNode extends NodeBase {
  kind: "Label";
  text: string;
  role: TextRole;
  color?: ColorToken;
  align?: "Left" | "Center" | "Right";
  wrap?: boolean;
}

export interface ButtonNode extends NodeBase {
  kind: "Button";
  text: string;
  variant: ButtonVariant;
  height?: number;
  width?: "auto" | "fill";
  action?: string;
}

export interface TextBoxNode extends NodeBase {
  kind: "TextBox";
  placeholder: string;
  role?: TextRole;
  multiline?: boolean;
  action?: string;
}

export interface DividerNode extends NodeBase {
  kind: "Divider";
}

export interface ToggleNode extends NodeBase {
  kind: "Toggle";
  label: string;
  description?: string;
  default: boolean;
  action?: string;
}

export interface SliderNode extends NodeBase {
  kind: "Slider";
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
  action?: string;
}

export interface TabsNode extends NodeBase {
  kind: "Tabs";
  tabs: string[];
  defaultTab?: string;
  action?: string;
}

export interface StatNode extends NodeBase {
  kind: "Stat";
  label: string;
  value: string;
  icon?: string;
  width?: number;
}

export interface ProgressNode extends NodeBase {
  kind: "Progress";
  value: number;
  showLabel?: boolean;
  height?: number;
}

export interface ImageSlotNode extends NodeBase {
  kind: "ImageSlot";
  caption: string;
  ratio?: number;
}

export interface ItemGridNode extends NodeBase {
  kind: "ItemGrid";
  variant: "shop" | "inventory" | "achievements";
  defaults?: Array<{ name: string; subtitle?: string; price?: string; badge?: string }>;
  action?: string;
}

export interface KeybindNode extends NodeBase {
  kind: "Keybind";
  label: string;
  key: string;
  action?: string;
}

export type GuiNode =
  | FrameNode | ScrollNode | LabelNode | ButtonNode | TextBoxNode | DividerNode
  | ToggleNode | SliderNode | TabsNode | StatNode | ProgressNode | ImageSlotNode
  | ItemGridNode | KeybindNode;

export interface GuiSpec {
  kind: GuiKind;
  name: string;
  title: string;
  subtitle?: string;
  paletteId: string;
  mode: "dark" | "light";
  /** true = covers the full viewport (menus, loading); false = floating cluster (HUD). */
  fullscreen: boolean;
  children: GuiNode[];
  notes: string[];
}

export function udim2(xScale: number, xOffset: number, yScale: number, yOffset: number): UDim2Spec {
  return { xScale, xOffset, yScale, yOffset };
}

export function fillParent(): UDim2Spec {
  return udim2(1, 0, 1, 0);
}

export function walkNodes(nodes: GuiNode[], visit: (node: GuiNode, parents: GuiNode[]) => void, parents: GuiNode[] = []): void {
  for (const node of nodes) {
    visit(node, parents);
    const children: GuiNode[] =
      node.kind === "Frame" ? node.children ?? []
      : node.kind === "Scroll" ? node.children ?? []
      : [];
    walkNodes(children, visit, [...parents, node]);
  }
}
