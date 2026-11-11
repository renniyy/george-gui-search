/**
 * GEORGE GUI @Search — interface kind templates (part 1):
 * main-menu, shop, inventory, settings.
 */

import { KindTemplate, KindOptions, luauStr, itemsLuau } from "./kinds-common.js";
/* ──────────────────────────────── main-menu ─────────────────────────────── */

const mainMenu: KindTemplate = {
  kindLabel: "Main menu / title screen",
  usageNote: `-- Actions fired: "play", "shop", "loadout", "settings" (override via ui:on).`,
  buildBody: (o) => `\t-- Fullscreen backdrop
        local root = create("CanvasGroup", {
                Name = "Overlay",
                BackgroundColor3 = Theme.Colors.bg,
                BackgroundTransparency = 0.2,
                GroupTransparency = 1,
                Size = UDim2.fromScale(1, 1),
        }, screen)

        local vignette = create("Frame", {
                Name = "Vignette",
                BackgroundColor3 = Theme.Colors.bg,
                BackgroundTransparency = 0,
                Size = UDim2.fromScale(1, 1),
                ZIndex = 0,
        }, root)
        create("UIGradient", {
                Transparency = NumberSequence.new({
                        NumberSequenceKeypoint.new(0, 0.45),
                        NumberSequenceKeypoint.new(0.5, 1),
                        NumberSequenceKeypoint.new(1, 0.45),
                }),
                Rotation = 90,
        }, vignette)

        local content = create("Frame", {
                Name = "Menu",
                BackgroundTransparency = 1,
                AnchorPoint = Vector2.new(0.5, 0.5),
                Position = UDim2.fromScale(0.5, 0.5),
                Size = UDim2.new(0.9, 0, 0.9, 0),
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
                TextSize = Theme.Text.display,
                Size = UDim2.fromOffset(560, 68),
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

        local play = create("TextButton", {
                Name = "Play",
                BackgroundColor3 = Theme.Colors.primary,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "PLAY",
                TextColor3 = Theme.Colors.primaryText,
                TextSize = Theme.Text.subtitle,
                TextXAlignment = Enum.TextXAlignment.Center,
                Size = UDim2.fromOffset(280, 56),
                LayoutOrder = 4,
        }, content)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, play)
        hookButton(play, "play", fire)

        local secondary = create("Frame", {
                Name = "Secondary",
                BackgroundTransparency = 1,
                Size = UDim2.fromOffset(280, 44),
                LayoutOrder = 5,
        }, content)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Horizontal,
                Padding = UDim.new(0, Theme.Space.sm),
                HorizontalAlignment = Enum.HorizontalAlignment.Center,
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, secondary)

        local secondaryButtons: { { string } } = {
                { "SHOP", "shop" },
                { "LOADOUT", "loadout" },
                { "SETTINGS", "settings" },
        }
        for index, entry in secondaryButtons do
                local button = create("TextButton", {
                        Name = entry[2],
                        BackgroundColor3 = Theme.Colors.surface,
                        FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                        Text = entry[1],
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.body,
                        Size = UDim2.new(0, 88, 1, 0),
                        LayoutOrder = index,
                }, secondary)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, button)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.35 }, button)
                hookButton(button, entry[2], fire)
        end

        local footer = create("TextLabel", {
                Name = "Version",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.Gotham),
                Text = "${luauStr(o.version)}",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.caption,
                AnchorPoint = Vector2.new(0.5, 1),
                Position = UDim2.new(0.5, 0, 1, -Theme.Space.lg),
                Size = UDim2.fromOffset(200, 18),
        }, root)
`,
  controllerExtras: () => `\tfunction controller.setTitle(newTitle: string)
                title.Text = newTitle
        end

        function controller.setSubtitle(newSubtitle: string)
                subtitle.Text = newSubtitle
        end
`,
  open: `\t\troot.GroupTransparency = 1
\t\twithTween(root, { GroupTransparency = 0 }, Theme.Motion.base)
\t\twithTween(content:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base, Enum.EasingStyle.Back)`,
  close: `\t\twithTween(root, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

/* ────────────────────────────────── shop ────────────────────────────────── */

const shop: KindTemplate = {
  kindLabel: "Shop / store with tabs and item grid",
  usageNote: `-- Actions: "close", "tab" (payload: tab name), "buy" (payload: item table).
-- Feed live data with ui:setItems({ { name = "...", price = "..." } }).`,
  buildBody: (o) => `\tlocal overlay = create("CanvasGroup", {
                Name = "Overlay",
                BackgroundColor3 = Theme.Colors.bg,
                BackgroundTransparency = 0.45,
                GroupTransparency = 1,
                Size = UDim2.fromScale(1, 1),
        }, screen)

        local root = create("Frame", {
                Name = "ShopPanel",
                BackgroundColor3 = Theme.Colors.surface,
                AnchorPoint = Vector2.new(0.5, 0.5),
                Position = UDim2.fromScale(0.5, 0.5),
                Size = UDim2.new(0.92, 0, 0, 460),
        }, overlay)
        create("UIScale", { Scale = 0.97 }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.lg) }, root)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.15 }, root)
        create("UISizeConstraint", { MinSize = Vector2.new(320, 420), MaxSize = Vector2.new(640, 560) }, root)

        local title = create("TextLabel", {
                Name = "Title",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "${luauStr(o.title)}",
                TextColor3 = Theme.Colors.text,
                TextSize = Theme.Text.title,
                Position = UDim2.fromOffset(Theme.Space.xl, Theme.Space.lg),
                Size = UDim2.fromOffset(220, 30),
                TextXAlignment = Enum.TextXAlignment.Left,
        }, root)

        local wallet = create("Frame", {
                Name = "Wallet",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, -Theme.Space.xl - 48, 0, Theme.Space.lg + 2),
                Size = UDim2.fromOffset(128, 36),
        }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, wallet)
        create("UIPadding", {
                PaddingLeft = UDim.new(0, Theme.Space.md),
                PaddingRight = UDim.new(0, Theme.Space.md),
        }, wallet)
        local walletLabel = create("TextLabel", {
                Name = "Amount",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "${luauStr(`${o.stats[0].label}  ${o.stats[0].value}`)}"
                TextColor3 = Theme.Colors.text
                TextSize = Theme.Text.body
                Size = UDim2.fromScale(1, 1)
        }, wallet)

        local close = create("TextButton", {
                Name = "Close",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "X",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.body,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, -Theme.Space.xl, 0, Theme.Space.lg),
                Size = UDim2.fromOffset(36, 36),
        }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, close)
        hookButton(close, "close", fire)

        -- Tabs
        local tabsRow = create("Frame", {
                Name = "Tabs",
                BackgroundTransparency = 1,
                Position = UDim2.fromOffset(Theme.Space.xl, Theme.Space.lg + 48),
                Size = UDim2.new(1, -Theme.Space.xl * 2, 0, 36),
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Horizontal,
                Padding = UDim.new(0, Theme.Space.sm),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, tabsRow)

        local tabButtons: { [string]: TextButton } = {}
        local function styleTab(button: TextButton, active: boolean)
                button.BackgroundColor3 = if active then Theme.Colors.surfaceAlt else Theme.Colors.surface
                button.TextColor3 = if active then Theme.Colors.text else Theme.Colors.textMuted
                local stroke = button:FindFirstChildOfClass("UIStroke") :: UIStroke
                stroke.Transparency = if active then 0 else 0.45
        end
        local function selectTab(name: string)
                for tabName, button in tabButtons do
                        styleTab(button, tabName == name)
                end
        end
        local tabNames = { ${o.tabs.map((t) => `"${luauStr(t)}"`).join(", ")} }
        for index, tabName in tabNames do
                local tab = create("TextButton", {
                        Name = tabName,
                        BackgroundColor3 = Theme.Colors.surface,
                        FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                        Text = tabName,
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.body,
                        Size = UDim2.new(0, 96, 1, 0),
                        LayoutOrder = index,
                }, tabsRow)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, tab)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.45 }, tab)
                hookButton(tab, "tab", fire, tabName)
                tab.Activated:Connect(function()
                        selectTab(tabName)
                end)
                tabButtons[tabName] = tab
        end
        selectTab(tabNames[1])

        -- Item grid
        local scroll = create("ScrollingFrame", {
                Name = "Items",
                BackgroundTransparency = 1,
                BorderSizePixel = 0,
                Position = UDim2.fromOffset(Theme.Space.xl, 124),
                Size = UDim2.new(1, -Theme.Space.xl * 2, 1, -124 - Theme.Space.xl),
                CanvasSize = UDim2.new(),
                AutomaticCanvasSize = Enum.AutomaticSize.Y,
                ScrollBarThickness = 4,
                ScrollBarImageColor3 = Theme.Colors.stroke,
                ScrollBarImageTransparency = 0.2,
                ElasticBehavior = Enum.ElasticBehavior.WhenScrollable,
        }, root)
        create("UIPadding", {
                PaddingRight = UDim.new(0, Theme.Space.md),
                PaddingBottom = UDim.new(0, Theme.Space.md),
        }, scroll)
        create("UIGridLayout", {
                CellSize = UDim2.new(0.485, -6, 0, 192),
                CellPadding = UDim2.fromOffset(12, 12),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, scroll)

        type ItemData = { name: string, subtitle: string, price: string, badge: string }

        local function makeItemCard(item: ItemData): Frame
                local card = create("Frame", {
                        Name = item.name,
                        BackgroundColor3 = Theme.Colors.surfaceAlt,
                        Size = UDim2.fromScale(1, 1),
                }, nil)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, card)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.3 }, card)

                local icon = create("Frame", {
                        Name = "Icon",
                        BackgroundColor3 = Theme.Colors.surface,
                        Position = UDim2.fromOffset(Theme.Space.md, Theme.Space.md),
                        Size = UDim2.new(1, -Theme.Space.md * 2, 0, 88),
                }, card)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, icon)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.4 }, icon)
                create("TextLabel", {
                        Name = "Hint",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.Gotham),
                        Text = "DROP ICON HERE",
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.caption,
                        Size = UDim2.fromScale(1, 1),
                }, icon)

                if item.badge ~= "" then
                        local badge = create("TextLabel", {
                                Name = "Badge",
                                BackgroundColor3 = Theme.Colors.accent,
                                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                                Text = item.badge,
                                TextColor3 = Theme.Colors.bg,
                                TextSize = Theme.Text.caption,
                                Position = UDim2.fromOffset(Theme.Space.md + 4, Theme.Space.md + 4),
                                Size = UDim2.fromOffset(48, 18),
                        }, card)
                        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, badge)
                end

                create("TextLabel", {
                        Name = "ItemName",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = item.name,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        Position = UDim2.fromOffset(Theme.Space.md, 108),
                        Size = UDim2.new(1, -Theme.Space.md * 2, 0, 18),
                        TextXAlignment = Enum.TextXAlignment.Left,
                        TextTruncate = Enum.TextTruncate.AtEnd,
                }, card)

                create("TextLabel", {
                        Name = "ItemKind",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.Gotham),
                        Text = item.subtitle,
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.caption,
                        Position = UDim2.fromOffset(Theme.Space.md, 128),
                        Size = UDim2.new(1, -Theme.Space.md * 2, 0, 14),
                        TextXAlignment = Enum.TextXAlignment.Left,
                        TextTruncate = Enum.TextTruncate.AtEnd,
                }, card)

                create("TextLabel", {
                        Name = "Price",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = item.price,
                        TextColor3 = Theme.Colors.primary,
                        TextSize = Theme.Text.body,
                        AnchorPoint = Vector2.new(0, 1),
                        Position = UDim2.new(0, Theme.Space.md, 1, -Theme.Space.md),
                        Size = UDim2.fromOffset(90, 22),
                        TextXAlignment = Enum.TextXAlignment.Left,
                }, card)

                local buy = create("TextButton", {
                        Name = "Buy",
                        BackgroundColor3 = Theme.Colors.primary,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = "BUY",
                        TextColor3 = Theme.Colors.primaryText,
                        TextSize = Theme.Text.caption,
                        AnchorPoint = Vector2.new(1, 1),
                        Position = UDim2.new(1, -Theme.Space.md, 1, -Theme.Space.md),
                        Size = UDim2.fromOffset(80, 36),
                }, card)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, buy)
                hookButton(buy, "buy", fire, item)

                return card
        end

        local defaultItems: { ItemData } = ${itemsLuau(o.items)}
