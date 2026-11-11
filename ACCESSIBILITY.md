# Accessibility statement

Accessibility in GEORGE GUI @Search is a **measurable engineering requirement**, not a styling preference. It is enforced at three layers.

## 1. Generated Roblox interfaces

Every generated module is audited before it is returned, and the shipped palettes/kind combinations are locked at 100/100 by 144 test cases:

- **Contrast**: WCAG 2.x relative-luminance math on every text/background pair. Body-size text must reach 4.5:1 (the shipped palettes actually clear 4.6:1 on all pairs, including button labels on saturated fills).
- **Touch targets**: every interactive element ≥ 36 px; the audit fails anything below 30 px and warns between 30–35 px. Sliders ship with an additional invisible 28 px-tall hit region for touch accuracy.
- **Text sizes**: no text below 12 px; body text is 14 px.
- **Input modalities**: every button wires `Activated` (mouse, touch, and gamepad) plus `SelectionGained`/`SelectionLost` focus feedback, so gamepad and keyboard navigation works out of the box.
- **Motion**: durations stay between 0.15–0.4 s; a "Reduce Motion" toggle ships in the settings interface template as the pattern to follow.
- **Input safety**: keybind handlers honour `gameProcessedEvent`, so typing in chat or text boxes never triggers actions (and the review engine flags handlers that don't).

The audit is re-runnable on any generated spec via `george_audit_gui`, returning per-check pass/info/warn/fail results with measured ratios and pixel sizes.

## 2. The tool interface itself

- Tool descriptions, input names and error messages are written for clarity; errors always state which constraint failed and how to fix it.
- Structured output is provided alongside text so assistive/programmatic consumers can use the data directly.
- The local thumbnail renderer embeds text as crisp pixel typography (not low-contrast gradients).

## 3. This repository

- Documentation uses semantic headings, tables with header rows, and descriptive link text.
- The logo system includes monochrome light/dark variants for low-vision and print contexts (see [brand/BRAND_GUIDELINES.md](brand/BRAND_GUIDELINES.md)).
- CI treats accessibility regressions as test failures: a palette change that breaks a contrast pair cannot merge.

## Known gaps (honest list)

- Roblox has no system-level reduced-motion preference George can read; the reduce-motion pattern ships as an in-game setting template.
- The pixel renderer's decorative glows are not individually adjustable; they sit behind text areas at low opacity and never reduce text contrast below thresholds.
- axe-core is recommended (and documented) for companion *web* surfaces; in-Studio accessibility is covered by George's own math.
