# Blog Website Redesign — Design Spec
**Date:** 2026-04-09  
**Project:** Islam & Science Blog (React + Tailwind + Appwrite/MongoDB)  
**Approach:** Design Token System — CSS variables define the palette and typography; Tailwind utility classes reference those tokens throughout all components.

---

## 1. Aesthetic Direction

**Warm Monochrome.** Aged paper background, ink-black type, zero color accent. Inspired by literary journals and newspaper design — quiet, confident, and content-first.

No emerald greens, ambers, or Islamic geometric overlays. The Islamic identity is expressed through the writing itself, not through decorative UI chrome.

---

## 2. Design Tokens

Defined as CSS custom properties in `src/index.css`:

```css
:root {
  /* Palette */
  --color-paper:      #f2f0eb;  /* page background */
  --color-paper-dark: #e8e5de;  /* card/section bg */
  --color-white:      #faf8f4;  /* input/card bg */
  --color-rule:       #d4d0c8;  /* dividers, borders */
  --color-ink-faint:  #999890;  /* meta text, labels */
  --color-ink-mid:    #555550;  /* body text */
  --color-ink:        #1a1a1a;  /* headings, nav, buttons */

  /* Typography */
  --font-serif: 'Libre Baskerville', Georgia, serif;
  --font-sans:  'Source Sans 3', system-ui, sans-serif;
}
```

Google Fonts import (in `index.css`):
```
Libre Baskerville: 400, 400i, 700
Source Sans 3: 300, 400, 500, 600
```

---

## 3. Typography System

| Role | Font | Size | Weight | Treatment |
|---|---|---|---|---|
| Display / Hero title | Libre Baskerville | 2.5–3rem | 700 | tight line-height 1.15 |
| H2 section heading | Libre Baskerville | 1.5rem | 700 | — |
| H3 card/post title | Libre Baskerville | 1.1rem | 700 or 400i | italic variant for cards |
| Body text | Source Sans 3 | 1rem | 400 | line-height 1.75 |
| UI labels / meta | Source Sans 3 | 0.68rem | 500 | tracked 0.18em, uppercase |
| Nav links | Source Sans 3 | 0.7rem | 400 | tracked 0.14em, uppercase |

---

## 4. Component Design

### Header
- Background: `--color-ink` (sticky, always black — no scroll state change)
- Brand: Libre Baskerville, uppercase, `--color-paper`
- Nav links: Source Sans 3, tracked uppercase, `#888` default, `--color-paper` on hover
- Mobile: hamburger menu with ink drawer

### Hero (Homepage)
- Background: `--color-ink`
- Kicker: tracked uppercase label, `#888`
- Title: Libre Baskerville 700, `--color-paper`, 2.5rem+
- Description: Source Sans 3, `#888`, max-width centered
- CTA: underline link style, `--color-paper`

### PostCard
- Background: `--color-white`
- Top image area: `--color-paper-dark` fallback
- Category tag: tracked uppercase, `--color-ink-faint`, outlined pill border
- Title: Libre Baskerville 700 italic, `--color-ink`
- Date: Source Sans 3, `--color-ink-faint`
- Thin `--color-rule` divider above date
- Hover: subtle border darkens to `--color-ink`

### Post Detail Page
- Hero: `--color-ink` block (no image), tag + title + meta in paper/gray tones
- Article body: `--color-white` card, Libre Baskerville for body prose
- Drop cap on first paragraph
- Blockquote: 2px left border `--color-ink`, italic
- Arabic text blocks: `dir="rtl"`, larger Libre Baskerville, paper-dark bg

### Comment Section
- Input: `--color-white` bg, `--color-rule` border, no border-radius (sharp)
- Submit button: `--color-ink` bg, `--color-paper` text, tracked uppercase
- Comment item: avatar circle `--color-ink`, thin top rule between items

### Login / Signup
- Page bg: `--color-paper`
- Container: centered, no card shadow — just a 2px ink top rule for structure
- Field labels: tracked uppercase, `--color-ink-faint`
- Inputs: `--color-white` bg, `--color-rule` border, no border-radius
- Submit: full-width `--color-ink` button
- Error state: `--color-ink` border + small message below field

### Admin Layout / Dashboard
- Sidebar: `--color-ink` bg, paper-toned nav items
- Content area: `--color-paper` bg
- Tables: `--color-rule` borders, Source Sans 3, compact row spacing
- Action buttons: ghost style (ink border + ink text, white bg)

### Footer
- Background: `--color-ink`
- Brand + nav links in faded ink tones
- Thin `#333` rule above copyright
- Copyright: Source Sans 3, `#555`, small

---

## 5. Page Inventory