`,
  controllerExtras: () => `\tfunction controller.setItems(items: { { name: string, subtitle: string?, price: string?, badge: string? } })
                for _, child in scroll:GetChildren() do
                        if child:IsA("Frame") then
                                child:Destroy()
                        end
                end
                for _, item in items do
                        local data: ItemData = {
                                name = item.name,
                                subtitle = item.subtitle or "",
                                price = item.price or "",
                                badge = item.badge or "",
                        }
                        makeItemCard(data).Parent = scroll
                end
        end
        controller.setItems(defaultItems)

        function controller.setTab(name: string)
                selectTab(name)
        end

        function controller.setWallet(text: string)
                walletLabel.Text = text
        end
`,
  open: `\t\toverlay.GroupTransparency = 1
\t\twithTween(overlay, { GroupTransparency = 0 }, Theme.Motion.base)
\t\twithTween(root:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base, Enum.EasingStyle.Back)`,
  close: `\t\twithTween(overlay, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

/* ──────────────────────────────── inventory ─────────────────────────────── */

const inventory: KindTemplate = {
  kindLabel: "Inventory with item grid and equip flow",
  usageNote: `-- Actions: "close", "tab", "equip" (payload: item table), "sell".
-- Feed live data with ui:setItems(...).`,
  buildBody: (o) => `\tlocal overlay = create("CanvasGroup", {
                Name = "Overlay",
                BackgroundColor3 = Theme.Colors.bg,
                BackgroundTransparency = 0.45,
                GroupTransparency = 1,
                Size = UDim2.fromScale(1, 1),
        }, screen)

        local root = create("Frame", {
                Name = "InventoryPanel",
                BackgroundColor3 = Theme.Colors.surface,
                AnchorPoint = Vector2.new(0.5, 0.5),
                Position = UDim2.fromScale(0.5, 0.5),
                Size = UDim2.new(0.92, 0, 0, 460),
        }, overlay)
        create("UIScale", { Scale = 0.97 }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.lg) }, root)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.15 }, root)
        create("UISizeConstraint", { MinSize = Vector2.new(320, 420), MaxSize = Vector2.new(640, 560) }, root)

        local title = create("TextLabel", {
                Name = "Title",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "${luauStr(o.title)}",
                TextColor3 = Theme.Colors.text,
                TextSize = Theme.Text.title,
                Position = UDim2.fromOffset(Theme.Space.xl, Theme.Space.lg),
                Size = UDim2.fromOffset(220, 30),
                TextXAlignment = Enum.TextXAlignment.Left,
        }, root)

        local capacity = create("TextLabel", {
                Name = "Capacity",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                Text = "${luauStr(`${o.items.length} / 30 SLOTS`)}", TextColor3 = Theme.Colors.textMuted, TextSize = Theme.Text.body
                AnchorPoint = Vector2.new(1, 0)
                Position = UDim2.new(1, -Theme.Space.xl - 48, 0, Theme.Space.lg + 8)
                Size = UDim2.fromOffset(120, 24)
                TextXAlignment = Enum.TextXAlignment.Right
        }, root)

        local close = create("TextButton", {
                Name = "Close",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "X",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.body,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, -Theme.Space.xl, 0, Theme.Space.lg),
                Size = UDim2.fromOffset(36, 36),
        }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, close)
        hookButton(close, "close", fire)

        local tabsRow = create("Frame", {
                Name = "Tabs",
                BackgroundTransparency = 1,
                Position = UDim2.fromOffset(Theme.Space.xl, Theme.Space.lg + 48),
                Size = UDim2.new(1, -Theme.Space.xl * 2, 0, 36),
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Horizontal,
                Padding = UDim.new(0, Theme.Space.sm),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, tabsRow)

        local tabButtons: { [string]: TextButton } = {}
        local function styleTab(button: TextButton, active: boolean)
                button.BackgroundColor3 = if active then Theme.Colors.surfaceAlt else Theme.Colors.surface
                button.TextColor3 = if active then Theme.Colors.text else Theme.Colors.textMuted
                local stroke = button:FindFirstChildOfClass("UIStroke") :: UIStroke
                stroke.Transparency = if active then 0 else 0.45
        end
        local function selectTab(name: string)
                for tabName, button in tabButtons do
                        styleTab(button, tabName == name)
                end
        end
        local tabNames = { ${o.tabs.map((t) => `"${luauStr(t)}"`).join(", ")} }
        for index, tabName in tabNames do
                local tab = create("TextButton", {
                        Name = tabName,
                        BackgroundColor3 = Theme.Colors.surface,
                        FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                        Text = tabName,
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.body,
                        Size = UDim2.new(0, 96, 1, 0),
                        LayoutOrder = index,
                }, tabsRow)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, tab)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.45 }, tab)
                hookButton(tab, "tab", fire, tabName)
                tab.Activated:Connect(function()
                        selectTab(tabName)
                end)
                tabButtons[tabName] = tab
        end
        selectTab(tabNames[1])

        local scroll = create("ScrollingFrame", {
                Name = "Items",
                BackgroundTransparency = 1,
                BorderSizePixel = 0,
                Position = UDim2.fromOffset(Theme.Space.xl, 124),
                Size = UDim2.new(1, -Theme.Space.xl * 2, 1, -124 - Theme.Space.xl),
                CanvasSize = UDim2.new(),
                AutomaticCanvasSize = Enum.AutomaticSize.Y,
                ScrollBarThickness = 4,
                ScrollBarImageColor3 = Theme.Colors.stroke,
                ScrollBarImageTransparency = 0.2,
        }, root)
        create("UIPadding", {
                PaddingRight = UDim.new(0, Theme.Space.md),
                PaddingBottom = UDim.new(0, Theme.Space.md),
        }, scroll)
        create("UIGridLayout", {
                CellSize = UDim2.new(0.485, -6, 0, 192),
                CellPadding = UDim2.fromOffset(12, 12),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, scroll)

        type ItemData = { name: string, subtitle: string, price: string, badge: string }

        local function makeItemCard(item: ItemData): Frame
                local card = create("Frame", {
                        Name = item.name,
                        BackgroundColor3 = Theme.Colors.surfaceAlt,
                        Size = UDim2.fromScale(1, 1),
                }, nil)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, card)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.3 }, card)

                local icon = create("Frame", {
                        Name = "Icon",
                        BackgroundColor3 = Theme.Colors.surface,
                        Position = UDim2.fromOffset(Theme.Space.md, Theme.Space.md),
                        Size = UDim2.new(1, -Theme.Space.md * 2, 0, 88),
                }, card)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, icon)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.4 }, icon)
                create("TextLabel", {
                        Name = "Hint",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.Gotham),
                        Text = "DROP ICON HERE",
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.caption,
                        Size = UDim2.fromScale(1, 1),
                }, icon)

                if item.badge ~= "" then
                        local rarity = create("TextLabel", {
                                Name = "Rarity",
                                BackgroundColor3 = Theme.Colors.secondary,
                                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                                Text = item.badge,
                                TextColor3 = Theme.Colors.text,
                                TextSize = Theme.Text.caption,
                                AnchorPoint = Vector2.new(1, 0),
                                Position = UDim2.new(1, -Theme.Space.md - 4, 0, Theme.Space.md + 4),
                                Size = UDim2.fromOffset(64, 18),
                        }, card)
                        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, rarity)
                end

                create("TextLabel", {
                        Name = "ItemName",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = item.name,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        Position = UDim2.fromOffset(Theme.Space.md, 108),
                        Size = UDim2.new(1, -Theme.Space.md * 2, 0, 18),
                        TextXAlignment = Enum.TextXAlignment.Left,
                        TextTruncate = Enum.TextTruncate.AtEnd,
                }, card)

                create("TextLabel", {
                        Name = "ItemKind",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.Gotham),
                        Text = item.subtitle,
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.caption,
                        Position = UDim2.fromOffset(Theme.Space.md, 128),
                        Size = UDim2.new(1, -Theme.Space.md * 2, 0, 14),
                        TextXAlignment = Enum.TextXAlignment.Left,
                        TextTruncate = Enum.TextTruncate.AtEnd,
                }, card)

                local equip = create("TextButton", {
                        Name = "Equip",
                        BackgroundColor3 = Theme.Colors.surface,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = "EQUIP",
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.caption,
                        AnchorPoint = Vector2.new(1, 1),
                        Position = UDim2.new(1, -Theme.Space.md, 1, -Theme.Space.md),
                        Size = UDim2.fromOffset(84, 36),
                }, card)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, equip)
                create("UIStroke", { Color = Theme.Colors.primary, Thickness = 1, Transparency = 0.2 }, equip)
                hookButton(equip, "equip", fire, item)

                return card
        end

        local defaultItems: { ItemData } = ${itemsLuau(o.items)}
`,
  controllerExtras: () => `\tfunction controller.setItems(items: { { name: string, subtitle: string?, price: string?, badge: string? } })
                for _, child in scroll:GetChildren() do
                        if child:IsA("Frame") then
                                child:Destroy()
                        end
                end
                for _, item in items do
                        local data: ItemData = {
                                name = item.name,
                                subtitle = item.subtitle or "",
                                price = item.price or "",
                                badge = item.badge or "",
                        }
                        makeItemCard(data).Parent = scroll
                end
        end
        controller.setItems(defaultItems)

        function controller.setTab(name: string)
                selectTab(name)
        end

        function controller.setCapacity(text: string)
                capacity.Text = text
        end
`,
  open: `\t\toverlay.GroupTransparency = 1
\t\twithTween(overlay, { GroupTransparency = 0 }, Theme.Motion.base)
\t\twithTween(root:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base, Enum.EasingStyle.Back)`,
  close: `\t\twithTween(overlay, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

/* ──────────────────────────────── settings ──────────────────────────────── */

const settings: KindTemplate = {
  kindLabel: "Settings with toggles, sliders and keybinds",
  usageNote: `-- Actions: "close", "reset", "apply", "setting_changed" (payload: { id, value }),
-- "rebind" (payload: { id, key }). Read current values via ui.values.<id>.`,
  buildBody: () => `\tlocal overlay = create("CanvasGroup", {
                Name = "Overlay",
                BackgroundColor3 = Theme.Colors.bg,
                BackgroundTransparency = 0.45,
                GroupTransparency = 1,
                Size = UDim2.fromScale(1, 1),
        }, screen)

        local root = create("Frame", {
                Name = "SettingsPanel",
                BackgroundColor3 = Theme.Colors.surface,
                AnchorPoint = Vector2.new(0.5, 0.5),
                Position = UDim2.fromScale(0.5, 0.5),
                Size = UDim2.new(0.92, 0, 0, 480),
        }, overlay)
        create("UIScale", { Scale = 0.97 }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.lg) }, root)
        create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.15 }, root)
        create("UISizeConstraint", { MinSize = Vector2.new(320, 440), MaxSize = Vector2.new(560, 600) }, root)

        local title = create("TextLabel", {
                Name = "Title",
                BackgroundTransparency = 1,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "Settings",
                TextColor3 = Theme.Colors.text,
                TextSize = Theme.Text.title,
                Position = UDim2.fromOffset(Theme.Space.xl, Theme.Space.lg),
                Size = UDim2.fromOffset(220, 30),
                TextXAlignment = Enum.TextXAlignment.Left,
        }, root)

        local close = create("TextButton", {
                Name = "Close",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "X",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.body,
                AnchorPoint = Vector2.new(1, 0),
                Position = UDim2.new(1, -Theme.Space.xl, 0, Theme.Space.lg),
                Size = UDim2.fromOffset(36, 36),
        }, root)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, close)
        hookButton(close, "close", fire)

        local scroll = create("ScrollingFrame", {
                Name = "Settings",
                BackgroundTransparency = 1,
                BorderSizePixel = 0,
                Position = UDim2.fromOffset(Theme.Space.xl, Theme.Space.lg + 44),
                Size = UDim2.new(1, -Theme.Space.xl * 2, 1, -Theme.Space.lg * 2 - 44 - 56),
                CanvasSize = UDim2.new(),
                AutomaticCanvasSize = Enum.AutomaticSize.Y,
                ScrollBarThickness = 4,
                ScrollBarImageColor3 = Theme.Colors.stroke,
                ScrollBarImageTransparency = 0.2,
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Vertical,
                Padding = UDim.new(0, Theme.Space.xs),
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, scroll)
        create("UIPadding", { PaddingRight = UDim.new(0, Theme.Space.md), PaddingBottom = UDim.new(0, Theme.Space.lg) }, scroll)

        local values: { [string]: any } = {}
        local listeningKeybind: TextButton? = nil

        local function sectionLabel(text: string, order: number)
                local label = create("TextLabel", {
                        Name = text,
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = string.upper(text),
                        TextColor3 = Theme.Colors.textMuted,
                        TextSize = Theme.Text.caption,
                        Size = UDim2.new(1, 0, 0, 40),
                        LayoutOrder = order,
                        TextXAlignment = Enum.TextXAlignment.Left,
                }, scroll)
                return label
        end

        local function makeToggle(id: string, label: string, defaultValue: boolean, order: number)
                local row = create("Frame", {
                        Name = id,
                        BackgroundColor3 = Theme.Colors.surfaceAlt,
                        Size = UDim2.new(1, 0, 0, 56),
                        LayoutOrder = order,
                }, scroll)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, row)
                create("UIPadding", {
                        PaddingLeft = UDim.new(0, Theme.Space.lg),
                        PaddingRight = UDim.new(0, Theme.Space.lg),
                }, row)

                create("TextLabel", {
                        Name = "Label",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                        Text = label,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        Size = UDim2.new(1, -96, 1, 0),
                        TextXAlignment = Enum.TextXAlignment.Left,
                }, row)

                local track = create("TextButton", {
                        Name = "Switch",
                        BackgroundColor3 = Theme.Colors.stroke,
                        Text = "",
                        AutoButtonColor = false,
                        AnchorPoint = Vector2.new(1, 0.5),
                        Position = UDim2.new(1, 0, 0.5, 0),
                        Size = UDim2.fromOffset(64, 36),
                }, row)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.pill) }, track)
                local knob = create("Frame", {
                        Name = "Knob",
                        BackgroundColor3 = Theme.Colors.text,
                        Position = UDim2.fromOffset(4, 4),
                        Size = UDim2.fromOffset(28, 28),
                        ZIndex = 2,
                }, track)
                create("UICorner", { CornerRadius = UDim.new(1, 0) }, knob)

                values[id] = defaultValue
                local function render(value: boolean)
                        track.BackgroundColor3 = if value then Theme.Colors.primary else Theme.Colors.stroke
                        withTween(knob, { Position = if value then UDim2.fromOffset(32, 4) else UDim2.fromOffset(4, 4) }, Theme.Motion.fast)
                end
                render(defaultValue)

                track.Activated:Connect(function()
                        values[id] = not values[id]
                        render(values[id])
                        fire("setting_changed", { id = id, value = values[id] })
                end)
        end

        local function makeSlider(
                id: string,
                label: string,
                minValue: number,
                maxValue: number,
                step: number,
                defaultValue: number,
                order: number
        )
                local row = create("Frame", {
                        Name = id,
                        BackgroundColor3 = Theme.Colors.surfaceAlt,
                        Size = UDim2.new(1, 0, 0, 72),
                        LayoutOrder = order,
                }, scroll)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, row)
                create("UIPadding", {
                        PaddingLeft = UDim.new(0, Theme.Space.lg),
                        PaddingRight = UDim.new(0, Theme.Space.lg),
                        PaddingTop = UDim.new(0, Theme.Space.md),
                        PaddingBottom = UDim.new(0, Theme.Space.md),
                }, row)

                create("TextLabel", {
                        Name = "Label",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                        Text = label,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        Size = UDim2.new(1, -80, 0, 18),
                        TextXAlignment = Enum.TextXAlignment.Left,
                }, row)

                local valueLabel = create("TextLabel", {
                        Name = "Value",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = tostring(defaultValue),
                        TextColor3 = Theme.Colors.primary,
                        TextSize = Theme.Text.body,
                        AnchorPoint = Vector2.new(1, 0),
                        Position = UDim2.new(1, 0, 0, 0),
                        Size = UDim2.fromOffset(72, 18),
                        TextXAlignment = Enum.TextXAlignment.Right,
                }, row)

                local track = create("Frame", {
                        Name = "Track",
                        BackgroundColor3 = Theme.Colors.stroke,
                        AnchorPoint = Vector2.new(0, 1),
                        Position = UDim2.new(0, 0, 1, -14),
                        Size = UDim2.new(1, 0, 0, 4),
                }, row)
                create("UICorner", { CornerRadius = UDim.new(1, 0) }, track)

                local fill = create("Frame", {
                        Name = "Fill",
                        BackgroundColor3 = Theme.Colors.primary,
                        Size = UDim2.fromScale((defaultValue - minValue) / (maxValue - minValue), 1),
                }, track)
                create("UICorner", { CornerRadius = UDim.new(1, 0) }, fill)

                local knob = create("TextButton", {
                        Name = "Knob",
                        BackgroundColor3 = Theme.Colors.primary,
                        Text = "",
                        AutoButtonColor = false,
                        AnchorPoint = Vector2.new(0.5, 0.5),
                        Position = UDim2.new((defaultValue - minValue) / (maxValue - minValue), 0, 0.5, 0),
                        Size = UDim2.fromOffset(18, 18),
                        ZIndex = 2,
                }, track)
                create("UICorner", { CornerRadius = UDim.new(1, 0) }, knob)

                -- Generous invisible hit region so the track is easy to tap on touch devices
                local hit = create("TextButton", {
                        Name = "Hit",
                        BackgroundTransparency = 1,
                        Text = "",
                        AutoButtonColor = false,
                        AnchorPoint = Vector2.new(0, 1),
                        Position = UDim2.new(0, 0, 1, -12),
                        Size = UDim2.new(1, 0, 0, 28),
                        ZIndex = 3,
                }, track)

                values[id] = defaultValue
                local dragging = false
                local function setFromX(x: number)
                        local alpha = math.clamp((x - track.AbsolutePosition.X) / math.max(track.AbsoluteSize.X, 1), 0, 1)
                        local raw = minValue + (maxValue - minValue) * alpha
                        local snapped = math.floor(raw / step + 0.5) * step
                        local finalValue = math.clamp(snapped, minValue, maxValue)
                        values[id] = finalValue
                        local ratio = (finalValue - minValue) / (maxValue - minValue)
                        fill.Size = UDim2.fromScale(ratio, 1)
                        knob.Position = UDim2.new(ratio, 0, 0.5, 0)
                        valueLabel.Text = string.format("%d", math.floor(finalValue + 0.5))
                        fire("setting_changed", { id = id, value = finalValue })
                end

                knob.InputBegan:Connect(function(input)
                        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                                dragging = true
                        end
                end)
                UserInputService.InputEnded:Connect(function(input)
                        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                                dragging = false
                        end
                end)
                UserInputService.InputChanged:Connect(function(input)
                        if
                                dragging
                                and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch)
                        then
                                setFromX(input.Position.X)
                        end
                end)
                hit.InputBegan:Connect(function(input)
                        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                                setFromX(input.Position.X)
                        end
                end)
        end

        local function makeKeybind(id: string, label: string, defaultKey: string, order: number)
                local row = create("Frame", {
                        Name = id,
                        BackgroundColor3 = Theme.Colors.surfaceAlt,
                        Size = UDim2.new(1, 0, 0, 56),
                        LayoutOrder = order,
                }, scroll)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, row)
                create("UIPadding", {
                        PaddingLeft = UDim.new(0, Theme.Space.lg),
                        PaddingRight = UDim.new(0, Theme.Space.lg),
                }, row)

                create("TextLabel", {
                        Name = "Label",
                        BackgroundTransparency = 1,
                        FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                        Text = label,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        Size = UDim2.new(1, -120, 1, 0),
                        TextXAlignment = Enum.TextXAlignment.Left,
                }, row)

                local keyButton = create("TextButton", {
                        Name = "Key",
                        BackgroundColor3 = Theme.Colors.surface,
                        FontFace = Font.fromEnum(Enum.Font.GothamBold),
                        Text = defaultKey,
                        TextColor3 = Theme.Colors.text,
                        TextSize = Theme.Text.body,
                        AnchorPoint = Vector2.new(1, 0.5),
                        Position = UDim2.new(1, 0, 0.5, 0),
                        Size = UDim2.fromOffset(96, 36),
                }, row)
                create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.sm) }, keyButton)
                create("UIStroke", { Color = Theme.Colors.stroke, Thickness = 1, Transparency = 0.3 }, keyButton)
                values[id] = defaultKey

                keyButton.Activated:Connect(function()
                        if listeningKeybind ~= nil then
                                listeningKeybind.TextColor3 = Theme.Colors.text
                        end
                        listeningKeybind = keyButton,
                        keyButton.Text = "...",
                        keyButton.TextColor3 = Theme.Colors.primary
                end)

                UserInputService.InputBegan:Connect(function(input, processed)
                        if processed or listeningKeybind ~= keyButton then
                                return
                        end
                        if input.UserInputType == Enum.UserInputType.Keyboard then
                                local keyName = input.KeyCode.Name
                                keyButton.Text = keyName,
                                keyButton.TextColor3 = Theme.Colors.text,
                                values[id] = keyName,
                                listeningKeybind = nil
                                fire("rebind", { id = id, key = keyName })
                        end
                end)
        end

        local order = 0
        local function nextOrder(): number
                order += 1
                return order
        end

        sectionLabel("Gameplay", nextOrder())
        makeToggle("cameraShake", "Camera Shake", true, nextOrder())
        makeToggle("autoJump", "Auto Jump", false, nextOrder())
        makeToggle("reduceMotion", "Reduce Motion", false, nextOrder())
        sectionLabel("Audio", nextOrder())
        makeSlider("masterVolume", "Master Volume", 0, 100, 5, 75, nextOrder())
        makeSlider("musicVolume", "Music Volume", 0, 100, 5, 50, nextOrder())
        makeSlider("sfxVolume", "SFX Volume", 0, 100, 5, 80, nextOrder())
        sectionLabel("Graphics", nextOrder())
        makeSlider("fieldOfView", "Field of View", 60, 120, 5, 70, nextOrder())
        makeToggle("bloom", "Bloom Effects", true, nextOrder())
        sectionLabel("Controls", nextOrder())
        makeKeybind("sprint", "Sprint", "LeftShift", nextOrder())
        makeKeybind("inventory", "Open Inventory", "E", nextOrder())
        makeKeybind("map", "Open Map", "M", nextOrder())

        local footer = create("Frame", {
                Name = "Footer",
                BackgroundTransparency = 1,
                AnchorPoint = Vector2.new(0.5, 1),
                Position = UDim2.new(0.5, 0, 1, -Theme.Space.lg),
                Size = UDim2.new(1, -Theme.Space.xl * 2, 0, 40),
        }, root)
        create("UIListLayout", {
                FillDirection = Enum.FillDirection.Horizontal,
                Padding = UDim.new(0, Theme.Space.md),
                HorizontalAlignment = Enum.HorizontalAlignment.Right,
                SortOrder = Enum.SortOrder.LayoutOrder,
        }, footer)

        local reset = create("TextButton", {
                Name = "Reset",
                BackgroundColor3 = Theme.Colors.surfaceAlt,
                FontFace = Font.fromEnum(Enum.Font.GothamMedium),
                Text = "RESET",
                TextColor3 = Theme.Colors.textMuted,
                TextSize = Theme.Text.body,
                Size = UDim2.fromOffset(104, 40),
                LayoutOrder = 1,
        }, footer)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, reset)
        hookButton(reset, "reset", fire)

        local apply = create("TextButton", {
                Name = "Apply",
                BackgroundColor3 = Theme.Colors.primary,
                FontFace = Font.fromEnum(Enum.Font.GothamBold),
                Text = "APPLY",
                TextColor3 = Theme.Colors.primaryText,
                TextSize = Theme.Text.body,
                Size = UDim2.fromOffset(104, 40),
                LayoutOrder = 2,
        }, footer)
        create("UICorner", { CornerRadius = UDim.new(0, Theme.Radius.md) }, apply)
        hookButton(apply, "apply", fire)
`,
  controllerExtras: () => `\tcontroller.values = values

        function controller.setValue(id: string, value: any)
                values[id] = value
        end
`,
  open: `\t\toverlay.GroupTransparency = 1
\t\twithTween(overlay, { GroupTransparency = 0 }, Theme.Motion.base)
\t\twithTween(root:FindFirstChildOfClass("UIScale") :: UIScale, { Scale = 1 }, Theme.Motion.base, Enum.EasingStyle.Back)`,
  close: `\t\twithTween(overlay, { GroupTransparency = 1 }, Theme.Motion.base)`,
};

export function templateFor(kind: string): KindTemplate | undefined {
  switch (kind) {
    case "main-menu": return mainMenu;
    case "shop": return shop;
    case "inventory": return inventory;
    case "settings": return settings;
    default: return undefined;
  }
}

export type { KindOptions };
