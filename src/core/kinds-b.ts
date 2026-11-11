/**
 * GEORGE GUI @Search — interface kind templates (part 2):
 * hud, loading-screen, leaderboard, notifications, dialogue, quest-tracker,
 * profile-card.
 */

import { KindTemplate, luauStr } from "./kinds-common.js";

/* ─────────────────────────────────── hud ────────────────────────────────── */

const hud: KindTemplate = {
  kindLabel: "In-game HUD with stat chips, XP bar and action buttons",
  usageNote: `-- Always-on HUD. Actions: "action_1", "action_2" (buttons), "map".
-- Update live values with ui:setStats / ui:setProgress.`,
  buildBody: (o) => `\tlocal root = create("CanvasGroup", {
                Name = "Hud",
                BackgroundTransparency = 1,
                GroupTransparency = 1,
                Size = UDim2.fromScale(1, 1),
        }, screen)

        -- Top-left: stat cluster
        local statsPanel = create("Frame", {
                Name = "Stats",
                BackgroundTransparency = 1,
                Position = UDim2.fromOffset(Theme.Space.lg, Theme.Space.lg),
                Size = UDim2.fromOffset(190, 96),
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.sm),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, statsPanel)

        local statLabels: { { TextLabel } } = {}
        local statDefs = {
                { "${luauStr(o.stats[0].label)}", "${luauStr(o.stats[0].value)}" },
                { "${luauStr(o.stats[1]?.label ?? "GEMS")}", "${luauStr(o.stats[1]?.value ?? "0")}" },
        }
        for index, def in statDefs do
                local chip = create("Frame", {
                        Name = def[1],
                        BackgroundColor3 = Theme.Colors.surface,
                        BackgroundTransparency = 0.15,
                        Size = UDim2.fromOffset(190, 36),
                        LayoutOrder = index,
                }, statsPanel)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, chip)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.4 }, chip)
                create("UIPadding", {
                        PaddingLeft = UDim.new(0, Theme.Space.lg),
                        PaddingRight = UDim.new(0, Theme.Space.lg),
                }, chip)

                local nameLabel = create("TextLabel", {
                        Name = "StatName",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.Gotham),
                        Text = def[1],
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.caption,
                        Size = UDim2.new(0.45, 0, 1, 0),
                        TextXAlignment = Enum.TextXAlignment.Left,
                }, chip)

                local valueLabel = create("TextLabel", {
                        Name = "StatValue",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = def[2],
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        AnchorPoint = Vector2.new(1, 0),
                        Position = UDim2.new(1, 0, 0, 0),
                        Size = UDim2.new(0.55, 0, 1, 0),
                        TextXAlignment = Enum.TextXAlignment.Right,
                }, chip)

                table.insert(statLabels, { nameLabel, valueLabel })
        end

        -- XP bar
        local xpWrap = create("Frame", {
                Name = "Xp",
                BackgroundTransparency = 1,
                Size = UDim2.new(1, 0, 0, 22),
                LayoutOrder = 3,
        }, statsPanel)
        local levelChip = create("TextLabel", {
                Name = "Level",
                BackgroundColor3 = Theme.Colors.primary,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "LV 12",
                TextColor3 = Theme.Colors.primaryText,
                TextSize = Theme.Text.caption,
                Size = UDim2.fromOffset(52, 22),
        }, xpWrap)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, levelChip)
        local xpTrack = create("Frame", {
                Name = "Track",
                BackgroundColor3 = Theme.Colors.surface,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, 0, 0, 1),
                Size = UDim2.new(1, -60, 0, 18),
        }, xpWrap)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, xpTrack)
        local xpFill = create("Frame", {
                Name = "Fill",
                BackgroundColor3 = Theme.Colors.accent,
                Size = UDim2.fromScale(0.64, 1),
        }, xpTrack)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, xpFill)

        -- Top-right: minimap slot
        local mapSlot = create("TextButton", {
                Name = "Map",
                BackgroundColor3 = Theme.Colors.surface,
                BackgroundTransparency = 0.15,
                FontFace = Font.fromEnum(Enum.Font.Gotham),
                Text = "MAP",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.caption,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, -Theme.Space.lg, 0, Theme.Space.lg),
                Size = UDim2.fromOffset(128, 128),
        }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.lg) }, mapSlot)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.35 }, mapSlot)
        hookButton(mapSlot, "map", fire)

        -- Bottom-right: action buttons
        local actions = create("Frame", {
                Name = "Actions",
                BackgroundTransparency = 1,
                AnchorPoint = Vector2.new(1, 1),
                Position = UDim2.new(1, -Theme.Space.lg, 1, -Theme.Space.lg),
                Size = UDim2.fromOffset(120, 52),
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Horizontal,
                Padding = UDim.new(0, Theme.Space.md),
                HorizontalAlignment = Enum.HorizontalAlignment.Right,
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, actions)

        local function actionButton(text: string, actionName: string, order: number)
                local button = create("TextButton", {
                        Name = actionName,
                        BackgroundColor3 = Theme.Colors.surface,
                        BackgroundTransparency = 0.1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = text,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.caption,
                        Size = UDim2.fromOffset(52, 52),
                        LayoutOrder = order,
                }, actions)
                create("UICorner", { CornerRadius = UDim.new(1, 0) }, button)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.35 }, button)
                hookButton(button, actionName, fire)
                return button
        end

        actionButton("1", "action_1", 1)
        actionButton("2", "action_2", 2)
`,
  controllerExtras: () => `\tfunction controller.setStats(values: { string })
                for index, value in values do
                        local pair = statLabels[index]
                        if pair ~= nil then
                                pair[2].Text = value
                        end
                end
        end

        function controller.setProgress(level: number, ratio: number)
                levelChip.Text = "LV " .. tostring(level)
                withTween(xpFill, { Size = UDim2.fromScale(math.clamp(ratio, 0, 1), 1) }, Theme.Motion.slow)
        end
`,
  open: `\t\twithTween(root, { GroupTransparency = 0 }, Theme.Motion.slow)`,
  close: `\t\twithTween(root, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

/* ───────────────────────────── loading-screen ───────────────────────────── */

const loadingScreen: KindTemplate = {
  kindLabel: "Loading screen with spinner, progress bar and cycling tips",
  usageNote: `-- Drive the bar with ui:setProgress(0.42, "Loading terrain...").
-- Tips rotate automatically every few seconds.`,
  buildBody: (o) => `\tlocal root = create("CanvasGroup", {
                Name = "Loading",
                BackgroundColor3 = Theme.Colors.bg,
                GroupTransparency = 1,
                Size = UDim2.fromScale(1, 1),
        }, screen)

        local content = create("Frame", {
                Name = "Content",
                BackgroundTransparency = 1,
                AnchorPoint = Vector2.new(0.5, 0.5),
                Position = UDim2.fromScale(0.5, 0.5),
                Size = UDim2.new(0.85, 0, 0, 260),
        }, root)
        create("UIScale", { Scale = 0.97 }, content)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.lg),
                HorizontalAlignment = Enum.HorizontalAlignment.Center,
                VerticalAlignment = Enum.VerticalAlignment.Center,
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, content)

        local title = create("TextLabel", {
                Name = "Title",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBlack),
                Text = "${luauStr(o.title)}",
                TextColor3 = Theme.Colors.text,
                TextSize = Theme.Text.headline,
                Size = UDim2.fromOffset(560, 48),
                LayoutOrder = 1,
        }, content)

        local subtitle = create("TextLabel", {
                Name = "Subtitle",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                Text = "${luauStr(o.subtitle)}",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.subtitle,
                Size = UDim2.fromOffset(560, 24),
                LayoutOrder = 2,
        }, content)

        -- Spinner: two counter-rotating rounded frames
        local spinner = create("Frame", {
                Name = "Spinner",
                BackgroundTransparency = 1,
                Size = UDim2.fromOffset(56, 56),
                LayoutOrder = 3,
        }, content)
        local ringA = create("Frame", {
                Name = "RingA",
                BackgroundColor3 = Theme.Colors.primary,
                AnchorPoint = Vector2.new(0.5, 0.5),
                Position = UDim2.fromScale(0.5, 0.5),
                Size = UDim2.fromOffset(56, 56),
        }, spinner)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, ringA)
        create("UICorner", { CornerRadius = UDim.new(0, 14) }, ringA)
        local ringB = create("Frame", {
                Name = "RingB",
                BackgroundColor3 = Theme.Colors.accent,
                AnchorPoint = Vector2.new(0.5, 0.5),
                Position = UDim2.fromScale(0.5, 0.5),
                Size = UDim2.fromOffset(38, 38),
        }, spinner)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, ringB)
        create("UICorner", { CornerRadius = UDim.new(0, 10) }, ringB)

        TweenService:Create(ringA, TweenInfo.new(0.9, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, -1), { Rotation = 360 })
		:Play()
        TweenService:Create(ringB, TweenInfo.new(1.3, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, -1), { Rotation = -360 })
		:Play()

        -- Progress
        local progressWrap = create("Frame", {
                Name = "ProgressWrap",
                BackgroundTransparency = 1,
                Size = UDim2.new(1, -40, 0, 44),
                LayoutOrder = 4,
        }, content)
        local statusLabel = create("TextLabel", {
                Name = "Status",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.Gotham),
                Text = "Loading...",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.caption,
                Position = UDim2.fromOffset(0, 0),
                Size = UDim2.new(1, 0, 0, 16),
                TextXAlignment = Enum.TextXAlignment.Left,
        }, progressWrap)
        local track = create("Frame", {
                Name = "Track",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                AnchorPoint = Vector2.new(0, 1),
                Position = UDim2.new(0, 0, 1, -10),
                Size = UDim2.new(1, 0, 0, 8),
        }, progressWrap)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, track)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.3 }, track)
        local fill = create("Frame", {
                Name = "Fill",
                BackgroundColor3 = Theme.Colors.primary,
                Size = UDim2.fromScale(0, 1),
        }, track)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, fill)

        local tip = create("TextLabel", {
                Name = "Tip",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                Text = "TIP  ${luauStr(o.tips[0])}",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.body,
                Size = UDim2.new(1, 0, 0, 20),
                LayoutOrder = 5,
                TextWrapped = true,
        }, content)

        local tips = {
                ${o.tips.map((t) => `"${luauStr(t)}"`).join(",\n\t\t")},
        }
        task.spawn(function()
                local index = 1
                while screen.Parent ~= nil do
                        task.wait(4)
                        if screen.Parent == nil then
                                break
                        end
                        index = index % #tips + 1
                        withTween(tip, { TextTransparency = 1 }, Theme.Motion.fast)
                        task.wait(Theme.Motion.fast)
                        tip.Text = "TIP  " .. tips[index]
                        withTween(tip, { TextTransparency = 0 }, Theme.Motion.fast)
                end
        end)