| Page / Component | File | Status |
|---|---|---|
| Global tokens + base | `src/index.css` | Rewrite |
| Header | `src/components/Header/Header.jsx` | Rewrite |
| Footer | `src/components/footer/Footer.jsx` | Rewrite |
| Home | `src/pages/Home.jsx` | Rewrite |
| PostCard | `src/components/PostCard.jsx` | Rewrite |
| All Posts | `src/pages/AllPosts.jsx` | Rewrite |
| Post Detail | `src/pages/Post.jsx` | Rewrite |
| Comment Section | `src/components/CommentSection.jsx` | Rewrite |
| Login | `src/components/Login.jsx` | Rewrite |
| Signup | `src/components/Signup.jsx` | Rewrite |
| Admin Layout | `src/components/AdminLayout.jsx` | Rewrite |
| Admin Dashboard | `src/components/admin/Dashboard.jsx` | Rewrite |
| Admin PostManagement | `src/components/admin/PostManagement.jsx` | Rewrite |
| Admin UserManagement | `src/components/admin/UserManagement.jsx` | Rewrite |
| Admin Sidebar | `src/components/admin/Sidebar.jsx` | Rewrite |
| Button | `src/components/Button.jsx` | Rewrite |
| Input | `src/components/input.jsx` | Rewrite |
| Container | `src/components/Container.jsx` | No change needed |
| App | `src/App.jsx` | Minor (bg class update) |

---

## 6. Implementation Strategy

**Option 1 — Design Token System (chosen)**

1. Define all CSS variables in `src/index.css` (palette + font imports)
2. Rewrite `tailwind.config.js` to extend theme with token references
3. Rewrite each component/page file — replace all Tailwind color/font classes with token-mapped equivalents
4. No new files created — all changes are in-place within existing component files

**Tailwind config extension:**
```js
theme: {
  extend: {
    colors: {
      paper: 'var(--color-paper)',
      'paper-dark': 'var(--color-paper-dark)',
      white: 'var(--color-white)',
      rule: 'var(--color-rule)',
      'ink-faint': 'var(--color-ink-faint)',
      'ink-mid': 'var(--color-ink-mid)',
      ink: 'var(--color-ink)',
    },
    fontFamily: {
      serif: 'var(--font-serif)',
      sans: 'var(--font-sans)',
    }
  }
}
```

---

## 7. Dark Mode

**Implementation:** CSS `prefers-color-scheme` media query as the base, plus a `[data-theme="dark"]` attribute on `<html>` for a manual toggle stored in `localStorage`. Tailwind's `darkMode: 'class'` strategy will be used so dark classes (`dark:bg-ink`, `dark:text-paper`, etc.) are applied when the html element has `class="dark"`.

**Dark palette tokens (added to `:root` under a `dark` override):**

```css
[data-theme="dark"], .dark {
  --color-paper:      #141412;  /* near-black page bg */
  --color-paper-dark: #1e1c1a;  /* card/section bg */
  --color-white:      #1a1816;  /* input/content bg */
  --color-rule:       #2e2c28;  /* dividers */
  --color-ink-faint:  #6b6960;  /* faint labels */
  --color-ink-mid:    #a8a49c;  /* body text */
  --color-ink:        #f2f0eb;  /* headings, nav (inverted) */
}
```

**Toggle:** A sun/moon icon button in the Header (right side of nav). Clicking it toggles `class="dark"` on `<html>` and persists the preference to `localStorage`. On initial load, reads `localStorage` preference, falling back to `prefers-color-scheme`.

**Hero inversion in dark mode:** The ink banner hero (which is already `--color-ink` / black) becomes the paper bg — so in dark mode the hero uses `--color-paper` (near-black) which is seamless. The text flips to `--color-ink` (now paper-light).

---

## 8. Mobile Responsiveness

All pages are fully responsive. Breakpoints follow Tailwind defaults: `sm` 640px, `md` 768px, `lg` 1024px.

| Component | Mobile (< 640px) | Tablet (640–1024px) | Desktop (> 1024px) |
|---|---|---|---|
| Header nav | Hidden; hamburger → full-width ink drawer | Hidden; hamburger | Inline horizontal nav |
| Hero | Stacked, full-width, reduced font size (1.8rem) | Same as mobile | 2.5rem+ centered |
| Card grid | 1 column | 2 columns | 3 columns |
| Post detail | Full-width, 16px side padding | Max-width 680px centered | Max-width 740px centered |
| Comment section | Full-width | Full-width | Full-width within post container |
| Login / Signup | Full-width form, 16px padding | Centered card max-width 420px | Centered card max-width 420px |
| Admin sidebar | Hidden; top nav bar with menu toggle | Collapsible drawer | Fixed left sidebar 220px |
| Footer | Stacked brand + links | Horizontal | Horizontal |

**Touch targets:** All interactive elements minimum 44×44px tap area.  
**Typography scaling:** Hero title uses `clamp(1.6rem, 5vw, 2.8rem)` for fluid sizing.  
**Images:** All `img` tags use `w-full h-full object-cover` within fixed-aspect containers.

---

## 9. Out of Scope

- No changes to routing, Redux store, services, or backend
- No changes to PostForm / RTE (write/edit post UI) — separate task
- No new pages or features
- No changes to Appwrite/MongoDB integration logic
