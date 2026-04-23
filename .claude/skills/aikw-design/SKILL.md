---
name: aikw-design
description: AIKW / Studio Orbit design system for static HTML/CSS pages. Use when creating new pages, redesigning existing pages, or modifying any section layout, typography, color, or component on the AIKW corporate site. Trigger whenever the user mentions design consistency, "matches other pages", page layout, section styling, card vs row patterns, CTA sections, timeline, or visual alignment across the site. Also trigger when a design handoff bundle is referenced.
---

# AIKW Design System (Studio Orbit)

This skill encodes the design patterns for AIナレッジワークス合同会社's corporate site. The site is static HTML/CSS/JS — no build step, no framework.

## Before you start

Read `references/patterns.md` for the full token and component reference. Below is the workflow and decision logic.

## Core Principles

The design language is **quiet, typographic, and warm**. Every decision follows three rules:

1. **Hairline rules over card borders** — Separate items with `border-bottom: 1px solid var(--rule)`, not wrapper cards. Cards (paper bg + full border) are only for self-contained content blocks like member profiles or info tables.
2. **Typography carries hierarchy** — Use font size, family (serif vs sans), weight, and color opacity to distinguish levels. Not background color or decorative elements.
3. **Generous whitespace** — Sections breathe with `clamp(96px, 14vh, 160px)` vertical padding. Items get `32-48px` gap. Don't crowd.

## Page Structure Template

Every page follows this skeleton:

```
header (fixed, scrolled state)
hero (centered, serif heading + tagline)
<hr>
section.section (grid-sidebar: 200px kicker | 1fr content)
<hr>
section.section (optional paper-2 background for alternation)
<hr>
section.cta-section (dark ink background)
footer (4-column grid)
```

Alternate section backgrounds between `var(--bg)` (default) and `var(--paper-2)` to create visual rhythm. Use `<hr>` between sections.

## Section Layout Decision Tree

When adding content to a section, choose the pattern:

**Numbered list of items** (services, chapters, timeline entries):
→ Hairline-rule rows. Grid: `60px number | 1fr content`. Number styled as kicker (11px, 0.22em spacing, ink-60, tabular-nums). Format numbers as `01`, `02`, etc.

**Key-value data** (company info, specs):
→ Table with alternating `paper-2` row backgrounds.

**Cards grid** (team members, features, strengths):
→ `background: var(--paper); border: 1px solid var(--rule); padding: clamp(24px, 3vw, 40px)`. Grid: `repeat(2, 1fr)` or `repeat(auto-fill, minmax(280px, 1fr))`.

**Long-form narrative** (story, about text):
→ Two-column prose within grid-sidebar. `font-size: 16px; line-height: 2; color: var(--ink-60); max-width: 64ch`.

**CTA / call to action**:
→ Dark section: `background: var(--ink)`. All text inverted. Button: `background: var(--bg); color: var(--ink)`.

## Implementation Checklist

When creating or redesigning a page:

1. Verify tokens in `:root` match `references/patterns.md`
2. Header/footer markup matches other pages exactly (copy from existing)
3. Sections use `.grid-sidebar` with `.sidebar-sticky` + `.kicker`
4. Scroll reveal: elements have `class="reveal"`, JS adds `.in` (NOT `.active`)
5. Headings use `.section-heading` + size modifier (`-sm`, `-md`, `-lg`)
6. `<em>` inside headings uses `font-family: var(--display)` (Fraunces italic)
7. All interactive elements (links, buttons) have hover transitions
8. Responsive breakpoints: 1024px (single column), 768px (hamburger), 480px (smaller type)

## Common Mistakes to Avoid

- Wrapping list items in cards when they should be hairline-rule rows
- Using `background: var(--paper-2)` on individual items instead of entire sections
- Forgetting `font-variant-numeric: tabular-nums` on numbers and dates
- Using `.active` instead of `.in` for scroll reveal
- Making CTA sections light when they should be dark (`var(--ink)` background)
- Skipping `<hr>` between sections