`,
  controllerExtras: () => `\tfunction controller.setProgress(ratio: number, status: string?)
                withTween(fill, { Size = UDim2.fromScale(math.clamp(ratio, 0, 1), 1) }, Theme.Motion.slow)
                if status ~= nil then
                        statusLabel.Text = status
                end
        end

        function controller.setStatus(status: string)
                statusLabel.Text = status
        end
`,
  open: `\t\troot.GroupTransparency = 1
\t\twithTween(root, { GroupTransparency = 0 }, Theme.Motion.fast)
\t\twithTween(content:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base)`,
  close: `\t\twithTween(root, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

/* ─────────────────────────────── leaderboard ────────────────────────────── */

const leaderboard: KindTemplate = {
  kindLabel: "Leaderboard panel with ranked rows",
  usageNote: `-- Actions: "close". Feed rows with ui:setRows({
--   { name = "...", value = "...", isPlayer = false } }).`,
  buildBody: () => `\tlocal root = create("Frame", {
                Name = "Leaderboard",
                BackgroundColor3 = Theme.Colors.surface,
                AnchorPoint = Vector2.new(1, 0.5),
                Position = UDim2.new(1.35, 0, 0.5, 0),
                Size = UDim2.fromOffset(300, 420),
        }, screen)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.lg) }, root)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.15 }, root)
        create("UISizeConstraint", { MinSize = Vector2.new(260, 320) }, root)

        local header = create("Frame", {
                Name = "Header",
                BackgroundTransparency = 1,
                Position = UDim2.fromOffset(Theme.Space.lg, Theme.Space.lg),
                Size = UDim2.new(1, -Theme.Space.lg * 2, 0, 32),
        }, root)
        local title = create("TextLabel", {
                Name = "Title",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "Leaderboard",
                TextColor3 = Theme.Colors.text,
                TextSize = Theme.Text.subtitle,
                Size = UDim2.new(1, -48, 1, 0),
                TextXAlignment = Enum.TextXAlignment.Left,
        }, header)
        local close = create("TextButton", {
                Name = "Close",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "X",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.body,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, 0, 0, 0),
                Size = UDim2.fromOffset(32, 32),
        }, header)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, close)
        hookButton(close, "close", fire)

        local scroll = create("ScrollingFrame", {
                Name = "Rows",
                BackgroundTransparency = 1,
                BorderSizePixel = 0,
                Position = UDim2.fromOffset(Theme.Space.lg, Theme.Space.lg + 44),
                Size = UDim2.new(1, -Theme.Space.lg * 2, 1, -Theme.Space.lg * 2 - 44),
                CanvasSize = UDim2.new(),
                AutomaticCanvasSize = Enum.AutomaticSize.Y,
                ScrollBarThickness = 4,
                ScrollBarImageColor3 = Theme.Colors.stroke,
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.xs),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, scroll)
        create("UIPadding", { PaddingBottom = UDim.new(0, Theme.Space.sm) }, scroll)

        type RowData = { name: string, value: string, isPlayer: boolean }
        local medalColors = { Theme.Colors.warning, Theme.Colors.textMuted, Theme.Colors.secondary }

        local function makeRow(rank: number, data: RowData, order: number): Frame
                local row = create("Frame", {
                        Name = data.name,
                        BackgroundColor3 = if data.isPlayer then Theme.Colors.surfaceAlt else Theme.Colors.surface,
                        Size = UDim2.new(1, 0, 0, 44),
                        LayoutOrder = order,
                }, nil)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, row)
                if data.isPlayer then
                        create("UIStroke", { Color = Theme.Colors.primary, Thickness = 1, Transparency = 0.1 }, row)
                end

                local rankLabel = create("TextLabel", {
                        Name = "Rank",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = "#" .. tostring(rank),
                        TextColor3 = if rank <= 3 then medalColors[rank] else Theme.Colors.textMuted,
                        TextSize = Theme.Text.body,
                        Position = UDim2.fromOffset(Theme.Space.lg, 0),
                        Size = UDim2.fromOffset(40, 44),
                        TextXAlignment = Enum.TextXAlignment.Left,
                }, row)

                create("TextLabel", {
                        Name = "Name",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                        Text = data.name,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        Position = UDim2.fromOffset(Theme.Space.lg + 40, 0),
                        Size = UDim2.new(1, -Theme.Space.lg * 2 - 130, 1, 0),
                        TextXAlignment = Enum.TextXAlignment.Left,
                        TextTruncate = Enum.TextTruncate.AtEnd,
                }, row)

                create("TextLabel", {
                        Name = "Value",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = data.value,
                        TextColor3 = Theme.Colors.primary,
                        TextSize = Theme.Text.body,
                        AnchorPoint = Vector2.new(1, 0),
                        Position = UDim2.new(1, -Theme.Space.lg, 0, 0),
                        Size = UDim2.fromOffset(72, 44),
                        TextXAlignment = Enum.TextXAlignment.Right,
                }, row)

                return row
        end

        local defaultRows: { RowData } = {
                { name = "NovaKnight", value = "18,420", isPlayer = false },
                { name = "PixelPilot", value = "15,980", isPlayer = false },
                { name = "TurboTurtle", value = "12,300", isPlayer = false },
                { name = "MangoMage", value = "9,870", isPlayer = false },
                { name = "${luauStr("You")}", value = "7,215", isPlayer = true },
                { name = "DriftKing", value = "6,050", isPlayer = false },
                { name = "LunarLass", value = "4,410", isPlayer = false },
        }
        for index, data in defaultRows do
                makeRow(index, data, index).Parent = scroll
        end
`,
  controllerExtras: () => `\tfunction controller.setRows(rows: { { name: string, value: string, isPlayer: boolean? } })
                for _, child in scroll:GetChildren() do
                        if child:IsA("Frame") then
                                child:Destroy()
                        end
                end
                for index, entry in rows do
                        local data: RowData = { name = entry.name, value = entry.value, isPlayer = entry.isPlayer or false }
                        makeRow(index, data, index).Parent = scroll
                end
        end
`,
  open: `\t\twithTween(root, { Position = UDim2.new(1, -Theme.Space.lg, 0.5, 0) }, Theme.Motion.slow, Enum.EasingStyle.Back)`,
  close: `\t\twithTween(root, { Position = UDim2.new(1.35, 0, 0.5, 0) }, Theme.Motion.base)`,
};

/* ────────────────────────────── notifications ───────────────────────────── */

const notifications: KindTemplate = {
  kindLabel: "Toast notification stack",
  usageNote: `-- Push a toast: ui:push("Level up!", "You reached level 12", "success").
-- Variants: "info", "success", "warning", "danger".`,
  buildBody: () => `\tlocal root = create("Frame", {
                Name = "Toasts",
                BackgroundTransparency = 1,
                AnchorPoint = Vector2.new(0.5, 0),
                Position = UDim2.new(0.5, 0, 0, Theme.Space.xl),
                Size = UDim2.new(0.85, 0, 0, 300),
                ZIndex = 50,
        }, screen)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.sm),
                HorizontalAlignment = Enum.HorizontalAlignment.Center,
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, root)

        local toastCount = 0
        local variantColors: { [string]: Color3 } = {
                info = Theme.Colors.primary,
                success = Theme.Colors.success,
                warning = Theme.Colors.warning,
                danger = Theme.Colors.danger,
        }

        local function dismiss(toast: CanvasGroup)
                withTween(toast, { GroupTransparency = 1 }, Theme.Motion.base)
                withTween(toast:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 0.95 }, Theme.Motion.base)
                task.delay(Theme.Motion.base + 0.05, function()
                        toast:Destroy()
                        toastCount -= 1
                end)
        end

        local function push(title: string, message: string, variant: string)
                if toastCount >= 5 then
                        local oldest = root:FindFirstChildWhichIsA("CanvasGroup")
                        if oldest ~= nil then
                                dismiss(oldest :: CanvasGroup)
                        end
                end

                local color = variantColors[variant] or Theme.Colors.primary
                toastCount += 1

                local toast = create("CanvasGroup", {
                        Name = "Toast",
                        BackgroundColor3 = Theme.Colors.surface,
                        GroupTransparency = 1,
                        Size = UDim2.fromOffset(360, 64),
                        LayoutOrder = toastCount,
                }, root)
                create("UIScale", { Scale = 0.95 }, toast)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, toast)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.2 }, toast)

                local bar = create("Frame", {
                        Name = "Bar",
                        BackgroundColor3 = color,
                        Position = UDim2.fromOffset(0, 0),
                        Size = UDim2.new(0, 4, 1, 0),
                }, toast)
                create("UICorner", { CornerRadius = UDim.new(0, 2) }, bar)

                create("TextLabel", {
                        Name = "Title",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = title,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        Position = UDim2.fromOffset(Theme.Space.xl, Theme.Space.md),
                        Size = UDim2.new(1, -Theme.Space.xl - Theme.Space.lg, 0, 18),
                        TextXAlignment = Enum.TextXAlignment.Left,
                        TextTruncate = Enum.TextTruncate.AtEnd,
                }, toast)

                create("TextLabel", {
                        Name = "Message",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.Gotham),
                        Text = message,
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.caption,
                        Position = UDim2.fromOffset(Theme.Space.xl, Theme.Space.md + 22),
                        Size = UDim2.new(1, -Theme.Space.xl - Theme.Space.lg, 0, 16),
                        TextXAlignment = Enum.TextXAlignment.Left,
                        TextTruncate = Enum.TextTruncate.AtEnd,
                }, toast)

                withTween(toast, { GroupTransparency = 0 }, Theme.Motion.base)
                withTween(toast:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base, Enum.EasingStyle.Back)
                task.delay(4, function()
                        if toast.Parent ~= nil then
                                dismiss(toast)
                        end
                end)
                fire("toast", { title = title, message = message, variant = variant })
        end
`,
  controllerExtras: () => `\tcontroller.push = push

        function controller.info(title: string, message: string)
                push(title, message, "info")
        end

        function controller.success(title: string, message: string)
                push(title, message, "success")
        end

        function controller.warning(title: string, message: string)
                push(title, message, "warning")
        end

        function controller.danger(title: string, message: string)
                push(title, message, "danger")
        end
`,
  open: `\t\troot.Visible = true`,
  close: `\t\troot.Visible = false`,
};

/* ──────────────────────────────── dialogue ──────────────────────────────── */

const dialogue: KindTemplate = {
  kindLabel: "NPC dialogue box with typewriter text and choices",
  usageNote: `-- Show a line: ui:say("Elder Rowan", "The nebula stirs...", { "Ask about the temple", "Leave" })
-- Action: "choice" (payload: { index, text }), "advance".`,
  buildBody: () => `\tlocal root = create("CanvasGroup", {
                Name = "Dialogue",
                BackgroundColor3 = Theme.Colors.surface,
                GroupTransparency = 1,
                AnchorPoint = Vector2.new(0.5, 1),
                Position = UDim2.new(0.5, 0, 1, -Theme.Space.xl),
                Size = UDim2.new(0.88, 0, 0, 0),
                AutomaticSize = Enum.AutomaticSize.Y,
        }, screen)
        create("UIScale", { Scale = 0.98 }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.lg) }, root)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.15 }, root)
        create("UISizeConstraint", { MaxSize = Vector2.new(720, 400), MinSize = Vector2.new(320, 200) }, root)
        create("UIPadding", {
                PaddingLeft = UDim.new(0, Theme.Space.xl),
                PaddingRight = UDim.new(0, Theme.Space.xl),
                PaddingTop = UDim.new(0, Theme.Space.lg),
                PaddingBottom = UDim.new(0, Theme.Space.lg),
        }, root)

        local speaker = create("TextLabel", {
                Name = "Speaker",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "???",
                TextColor3 = Theme.Colors.primary,
                TextSize = Theme.Text.subtitle,
                Size = UDim2.new(1, 0, 0, 24),
                TextXAlignment = Enum.TextXAlignment.Left,
        }, root)

        local body = create("TextLabel", {
                Name = "Text",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.Gotham),
                Text = "",
                TextColor3 = Theme.Colors.text,
                TextSize = Theme.Text.body,
                Size = UDim2.new(1, 0, 0, 0),
                AutomaticSize = Enum.AutomaticSize.Y,
                TextXAlignment = Enum.TextXAlignment.Left,
                TextYAlignment = Enum.TextYAlignment.Top,
                TextWrapped = true,
                RichText = false,
        }, root)

        local choices = create("Frame", {
                Name = "Choices",
                BackgroundTransparency = 1,
                Size = UDim2.new(1, 0, 0, 0),
                AutomaticSize = Enum.AutomaticSize.Y,
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.sm),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, choices)

        local typeToken = 0
        local skipRequested = false

        local clickCatcher = create("TextButton", {
                Name = "ClickCatcher",
                BackgroundTransparency = 1,
                Text = "",
                Size = UDim2.fromScale(1, 1),
                ZIndex = 0,
        }, root)
        clickCatcher.Activated:Connect(function()
                skipRequested = true
                fire("advance", nil)
        end)

        local function renderChoices(choiceTexts: { string })
                for _, child in choices:GetChildren() do
                        if child:IsA("TextButton") then
                                child:Destroy()
                        end
                end
                for index, choiceText in choiceTexts do
                        local button = create("TextButton", {
                                Name = "Choice" .. tostring(index),
                                BackgroundColor3 = Theme.Colors.surfaceAlt,
                                FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                                Text = choiceText,
                                TextColor3 = Theme.Colors.text,
                                TextSize = Theme.Text.body,
                                Size = UDim2.new(1, 0, 0, 40),
                                LayoutOrder = index,
                                TextXAlignment = Enum.TextXAlignment.Left,
                        }, choices)
                        create("UIPadding", { PaddingLeft = UDim.new(0, Theme.Space.lg) }, button)
                        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, button)
                        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.35 }, button)
                        hookButton(button, "choice", fire, { index = index, text = choiceText })
                end
        end

        local function say(speakerName: string, text: string, choiceTexts: { string }?)
                typeToken += 1
                local token = typeToken
                skipRequested = false
                speaker.Text = speakerName
                body.Text = ""
                renderChoices({})
                task.spawn(function()
                        local length = utf8.len(text) or 0
                        for i = 1, length do
                                if token ~= typeToken or skipRequested then
                                        break
                                end
                                body.Text = string.sub(text, 1, i)
                                task.wait(0.022)
                        end
                        body.Text = text
                        if choiceTexts ~= nil then
                                renderChoices(choiceTexts)
                        end
                end)
        end

        say(
                "Elder Rowan",
                "The nebula stirs, traveller. Only one who carries a light may pass the temple gates.",
                { "Ask about the temple", "Ask about the light", "Leave" }
        )
`,
  controllerExtras: () => `\tcontroller.say = say
`,
  open: `\t\troot.GroupTransparency = 1
\t\twithTween(root, { GroupTransparency = 0 }, Theme.Motion.base)
\t\twithTween(root:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base, Enum.EasingStyle.Back)`,
  close: `\t\twithTween(root, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

/* ────────────────────────────── quest-tracker ───────────────────────────── */

const questTracker: KindTemplate = {
  kindLabel: "Active quest tracker with objectives",
  usageNote: `-- Update with ui:setQuest("Title", { { text = "...", done = true } }, 0.5).`,
  buildBody: (o) => `\tlocal root = create("Frame", {
                Name = "QuestTracker",
                BackgroundColor3 = Theme.Colors.surface,
                BackgroundTransparency = 0.08,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, -Theme.Space.lg, 0, Theme.Space.lg + 144),
                Size = UDim2.fromOffset(268, 0),
                AutomaticSize = Enum.AutomaticSize.Y,
        }, screen)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.lg) }, root)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.25 }, root)
        create("UIPadding", {
                PaddingLeft = UDim.new(0, Theme.Space.lg),
                PaddingRight = UDim.new(0, Theme.Space.lg),
                PaddingTop = UDim.new(0, Theme.Space.lg),
                PaddingBottom = UDim.new(0, Theme.Space.lg),
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.sm),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, root)

        local title = create("TextLabel", {
                Name = "Title",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "${luauStr(o.title)}",
                TextColor3 = Theme.Colors.text,
                TextSize = Theme.Text.subtitle,
                Size = UDim2.new(1, 0, 0, 22),
                TextXAlignment = Enum.TextXAlignment.Left,
                TextTruncate = Enum.TextTruncate.AtEnd,
        }, root)

        local objectives = create("Frame", {
                Name = "Objectives",
                BackgroundTransparency = 1,
                Size = UDim2.new(1, 0, 0, 0),
                AutomaticSize = Enum.AutomaticSize.Y,
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.xs),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, objectives)

        local function makeObjective(text: string, done: boolean, order: number): Frame
                local row = create("Frame", {
                        Name = "Objective",
                        BackgroundTransparency = 1,
                        Size = UDim2.new(1, 0, 0, 22),
                        LayoutOrder = order,
                }, nil)
                local checkbox = create("Frame", {
                        Name = "Checkbox",
                        BackgroundColor3 = if done then Theme.Colors.success else Theme.Colors.surfaceAlt,
                        Position = UDim2.fromOffset(0, 3),
                        Size = UDim2.fromOffset(16, 16),
                }, row)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, checkbox)
                create("UIStroke", { Color = if done then Theme.Colors.success else Theme.Colors.stroke, Thickness = 1 }, checkbox)
                if done then
                        create("TextLabel", {
                                Name = "Check",
                                BackgroundTransparency = 1,
                                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                                Text = "/",
                                TextColor3 = Theme.Colors.bg,
                                TextSize = Theme.Text.caption,
                                Size = UDim2.fromScale(1, 1),
                        }, checkbox)
                end
                create("TextLabel", {
                        Name = "Text",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                        Text = text,
                        TextColor3 = if done then Theme.Colors.textMuted else Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        Position = UDim2.fromOffset(26, 0),
                        Size = UDim2.new(1, -26, 1, 0),
                        TextXAlignment = Enum.TextXAlignment.Left,
                        TextTruncate = Enum.TextTruncate.AtEnd,
                }, row)
                return row
        end

        local defaultObjectives = {
                { text = "${luauStr(o.objectives[0]?.text ?? "Objective")}", done = ${o.objectives[0]?.done ? "true" : "false"} },
                { text = "${luauStr(o.objectives[1]?.text ?? "Objective 2")}", done = ${o.objectives[1]?.done ? "true" : "false"} },
                { text = "${luauStr(o.objectives[2]?.text ?? "Objective 3")}", done = ${o.objectives[2]?.done ? "true" : "false"} },
        }
        for index, objective in defaultObjectives do
                makeObjective(objective.text, objective.done, index).Parent = objectives
        end

        local track = create("Frame", {
                Name = "Track",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                Size = UDim2.new(1, 0, 0, 6),
                LayoutOrder = 3,
        }, root)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, track)
        local fill = create("Frame", {
                Name = "Fill",
                BackgroundColor3 = Theme.Colors.primary,
                Size = UDim2.fromScale(0.34, 1),
        }, track)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, fill)

        create("TextLabel", {
                Name = "Progress",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "1 / 3 COMPLETE",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.caption,
                Size = UDim2.new(1, 0, 0, 16),
                LayoutOrder = 4,
                TextXAlignment = Enum.TextXAlignment.Left,
        }, root)
