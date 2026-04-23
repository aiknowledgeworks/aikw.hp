# AIKW Design Tokens & Component Patterns

## Tokens

```css
:root {
  /* Palette */
  --bg: #FAF8F5;
  --ink: #2C2A26;
  --ink-80: #2C2A26CC;
  --ink-60: #2C2A2699;
  --ink-40: #2C2A2666;
  --ink-15: #2C2A2626;
  --ink-08: #2C2A2614;
  --paper: #FFFFFF;
  --paper-2: #F3EFE9;
  --paper-3: #EBE6DD;
  --rule: #D9D3C7;
  --accent: #3da8c7;

  /* Type */
  --serif: "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif;
  --sans: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", system-ui, sans-serif;
  --display: "Fraunces", "Noto Serif JP", serif;

  /* Spacing */
  --page-pad: clamp(24px, 5vw, 72px);
  --measure: 64ch;
}
```

## Typography Scale

| Use | Family | Size | Weight | Spacing | Color |
|-----|--------|------|--------|---------|-------|
| Kicker | sans | 11px | 400 | 0.22em, uppercase | ink-60 |
| Body | sans | 15-16px | 400 | 0.02em | ink-60 |
| Nav link | sans | 12px | 400 | 0.18em, uppercase | ink-60 |
| Section heading sm | serif | clamp(28px, 3.5vw, 48px) | 400 | -0.01em | ink |
| Section heading md | serif | clamp(34px, 4.5vw, 64px) | 400 | -0.01em | ink |
| Section heading lg | serif | clamp(40px, 6vw, 88px) | 400 | -0.02em | ink |
| Hero h1 | serif | clamp(40px, 6vw, 80px) | 400 | -0.02em | ink |
| Row title | serif | clamp(20px, 2.5vw, 26px) | 400 | -0.01em | ink |
| Number label | sans | 11px | 400 | 0.22em, tabular-nums | ink-60 |
| Date label | sans | 11-12px | 400 | 0.22em, uppercase | ink-60 |
| Footer col title | sans | 11px | 400 | 0.22em, uppercase | ink-60 |
| Italic accent | display (Fraunces) | inherit | 400 | — | ink |

## Layout Patterns

### Section Base
```css
.section {
  padding: clamp(96px, 14vh, 160px) var(--page-pad);
  max-width: 1680px;
  margin: 0 auto;
}
```

### Grid Sidebar (primary layout)
```css
.grid-sidebar {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 48px;
  align-items: start;
}
.sidebar-sticky { position: sticky; top: 140px; }
```

### Hairline-Rule Row (for numbered items)
```css
.row-container { border-top: 1px solid var(--rule); }
.row-item {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 32px;
  padding: 40px 0;
  border-bottom: 1px solid var(--rule);
  align-items: baseline;
}
```

## Component Patterns

### Kicker Label
```html
<div class="kicker">01 &mdash; Section Name</div>
```
```css
.kicker {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-60);
}
```

### Section Heading with Italic Accent
```html
<h2 class="section-heading section-heading-md">
  創業から<em>現在</em>までの歩み
</h2>
```

### Quote Block
```css
.story-quote {
  border-left: 3px solid var(--accent);
  padding: 16px 20px;
  font-family: var(--serif);
  font-size: 15px;
  color: var(--ink);
  margin: 16px 0;
  line-height: 1.8;
}
```

### Button Fill
```css
.btn-fill {
  display: inline-flex;
  align-items: center;
  padding: 20px 36px;
  background: var(--ink);
  color: var(--bg);
  font-size: 14px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: all .3s;
}
```

### Button Outline
```css
.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 19px 35px;
  border: 1px solid var(--ink);
  color: var(--ink);
  font-size: 14px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
```

### Dark CTA Section
```css
.cta-section {
  background: var(--ink);
  padding: clamp(80px, 12vh, 140px) var(--page-pad);
  text-align: center;
  max-width: none;
}
.cta-section .kicker { color: rgba(250,248,245,0.4); }
.cta-section .section-heading,
.cta-section .section-heading em { color: var(--bg); }
.cta-section .paragraph { color: rgba(250,248,245,0.6); }
.cta-section .btn-fill { background: var(--bg); color: var(--ink); }
```

### Member Card
```css
.member-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.member-card img { width: 80px; height: 80px; object-fit: cover; border: 1px solid var(--rule); }
.member-card-name { font-family: var(--serif); font-size: 20px; font-weight: 400; }
.member-card-role { font-size: 12px; color: var(--ink-60); letter-spacing: 0.08em; margin-top: 4px; }
```

### Timeline
```css
.timeline-container { position: relative; max-width: 800px; }
.timeline-axis { position: absolute; left: 0; top: 0; width: 1px; height: 100%; background: var(--rule); }
.timeline-item { position: relative; padding: 32px 0 32px 48px; border-bottom: 1px solid var(--rule); }
.timeline-dot { position: absolute; left: -5px; top: 38px; width: 11px; height: 11px; background: var(--ink); border-radius: 50%; border: 2px solid var(--paper-2); }
.timeline-date { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-60); margin-bottom: 8px; }
.timeline-item h3 { font-family: var(--serif); font-size: 20px; font-weight: 400; margin: 0 0 8px; }
.timeline-item p { font-size: 15px; line-height: 1.9; color: var(--ink-60); margin: 0; }
```

## Scroll Reveal
```css
.reveal { opacity: 0; transform: translateY(24px); transition: opacity 1.2s cubic-bezier(.2,.7,.2,1), transform 1.2s cubic-bezier(.2,.7,.2,1); }
.reveal.in { opacity: 1; transform: none; }
```
JS: IntersectionObserver, threshold 0.1, adds `.in` class.

## Responsive Breakpoints

### 1024px
- `.grid-sidebar` → single column
- `.sidebar-sticky` → `position: static`

### 768px
- Hamburger menu appears
- Section padding reduces: `clamp(64px, 10vh, 96px)`
- Hero padding reduces: `140px top, 80px bottom`

### 480px
- Heading sizes reduce ~30%

## Noise Overlay (all pages)
```css
body::after {
  content: ""; position: fixed; inset: 0;
  pointer-events: none; z-index: 9999; opacity: 0.035;
  background-image: url("data:image/svg+xml;utf8,...feTurbulence...");
}
```