`,
  controllerExtras: () => `\tfunction controller.setQuest(questTitle: string, questObjectives: { { text: string, done: boolean? } }, ratio: number?)
                title.Text = questTitle
                for _, child in objectives:GetChildren() do
                        if child:IsA("Frame") then
                                child:Destroy()
                        end
                end
                local completed = 0
                for index, objective in questObjectives do
                        local done = objective.done or false
                        if done then
                                completed += 1
                        end
                        makeObjective(objective.text, done, index).Parent = objectives
                end
                local r = ratio
                if r == nil then
                        r = if #questObjectives > 0 then completed / #questObjectives else 0
                end
                withTween(fill, { Size = UDim2.fromScale(math.clamp(r, 0, 1), 1) }, Theme.Motion.base)
                local progressLabel = root:FindFirstChild("Progress") :: TextLabel
                progressLabel.Text = tostring(completed) .. " / " .. tostring(#questObjectives) .. " COMPLETE"
        end
`,
  open: `\t\troot.Visible = true
\t\twithTween(root, { BackgroundTransparency = 0.08 }, Theme.Motion.base)`,
  close: `\t\troot.Visible = false`,
};

/* ─────────────────────────────── profile-card ───────────────────────────── */

const profileCard: KindTemplate = {
  kindLabel: "Player profile card with stats and badges",
  usageNote: `-- Actions: "close", "view_profile". Update with ui:setIdentity / ui:setStats.`,
  buildBody: (o) => `\tlocal overlay = create("CanvasGroup", {
                Name = "Overlay",
                BackgroundColor3 = Theme.Colors.bg,
                BackgroundTransparency = 0.5,
                GroupTransparency = 1,
                Size = UDim2.fromScale(1, 1),
        }, screen)

        local root = create("Frame", {
                Name = "Card",
                BackgroundColor3 = Theme.Colors.surface,
                AnchorPoint = Vector2.new(0.5, 0.5),
                Position = UDim2.fromScale(0.5, 0.5),
                Size = UDim2.new(0.88, 0, 0, 0),
                AutomaticSize = Enum.AutomaticSize.Y,
        }, overlay)
        create("UIScale", { Scale = 0.97 }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.xl) }, root)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.15 }, root)
        create("UISizeConstraint", { MaxSize = Vector2.new(420, 640), MinSize = Vector2.new(300, 400) }, root)
        create("UIPadding", {
                PaddingLeft = UDim.new(0, Theme.Space.xl),
                PaddingRight = UDim.new(0, Theme.Space.xl),
                PaddingTop = UDim.new(0, Theme.Space.xl),
                PaddingBottom = UDim.new(0, Theme.Space.xl),
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.md),
                HorizontalAlignment = Enum.HorizontalAlignment.Center,
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, root)

        local avatar = create("Frame", {
                Name = "Avatar",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                Size = UDim2.fromOffset(112, 112),
                LayoutOrder = 1,
        }, root)
        create("UICorner", { CornerRadius = UDim.new(1, 0) }, avatar)
        create("UIStroke", { Color = Theme.Colors.primary, Thickness = 2, Transparency = 0.1 }, avatar)
        create("TextLabel", {
                Name = "Hint",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.Gotham),
                Text = "AVATAR",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.caption,
                Size = UDim2.fromScale(1, 1),
        }, avatar)

        local name = create("TextLabel", {
                Name = "DisplayName",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "${luauStr(o.playerName)}",
                TextColor3 = Theme.Colors.text,
                TextSize = Theme.Text.headline,
                Size = UDim2.new(1, 0, 0, 36),
                LayoutOrder = 2,
        }, root)

        local handle = create("TextLabel", {
                Name = "Handle",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.Gotham),
                Text = "@${luauStr(o.playerName.toLowerCase())}",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.body,
                Size = UDim2.new(1, 0, 0, 18),
                LayoutOrder = 3,
        }, root)

        local levelChip = create("TextLabel", {
                Name = "Level",
                BackgroundColor3 = Theme.Colors.primary,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "LEVEL 12",
                TextColor3 = Theme.Colors.primaryText,
                TextSize = Theme.Text.caption,
                Size = UDim2.fromOffset(96, 26),
                LayoutOrder = 4,
        }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, levelChip)

        local statGrid = create("Frame", {
                Name = "Stats",
                BackgroundTransparency = 1,
                Size = UDim2.new(1, 0, 0, 96),
                LayoutOrder = 5,
        }, root)
        create("UIGridLayout", {
                CellSize = UDim2.new(0.5, -Theme.Space.sm, 0, 44),
                CellPadding = UDim2.fromOffset(Theme.Space.sm, Theme.Space.sm),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, statGrid)

        local statDefs = {
                { "WINS", "132" },
                { "KOINS", "8,450" },
                { "KOs", "1,204" },
                { "PLAYTIME", "62h" },
        }
        local statValueLabels: { TextLabel } = {}
        for index, def in statDefs do
                local cell = create("Frame", {
                        Name = def[1],
                        BackgroundColor3 = Theme.Colors.surfaceAlt,
                        LayoutOrder = index,
                }, statGrid)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, cell)
                local valueLabel = create("TextLabel", {
                        Name = "Value",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = def[2],
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.stat,
                        Position = UDim2.fromOffset(0, Theme.Space.xs),
                        Size = UDim2.new(1, 0, 0, 26),
                }, cell)
                create("TextLabel", {
                        Name = "Label",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.Gotham),
                        Text = def[1],
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.caption,
                        Position = UDim2.new(0, 0, 0, 30),
                        Size = UDim2.new(1, 0, 0, 14),
                }, cell)
                table.insert(statValueLabels, valueLabel)
        end

        local badges = create("Frame", {
                Name = "Badges",
                BackgroundTransparency = 1,
                Size = UDim2.new(1, 0, 0, 40),
                LayoutOrder = 6,
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Horizontal,
                Padding = UDim.new(0, Theme.Space.sm),
                HorizontalAlignment = Enum.HorizontalAlignment.Center,
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, badges)
        local badgeColors = { Theme.Colors.warning, Theme.Colors.secondary, Theme.Colors.accent }
        for index = 1, 3 do
                local badge = create("Frame", {
                        Name = "Badge" .. tostring(index),
                        BackgroundColor3 = badgeColors[index],
                        Size = UDim2.fromOffset(36, 36),
                        LayoutOrder = index,
                }, badges)
                create("UICorner", { CornerRadius = UDim.new(1, 0) }, badge)
                create("UIStroke", { Color = Theme.Colors.surface, Thickness = 2 }, badge)
                create("TextLabel", {
                        Name = "Glyph",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = tostring(index),
                        TextColor3 = Theme.Colors.bg,
                        TextSize = Theme.Text.body,
                        Size = UDim2.fromScale(1, 1),
                }, badge)
        end

        local view = create("TextButton", {
                Name = "ViewProfile",
                BackgroundColor3 = Theme.Colors.primary,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "VIEW FULL PROFILE",
                TextColor3 = Theme.Colors.primaryText,
                TextSize = Theme.Text.body,
                Size = UDim2.new(1, 0, 0, 44),
                LayoutOrder = 7,
        }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, view)
        hookButton(view, "view_profile", fire)

        local close = create("TextButton", {
                Name = "Close",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "X",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.body,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, 0, 0, 0),
                Size = UDim2.fromOffset(32, 32),
                ZIndex = 2,
        }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, close)
        hookButton(close, "close", fire)
`,
  controllerExtras: () => `\tfunction controller.setIdentity(displayName: string, userHandle: string, level: number)
                name.Text = displayName
                handle.Text = "@" .. userHandle
                levelChip.Text = "LEVEL " .. tostring(level)
        end

        function controller.setStats(values: { string })
                for index, value in values do
                        local label = statValueLabels[index]
                        if label ~= nil then
                                label.Text = value
                        end
                end
        end
`,
  open: `\t\toverlay.GroupTransparency = 1
\t\twithTween(overlay, { GroupTransparency = 0 }, Theme.Motion.base)
\t\twithTween(root:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base, Enum.EasingStyle.Back)`,
  close: `\t\twithTween(overlay, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

export function templateForB(kind: string): KindTemplate | undefined {
  switch (kind) {
    case "hud": return hud;
    case "loading-screen": return loadingScreen;
    case "leaderboard": return leaderboard;
    case "notifications": return notifications;
    case "dialogue": return dialogue;
    case "quest-tracker": return questTracker;
    case "profile-card": return profileCard;
    default: return undefined;
  }
}
