# Blog Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Islam & Science blog with a Warm Monochrome aesthetic — CSS design tokens, Libre Baskerville + Source Sans 3 typography, ink banner hero, responsive card grid, and a dark mode toggle persisted in localStorage.

**Architecture:** CSS custom properties define the full color palette in `index.css`. Tailwind's theme extension maps semantic utility classes (`bg-ink`, `text-ink-mid`, `border-rule`, etc.) to those variables. Dark mode flips the variables under `.dark` on `<html>` — no `dark:` prefixes needed in components. All existing logic (Redux, routing, API calls, form validation) is preserved; only styling classes change.

**Tech Stack:** React 18, Tailwind CSS (`darkMode: 'class'`), React Router, Redux Toolkit, Vite, Google Fonts (Libre Baskerville 400/700/italic + Source Sans 3 300/400/500/600)

---

## File Map

| File | Change |
|---|---|
| `src/index.css` | CSS variable tokens (light + dark), Google Fonts import, base styles, `.drop-cap`, `.hero-title` |
| `tailwind.config.cjs` | `darkMode: 'class'`, color + font token extensions |
| `src/components/Button.jsx` | Token-based, sharp corners, tracked uppercase |
| `src/components/input.jsx` | Token-based, sharp corners, tracked uppercase labels |
| `src/components/Header/Header.jsx` | Ink bg, dark mode toggle (localStorage), mobile drawer |
| `src/components/footer/Footer.jsx` | Ink footer, brand + links + copyright |
| `src/components/PostCard.jsx` | Paper card, italic serif title, rule divider, tag pill |
| `src/pages/Home.jsx` | Ink banner hero + responsive card grid |
| `src/pages/AllPosts.jsx` | Ink archive header + responsive grid |
| `src/pages/Post.jsx` | Ink post header, serif prose, drop cap, blockquote |
| `src/components/CommentSection.jsx` | Ink avatars, rule dividers, sharp input |
| `src/components/Login.jsx` | Centered paper form, 2px ink rule, sharp inputs |
| `src/components/Signup.jsx` | Centered paper form, 2px ink rule, sharp inputs |
| `src/components/AdminLayout.jsx` | Token-based loader |
| `src/components/admin/Sidebar.jsx` | Ink sidebar, tracked uppercase nav |
| `src/components/admin/Dashboard.jsx` | Stat cards on paper-white, rule grid |
| `src/components/admin/PostManagement.jsx` | Token-based table with rule dividers |
| `src/components/admin/UserManagement.jsx` | Token-based table with rule dividers |
| `src/App.jsx` | Root div class: `bg-paper text-ink` |

---

## Task 1: CSS Design Tokens + Tailwind Dark Mode Config

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.cjs`

- [ ] **Step 1: Replace `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Light Mode Tokens ─── */
:root {
  --color-paper:      #f2f0eb;
  --color-paper-dark: #e8e5de;
  --color-white:      #faf8f4;
  --color-rule:       #d4d0c8;
  --color-ink-faint:  #999890;
  --color-ink-mid:    #555550;
  --color-ink:        #1a1a1a;
}

/* ─── Dark Mode Tokens ─── */
.dark {
  --color-paper:      #141412;
  --color-paper-dark: #1e1c1a;
  --color-white:      #1a1816;
  --color-rule:       #2e2c28;
  --color-ink-faint:  #6b6960;
  --color-ink-mid:    #a8a49c;
  --color-ink:        #f2f0eb;
}

@layer base {
  html { font-size: 16px; }
  body {
    background-color: var(--color-paper);
    color: var(--color-ink);
    font-family: 'Source Sans 3', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Libre Baskerville', Georgia, serif;
    color: var(--color-ink);
  }
  /* Fluid hero title */
  .hero-title {
    font-size: clamp(1.6rem, 5vw, 2.8rem);
  }
  /* Drop cap for post first paragraph */
  .drop-cap::first-letter {
    font-family: 'Libre Baskerville', Georgia, serif;
    font-size: 4rem;
    font-weight: 700;
    float: left;
    line-height: 0.75;
    margin-right: 0.1em;
    margin-top: 0.1em;
    color: var(--color-ink);
  }
}
```

- [ ] **Step 2: Replace `tailwind.config.cjs`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:         'var(--color-paper)',
        'paper-dark':  'var(--color-paper-dark)',
        'paper-white': 'var(--color-white)',
        rule:          'var(--color-rule)',
        'ink-faint':   'var(--color-ink-faint)',
        'ink-mid':     'var(--color-ink-mid)',
        ink:           'var(--color-ink)',
      },
      fontFamily: {
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans:  ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Verify dev server starts**

Run: `npm run dev`
Expected: Server starts with no compilation errors. Page background is `#f2f0eb` (warm paper tone).

- [ ] **Step 4: Commit**

```bash
git add src/index.css tailwind.config.cjs
git commit -m "feat: add design token system and dark mode Tailwind config"
```

---

## Task 2: Button + Input Primitive Components

**Files:**
- Modify: `src/components/Button.jsx`
- Modify: `src/components/input.jsx`

- [ ] **Step 1: Replace `src/components/Button.jsx`**

```jsx
import React from 'react'

function Button({ children, type = "button", bgColor, textColor, className = "", disabled = false, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        px-6 py-3 font-sans text-xs font-semibold tracking-widest uppercase
        transition-opacity duration-150 min-h-[44px]
        ${disabled
          ? 'bg-rule text-ink-faint cursor-not-allowed opacity-60'
          : bgColor
            ? `${bgColor} ${textColor || 'text-paper-white'} hover:opacity-80`
            : 'bg-ink text-paper hover:opacity-80'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
```

- [ ] **Step 2: Replace `src/components/input.jsx`**

```jsx
import React, { forwardRef, useState } from 'react'

const Input = forwardRef(({ label, type = "text", placeholder, className = "", ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"

  return (
    <div className="mb-4">
      {label && (
        <label className="block font-sans text-[10px] font-medium tracking-[0.16em] uppercase text-ink-faint mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 font-sans text-sm text-ink-mid
            bg-paper-white border border-rule
            focus:outline-none focus:border-ink
            transition-colors duration-150
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-mid focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
})

Input.displayName = 'Input'
export default Input
```

- [ ] **Step 3: Verify**

Run: `npm run dev` and navigate to `/login`.
Expected: Inputs have paper-white bg, no border radius, tracked uppercase label, border darkens to ink on focus.

- [ ] **Step 4: Commit**

```bash
git add src/components/Button.jsx src/components/input.jsx
git commit -m "feat: redesign Button and Input with monochrome token styles"
```

---

## Task 3: Header with Dark Mode Toggle

**Files:**
- Modify: `src/components/Header/Header.jsx`

- [ ] **Step 1: Replace `src/components/Header/Header.jsx`**

```jsx
import React, { useState, useEffect } from 'react'
import { Container, Logoutbtn } from '../index'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function initDarkMode() {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const isAdmin = userData?.role === 'admin' || userData?.role === 'superadmin'

  useEffect(() => {
    const dark = initDarkMode()
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const navItems = [
    { name: 'Home',        slug: '/',          active: true },
    { name: 'Login',       slug: '/login',     active: !authStatus },
    { name: 'Articles',    slug: '/all-posts', active: true },
    { name: 'Write',       slug: '/add-post',  active: authStatus && isAdmin },
    { name: 'Admin Panel', slug: '/admin',     active: authStatus && isAdmin },
  ]

  const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  )

  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  )

  return (
    <header className="sticky top-0 z-50 bg-ink border-b border-rule">
      <Container>
        <nav className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link
            to="/"
            className="font-serif text-sm font-bold tracking-wider uppercase text-paper hover:opacity-70 transition-opacity"
          >
            Islam & Science
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navItems.filter(i => i.active).map(item => (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.slug)}
                  className={`px-4 py-2 font-sans text-[10px] font-medium tracking-[0.14em] uppercase transition-colors min-h-[44px] ${
                    location.pathname === item.slug ? 'text-paper' : 'text-ink-faint hover:text-paper'
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
            {authStatus && (
              <li className="ml-2 pl-4 border-l border-rule">
                <Logoutbtn />
              </li>
            )}
            <li className="ml-2">
              <button
                onClick={toggleDark}
                className="p-2 text-ink-faint hover:text-paper transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle dark mode"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </li>
          </ul>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={toggleDark}
              className="p-2 text-ink-faint hover:text-paper transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle dark mode"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-ink-faint hover:text-paper transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-rule pb-2">
            <ul className="flex flex-col mt-1">
              {navItems.filter(i => i.active).map(item => (
                <li key={item.name}>
                  <button
                    onClick={() => { navigate(item.slug); setIsMenuOpen(false) }}
                    className={`block w-full text-left px-4 py-3 font-sans text-[10px] font-medium tracking-[0.14em] uppercase transition-colors min-h-[44px] ${
                      location.pathname === item.slug ? 'text-paper' : 'text-ink-faint hover:text-paper'
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
              {authStatus && (
                <li className="px-4 pt-2 border-t border-rule mt-1">
                  <Logoutbtn />
                </li>
              )}
            </ul>
          </div>
        )}
      </Container>
    </header>
  )
}

export default Header
```

- [ ] **Step 2: Verify**

Run: `npm run dev`.
Expected: Header is solid black, paper-toned brand text, moon icon on right. Clicking moon → page bg flips to `#141412` (dark), icon becomes sun. Reload — preference persists. Resize to mobile → hamburger + moon icons appear, nav collapses into drawer.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header/Header.jsx
git commit -m "feat: redesign Header with dark mode toggle and responsive mobile drawer"
```

---

## Task 4: Footer

**Files:**
- Modify: `src/components/footer/Footer.jsx`

- [ ] **Step 1: Replace `src/components/footer/Footer.jsx`**

```jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../index'

function Footer() {
  return (
    <footer className="bg-ink mt-auto">
      <Container>
        <div className="py-8 border-b border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="font-serif text-sm font-bold tracking-wider uppercase text-paper">
            Islam & Science
          </span>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: 'Home',     to: '/' },
              { label: 'Articles', to: '/all-posts' },
            ].map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-ink-faint hover:text-paper transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="py-5">
          <p className="font-sans text-[10px] text-ink-faint tracking-wider">
            © {new Date().getFullYear()} Islam & Science. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
```

- [ ] **Step 2: Verify**

Run: `npm run dev`.
Expected: Footer is solid black, paper-toned brand, faint nav links, copyright below a rule. Stacks to column on mobile.

- [ ] **Step 3: Commit**

```bash
git add src/components/footer/Footer.jsx
git commit -m "feat: redesign Footer with minimal monochrome style"
```

---

## Task 5: PostCard

**Files:**
- Modify: `src/components/PostCard.jsx`

- [ ] **Step 1: Replace `src/components/PostCard.jsx`**

```jsx
import React, { useState, useEffect } from 'react'
import appwriteService from "../services/config"
import { Link } from 'react-router-dom'

function PostCard({ $id, title, featuredimage, $createdAt }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (featuredimage) {
      try {
        setImageUrl(appwriteService.getFilePreview(featuredimage))
      } catch {
        setImageError(true)
      }
    }
  }, [featuredimage])

  return (
    <Link to={`/post/${$id}`} className="block group h-full">
      <article className="bg-paper-white border border-rule hover:border-ink transition-colors duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="aspect-[16/9] overflow-hidden bg-paper-dark">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-ink-faint text-sm italic">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <span className="font-sans text-[9px] font-medium tracking-[0.2em] uppercase text-ink-faint mb-3 border border-rule px-2 py-1 inline-block self-start">
            Reflection
          </span>
          <h2 className="font-serif text-base font-bold italic leading-snug text-ink mb-3 line-clamp-2 group-hover:opacity-70 transition-opacity">
            {title}
          </h2>
          <div className="mt-auto pt-4 border-t border-rule">
            <span className="font-sans text-[10px] text-ink-faint tracking-wider">
              {new Date($createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default PostCard
```

- [ ] **Step 2: Verify**

Run: `npm run dev`. Expected: Cards have paper-white bg, ink border on hover, outlined "Reflection" tag pill, italic serif title, date below a rule line.

- [ ] **Step 3: Commit**

```bash
git add src/components/PostCard.jsx
git commit -m "feat: redesign PostCard with monochrome token styles"
```

---

## Task 6: Home Page + App Base

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace `src/pages/Home.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import appwriteService from "../services/config"
import { Container, PostCard } from '../components'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Home() {
  const [postsList, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const authStatus = useSelector((state) => state.auth.status)

  useEffect(() => {
    appwriteService.getPosts()
      .then((posts) => { if (posts) setPosts(posts.documents) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="w-full py-32 flex justify-center">
        <div className="w-8 h-8 border-2 border-rule border-t-ink rounded-full animate-spin" />
      </div>
    )
  }

  if (postsList.length === 0) {
    return (
      <div className="w-full py-32">
        <Container>
          <div className="max-w-lg mx-auto text-center border border-rule p-12">
            <h1 className="font-serif text-2xl font-bold text-ink mb-4">Islam & Science</h1>
            <p className="font-sans text-sm text-ink-mid mb-8">
              No reflections have been shared yet.
              {authStatus && ' Be the first to share wisdom.'}
            </p>
            {authStatus && (
              <Link
                to="/add-post"
                className="inline-block font-sans text-[10px] font-semibold tracking-[0.16em] uppercase bg-ink text-paper px-6 py-3 hover:opacity-80 transition-opacity"
              >
                Share Your Thoughts
              </Link>
            )}
          </div>
        </Container>
      </div>
    )
  }

  const [featured, ...rest] = postsList

  return (
    <div className="w-full">
      {/* ── Ink Banner Hero ── */}
      <section className="bg-ink py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-sans text-[9px] font-medium tracking-[0.25em] uppercase text-ink-faint mb-6">
            Featured Reflection
          </p>
          <h1 className="hero-title font-serif font-bold text-paper leading-tight mb-6">
            {featured.title}
          </h1>
          <p className="font-sans text-sm text-ink-faint mb-10 leading-relaxed">
            Explore Islamic history, spirituality, and modern reflections.
          </p>
          <Link
            to={`/post/${featured.$id}`}
            className="font-sans text-[10px] font-semibold tracking-[0.16em] uppercase text-paper border-b border-paper pb-px hover:opacity-70 transition-opacity"
          >
            Read Full Article →
          </Link>
        </div>
      </section>

      {/* ── Recent Posts ── */}
      <Container>
        <div className="py-14">
          <div className="flex items-baseline justify-between mb-8 border-b-2 border-ink pb-3">
            <h2 className="font-serif text-xl font-bold text-ink">Recent Reflections</h2>
            <Link
              to="/all-posts"
              className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-ink-faint hover:text-ink transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule">
            {rest.map((post) => (
              <div key={post.$id} className="bg-paper">
                <PostCard {...post} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Home
```

- [ ] **Step 2: Update `src/App.jsx`**

In `src/App.jsx`, change the root div className:

```jsx
// Before:
<div className='min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900'>

// After:
<div className='min-h-screen flex flex-col bg-paper font-sans text-ink'>
```

- [ ] **Step 3: Verify**

Run: `npm run dev`.
Expected: Black ink hero with paper/cream title, "Read Full Article →" underline link. Below: "Recent Reflections" with 2px ink rule, cards in 1/2/3-col responsive grid with rule-colored 1px gap. Toggle dark mode — hero inverts to paper background, page bg near-black.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.jsx src/App.jsx
git commit -m "feat: redesign Home page with ink banner hero and responsive card grid"
```

---

## Task 7: All Posts Page

**Files:**
- Modify: `src/pages/AllPosts.jsx`

- [ ] **Step 1: Replace `src/pages/AllPosts.jsx`**

```jsx
import React, { useState, useEffect } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../services/config"

function AllPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appwriteService.getPosts([]).then((posts) => {
      if (posts) setPosts(posts.documents)
      setLoading(false)
    })
  }, [])

  return (
    <div className="w-full min-h-screen">
      {/* Ink archive header */}
      <div className="bg-ink py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-sans text-[9px] font-medium tracking-[0.25em] uppercase text-ink-faint mb-4">
            Archive
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-paper">
            All Articles
          </h1>
        </div>
      </div>

      <Container>
        <div className="py-14">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-rule border-t-ink rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 border border-rule">
              <p className="font-sans text-sm text-ink-mid">No articles available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule">
              {posts.map((post) => (
                <div key={post.$id} className="bg-paper">
                  <PostCard {...post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default AllPosts
```

- [ ] **Step 2: Verify**

Navigate to `/all-posts`.
Expected: Ink archive header, then responsive 1/2/3-col grid of PostCards. Empty and loading states use spinner / bordered message box.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AllPosts.jsx
git commit -m "feat: redesign AllPosts page with ink archive header"
```

---

## Task 8: Post Detail Page

**Files:**
- Modify: `src/pages/Post.jsx`

- [ ] **Step 1: Replace `src/pages/Post.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Service from '../services/config'
import { Button, Container, CommentSection } from '../components'
import parse, { domToReact } from 'html-react-parser'
import { useSelector } from 'react-redux'

export default function Post() {
  const [post, setPost] = useState(null)
  const { slug } = useParams()
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)
  const isAuthor = post && userData ? post.userId === userData.$id : false

  useEffect(() => {
    if (slug) {
      Service.getPost(slug).then((post) => {
        if (post) setPost(post)
        else navigate('/')
      })
    } else navigate('/')
  }, [slug, navigate])

  const deletePost = () => {
    Service.deletePost(post.$id).then((status) => {
      if (status) {
        Service.deleteFile(post.featuredimage)
        navigate('/')
      }
    })
  }

  return post ? (
    <article className="min-h-screen bg-paper">
      {/* Ink post header */}
      <div className="bg-ink py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-sans text-[9px] font-medium tracking-[0.25em] uppercase text-ink-faint mb-4">
            Reflection ·{' '}
            {new Date(post.$createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
          <h1 className="hero-title font-serif font-bold text-paper leading-tight mb-6">
            {post.title}
          </h1>
          <p className="font-sans text-xs text-ink-faint tracking-wider">
            Author Name · {Math.ceil((post.content?.length || 0) / 1500)} min read
          </p>
        </div>
      </div>

      <Container>
        <div className="max-w-2xl mx-auto py-12">
          {/* Author controls */}
          {isAuthor && (
            <div className="flex justify-end gap-3 mb-8">
              <Link to={`/edit-post/${post.$id}`}>
                <Button className="text-[10px]">Edit Post</Button>
              </Link>
              <Button
                bgColor="bg-paper-white"
                textColor="text-ink"
                className="text-[10px] border border-rule hover:border-ink"
                onClick={deletePost}
              >
                Delete
              </Button>
            </div>
          )}

          {/* Article body */}
          <div className="font-serif text-base leading-8 text-ink-mid">
            {parse(String(post.content || ''), {
              replace: (node) => {
                if (node.type !== 'tag') return undefined

                const Tag = node.name
                const children = node.children ? domToReact(node.children) : null
                const plainText = (node.children || [])
                  .map((c) => {
                    if (c.type === 'text') return c.data || ''
                    if (c.children) return c.children.map((cc) => cc.data || '').join('')
                    return ''
                  })
                  .join('')
                  .trim()

                if (/[\u0600-\u06FF]/.test(plainText)) {
                  return (
                    <div className="bg-paper-dark border-l-2 border-ink px-6 py-5 my-8" dir="rtl" lang="ar">
                      <p className="font-serif text-xl leading-relaxed text-ink">{children}</p>
                    </div>
                  )
                }
                if (Tag === 'h1') return <h1 className="font-serif text-3xl font-bold text-ink mt-12 mb-6">{children}</h1>
                if (Tag === 'h2') return <h2 className="font-serif text-2xl font-bold text-ink mt-10 mb-4">{children}</h2>
                if (Tag === 'h3') return <h3 className="font-serif text-xl font-bold text-ink mt-8 mb-3">{children}</h3>
                if (Tag === 'p')  return <p className="font-serif text-base leading-8 text-ink-mid my-5 first-of-type:drop-cap">{children}</p>
                if (Tag === 'blockquote') return (
                  <blockquote className="border-l-2 border-ink pl-5 my-8 italic text-ink-mid">
                    {children}
                  </blockquote>
                )
                if (Tag === 'ul') return <ul className="list-disc ml-6 space-y-2 my-6 text-ink-mid">{children}</ul>
                if (Tag === 'ol') return <ol className="list-decimal ml-6 space-y-2 my-6 text-ink-mid">{children}</ol>
                if (Tag === 'img') return <img src={node.attribs?.src} alt={node.attribs?.alt || 'image'} className="w-full my-8" />
                return undefined
              },
            })}
          </div>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-rule">
            <Link
              to="/all-posts"
              className="font-sans text-[10px] font-medium tracking-[0.14em] uppercase text-ink-faint hover:text-ink transition-colors"
            >
              ← All Articles
            </Link>
          </div>

          {/* Comments */}
          <CommentSection postId={post._id} userData={userData} />
        </div>
      </Container>
    </article>
  ) : null
}
```

- [ ] **Step 2: Verify**

Click any post on the homepage.
Expected: Ink header with paper title text, serif body with ink-mid tone, blockquotes have 2px left ink border, Arabic text in paper-dark block with `dir="rtl"`, "← All Articles" underline link at bottom.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Post.jsx
git commit -m "feat: redesign Post detail page with ink header and serif prose body"
```

---

## Task 9: Comment Section

**Files:**
- Modify: `src/components/CommentSection.jsx`

- [ ] **Step 1: Replace `src/components/CommentSection.jsx`**

```jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CommentService from '../services/comment'

export default function CommentSection({ postId, userData }) {
  const [comment, setComment] = useState('')
  const [commentData, setCommentData] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)

  useEffect(() => {
    if (postId) fetchComments()
  }, [postId])

  const fetchComments = async () => {
    setIsLoadingComments(true)
    try {
      const comments = await CommentService.getComments(postId)
      if (comments) setCommentData(comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const createComment = async () => {
    if (!comment.trim()) return
    if (!userData) { alert('Please login to comment'); return }
    setIsSubmitting(true)
    try {
      const newComment = await CommentService.createComment({ comment: comment.trim(), postId })
      if (newComment) { setComment(''); fetchComments() }
    } catch (error) {
      console.error('Error creating comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') createComment()
  }

  return (
    <div className="mt-16 pt-8 border-t border-rule">
      <h2 className="font-serif text-lg font-bold text-ink mb-8">
        Comments ({commentData.length})
      </h2>

      {userData ? (
        <div className="mb-10">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-ink flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-sans text-[11px] font-bold text-paper">
                {userData.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Share your thoughts... (Ctrl+Enter to submit)"
                className="w-full border border-rule bg-paper-white px-4 py-3 font-sans text-sm text-ink-mid focus:outline-none focus:border-ink transition-colors resize-none"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={createComment}
                  disabled={isSubmitting || !comment.trim()}
                  className="font-sans text-[10px] font-semibold tracking-[0.16em] uppercase bg-ink text-paper px-5 py-2 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-10 border border-rule p-6">
          <p className="font-sans text-sm text-ink-mid text-center">
            Please{' '}
            <Link to="/login" className="text-ink border-b border-rule hover:border-ink transition-colors">
              login
            </Link>{' '}
            to leave a comment
          </p>
        </div>
      )}

      <div className="space-y-0">
        {isLoadingComments ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-rule border-t-ink rounded-full animate-spin" />
          </div>
        ) : commentData.length === 0 ? (
          <div className="border border-rule p-8 text-center">
            <p className="font-sans text-sm text-ink-faint">No comments yet. Be the first to share your thoughts.</p>
          </div>
        ) : (
          commentData.map((item) => <CommentItem key={item._id} commentItem={item} />)
        )}
      </div>
    </div>
  )
}

function CommentItem({ commentItem }) {
  const initials = commentItem.userId?.firstName?.charAt(0).toUpperCase()
    || commentItem.userId?.username?.charAt(0).toUpperCase()
    || 'U'

  const name = commentItem.userId?.firstName && commentItem.userId?.lastName
    ? `${commentItem.userId.firstName} ${commentItem.userId.lastName}`
    : commentItem.userId?.username || 'Anonymous'

  return (
    <div className="flex items-start gap-4 py-6 border-t border-rule">
      <div className="w-8 h-8 bg-ink flex items-center justify-center flex-shrink-0">
        <span className="font-sans text-[11px] font-bold text-paper">{initials}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-sans text-xs font-semibold text-ink">{name}</span>
          <span className="font-sans text-[10px] text-ink-faint">
            {new Date(commentItem.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        </div>
        <p className="font-sans text-sm text-ink-mid leading-relaxed">{commentItem.content}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Navigate to a post. Expected: Comment section has ink-square avatars, rule-divided comment items, sharp bordered textarea with focus:border-ink, uppercase "Post Comment" button.

- [ ] **Step 3: Commit**

```bash
git add src/components/CommentSection.jsx
git commit -m "feat: redesign CommentSection with monochrome token styles"
```

---

## Task 10: Login + Signup

**Files:**
- Modify: `src/components/Login.jsx`
- Modify: `src/components/Signup.jsx`

- [ ] **Step 1: Replace `src/components/Login.jsx`**

```jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../store/authSlice'
import { Button, Input } from './index.js'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import authService from '../services/auth'

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const loginUser = async (data) => {
    setError('')
    setLoading(true)
    try {
      const session = await authService.login(data)
      if (session?.data) {
        const userData = session.data.user
        if (userData) {
          dispatch(login({ userData }))
          navigate('/')
        } else {
          setError('Login successful but user data not received. Please try again.')
        }
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-paper">
      <div className="w-full max-w-sm">
        <div className="h-0.5 bg-ink mb-8" />
        <p className="font-sans text-[9px] font-medium tracking-[0.2em] uppercase text-ink-faint mb-2 text-center">
          Islam & Science
        </p>
        <h1 className="font-serif text-2xl font-bold text-ink text-center mb-8">Sign In</h1>

        {error && (
          <div className="border border-rule bg-paper-dark px-4 py-3 mb-6">
            <p className="font-sans text-xs text-ink-mid text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(loginUser)} className="space-y-1">
          <div>
            <Input
              label="Email"
              placeholder="your@email.com"
              type="email"
              {...register('email', {
                required: 'Email is required',
                validate: {
                  matchPattern: (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Please enter a valid email address',
                  noWhitespace: (v) => !v.includes(' ') || 'Email cannot contain spaces',
                },
              })}
            />
            {errors.email && <p className="font-sans text-[10px] text-ink-mid -mt-2 mb-3">{errors.email.message}</p>}
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
                validate: { noWhitespace: (v) => !/^\s|\s$/.test(v) || 'Password cannot start or end with spaces' },
              })}
            />
            {errors.password && <p className="font-sans text-[10px] text-ink-mid -mt-2 mb-3">{errors.password.message}</p>}
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </Button>
          </div>
        </form>

        <p className="font-sans text-xs text-ink-faint text-center mt-6">
          No account?{' '}
          <Link to="/signup" className="text-ink border-b border-rule hover:border-ink transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
```

- [ ] **Step 2: Replace `src/components/Signup.jsx`**

```jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../store/authSlice'
import { Button, Input } from './index.js'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import authService from '../services/auth'

function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const password = watch('password')

  const create = async (data) => {
    setError('')
    setLoading(true)
    try {
      const session = await authService.createAccount(data)
      if (session?.data) {
        const userData = session.data.user
        if (userData) {
          dispatch(login({ userData }))
          navigate('/')
        } else {
          setError('Account created but user data not received. Please try logging in.')
        }
      } else {
        setError('Account creation failed. Please try again.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Account creation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-paper">
      <div className="w-full max-w-sm">
        <div className="h-0.5 bg-ink mb-8" />
        <p className="font-sans text-[9px] font-medium tracking-[0.2em] uppercase text-ink-faint mb-2 text-center">
          Islam & Science
        </p>
        <h1 className="font-serif text-2xl font-bold text-ink text-center mb-8">Create Account</h1>

        {error && (
          <div className="border border-rule bg-paper-dark px-4 py-3 mb-6">
            <p className="font-sans text-xs text-ink-mid text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(create)} className="space-y-1">
          <div>
            <Input
              label="Full Name"
              placeholder="Your full name"
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
                validate: {
                  noNumbers: (v) => !/\d/.test(v) || 'Name cannot contain numbers',
                  noSpecialChars: (v) => /^[a-zA-Z\s]+$/.test(v) || 'Name can only contain letters and spaces',
                  notOnlySpaces: (v) => v.trim().length > 0 || 'Name cannot be only spaces',
                },
              })}
            />
            {errors.name && <p className="font-sans text-[10px] text-ink-mid -mt-2 mb-3">{errors.name.message}</p>}
          </div>
          <div>
            <Input
              label="Email"
              placeholder="your@email.com"
              type="email"
              {...register('email', {
                required: 'Email is required',
                validate: {
                  matchPattern: (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'Please enter a valid email address',
                  noWhitespace: (v) => !v.includes(' ') || 'Email cannot contain spaces',
                },
              })}
            />
            {errors.email && <p className="font-sans text-[10px] text-ink-mid -mt-2 mb-3">{errors.email.message}</p>}
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                validate: {
                  hasUpperCase: (v) => /[A-Z]/.test(v) || 'Must contain at least one uppercase letter',
                  hasLowerCase: (v) => /[a-z]/.test(v) || 'Must contain at least one lowercase letter',
                  hasNumber: (v) => /\d/.test(v) || 'Must contain at least one number',
                  noWhitespace: (v) => !/^\s|\s$/.test(v) || 'Cannot start or end with spaces',
                },
              })}
            />
            {errors.password && <p className="font-sans text-[10px] text-ink-mid -mt-2 mb-3">{errors.password.message}</p>}
          </div>
          <div>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: { matchPassword: (v) => v === password || 'Passwords do not match' },
              })}
            />
            {errors.confirmPassword && <p className="font-sans text-[10px] text-ink-mid -mt-2 mb-3">{errors.confirmPassword.message}</p>}
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </Button>
          </div>
        </form>

        <p className="font-sans text-xs text-ink-faint text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-ink border-b border-rule hover:border-ink transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
```

- [ ] **Step 3: Verify**

Navigate to `/login` and `/signup`.
Expected: Centered form on paper bg, 2px ink top rule, tracked uppercase field labels, sharp inputs with focus ring on border, full-width ink submit button, faint underline sign-up/in link.

- [ ] **Step 4: Commit**

```bash
git add src/components/Login.jsx src/components/Signup.jsx
git commit -m "feat: redesign Login and Signup with monochrome centered form"
```

---

## Task 11: Admin Panel

**Files:**
- Modify: `src/components/AdminLayout.jsx`
- Modify: `src/components/admin/Sidebar.jsx`
- Modify: `src/components/admin/Dashboard.jsx`
- Modify: `src/components/admin/PostManagement.jsx`
- Modify: `src/components/admin/UserManagement.jsx`

- [ ] **Step 1: Replace `src/components/AdminLayout.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)
  const authStatus = useSelector((state) => state.auth.status)
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    if (!authStatus) { navigate('/login'); return }
    const isAdmin = userData?.role === 'admin' || userData?.role === 'superadmin'
    if (!isAdmin) navigate('/')
    setLoader(false)
  }, [authStatus, userData, navigate])

  return loader ? (
    <div className="flex justify-center items-center min-h-screen bg-paper">
      <div className="w-8 h-8 border-2 border-rule border-t-ink rounded-full animate-spin" />
    </div>
  ) : <>{children}</>
}
```

- [ ] **Step 2: Replace `src/components/admin/Sidebar.jsx`**

```jsx
import React from 'react'

function Sidebar({ activeSection, setActiveSection }) {
  const sections = [
    { name: 'dashboard', label: 'Dashboard' },
    { name: 'users',     label: 'Users' },
    { name: 'posts',     label: 'Posts' },
  ]

  return (
    <aside className="w-full md:w-56 bg-ink flex-shrink-0">
      <div className="p-5 border-b border-rule">
        <h2 className="font-serif text-sm font-bold tracking-wider uppercase text-paper">
          Admin Panel
        </h2>
      </div>
      <nav className="p-3">
        {sections.map((sec) => (
          <button
            key={sec.name}
            onClick={() => setActiveSection(sec.name)}
            className={`block w-full text-left px-4 py-3 font-sans text-[10px] font-medium tracking-[0.14em] uppercase transition-colors min-h-[44px] ${
              activeSection === sec.name
                ? 'text-paper'
                : 'text-ink-faint hover:text-paper'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
```

- [ ] **Step 3: Replace `src/components/admin/Dashboard.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/admin'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getAdminStats()
      .then(setStats)
      .catch((err) => console.error('Failed to fetch admin stats', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-rule border-t-ink rounded-full animate-spin" />
    </div>
  )
  if (!stats) return <p className="font-sans text-sm text-ink-mid p-6">No stats available.</p>

  const statCards = [
    { label: 'Total Users',   value: stats.users?.total      || 0 },
    { label: 'Super Admins',  value: stats.users?.superadmins || 0 },
    { label: 'Admins',        value: stats.users?.admins     || 0 },
    { label: 'Regular Users', value: stats.users?.regular    || 0 },
    { label: 'Total Posts',   value: stats.posts?.total      || 0 },
    { label: 'Active Posts',  value: stats.posts?.active     || 0 },
  ]

  return (
    <div className="p-6">
      <div className="border-b-2 border-ink pb-4 mb-8">
        <h2 className="font-serif text-xl font-bold text-ink">Dashboard</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-rule">
        {statCards.map((card) => (
          <div key={card.label} className="bg-paper-white p-6">
            <p className="font-sans text-[9px] font-medium tracking-[0.18em] uppercase text-ink-faint mb-3">
              {card.label}
            </p>
            <p className="font-serif text-3xl font-bold text-ink">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
```

- [ ] **Step 4: Replace `src/components/admin/PostManagement.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/admin'
import { Link } from 'react-router-dom'

function PostManagement() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllPosts()
      setPosts(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch posts', err)
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (postId, currentStatus) => {
    try {
      await adminService.togglePostStatus(postId, !currentStatus)
      await fetchPosts()
    } catch (err) {
      console.error('Failed to toggle post status', err)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return
    try {
      await adminService.deletePost(postId)
      await fetchPosts()
    } catch (err) {
      console.error('Failed to delete post', err)
    }
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-rule border-t-ink rounded-full animate-spin" />
    </div>
  )
  if (error) return <div className="p-6 border border-rule font-sans text-sm text-ink-mid">{error}</div>

  return (
    <div className="p-6">
      <div className="border-b-2 border-ink pb-4 mb-8">
        <h2 className="font-serif text-xl font-bold text-ink">Post Management</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-rule">
              {['Title', 'Author', 'Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-sans text-[9px] font-medium tracking-[0.16em] uppercase text-ink-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-sans text-sm text-ink-faint">No posts found</td>
              </tr>
            ) : posts.map((post) => (
              <tr key={post._id} className="border-b border-rule hover:bg-paper-dark transition-colors">
                <td className="px-4 py-4 font-sans text-sm text-ink max-w-[200px] truncate">{post.title}</td>
                <td className="px-4 py-4 font-sans text-sm text-ink-mid whitespace-nowrap">
                  {post.author?.firstName && post.author?.lastName
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : post.author?.username || 'Unknown'}
                </td>
                <td className="px-4 py-4 font-sans text-sm text-ink-faint whitespace-nowrap">{formatDate(post.createdAt)}</td>
                <td className="px-4 py-4">
                  <span className="font-sans text-[9px] font-medium tracking-[0.14em] uppercase px-2 py-1 border border-rule text-ink-mid">
                    {post.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-4 font-sans text-[10px] font-medium tracking-wider uppercase">
                    <Link to={`/post/${post.slug}`} className="text-ink-mid hover:text-ink transition-colors">View</Link>
                    <Link to={`/edit-post/${post.slug}`} className="text-ink-mid hover:text-ink transition-colors">Edit</Link>
                    <button
                      onClick={() => handleToggleStatus(post._id, post.status === 'active')}
                      className="text-ink-mid hover:text-ink transition-colors"
                    >
                      {post.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-ink-faint hover:text-ink transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PostManagement
```

- [ ] **Step 5: Replace `src/components/admin/UserManagement.jsx`**

```jsx
import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/admin'
import authService from '../../services/auth'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    fetchUsers()
    authService.getCurrentUser().then((user) => {
      if (user) { setCurrentUserId(user._id); setIsSuperAdmin(user.role === 'superadmin') }
    }).catch((err) => console.error('Failed to get current user', err))
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllUsers()
      setUsers(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch users', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to ${newRole}?`)) return
    try { await adminService.updateUserRole(userId, newRole); await fetchUsers() }
    catch (err) { console.error('Failed to update user role', err) }
  }

  const handleBlockUser = async (userId) => {
    try { await adminService.blockUser(userId); await fetchUsers() }
    catch (err) { console.error('Failed to block user', err) }
  }

  const handleUnblockUser = async (userId) => {
    try { await adminService.unblockUser(userId); await fetchUsers() }
    catch (err) { console.error('Failed to unblock user', err) }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    try { await adminService.deleteUser(userId); await fetchUsers() }
    catch (err) { console.error('Failed to delete user', err) }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-rule border-t-ink rounded-full animate-spin" />
    </div>
  )
  if (error) return <div className="p-6 border border-rule font-sans text-sm text-ink-mid">{error}</div>

  return (
    <div className="p-6">
      <div className="border-b-2 border-ink pb-4 mb-8">
        <h2 className="font-serif text-xl font-bold text-ink">User Management</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-rule">
              {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-sans text-[9px] font-medium tracking-[0.16em] uppercase text-ink-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-sans text-sm text-ink-faint">No users found</td>
              </tr>
            ) : users.map((user) => {
              const isSelf = user._id === currentUserId
              const displayName = user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username

              return (
                <tr key={user.id || user._id} className="border-b border-rule hover:bg-paper-dark transition-colors">
                  <td className="px-4 py-4 font-sans text-sm text-ink whitespace-nowrap">{displayName}</td>
                  <td className="px-4 py-4 font-sans text-sm text-ink-mid">{user.email}</td>
                  <td className="px-4 py-4">
                    {isSelf ? (
                      <span className="font-sans text-[9px] font-medium tracking-[0.14em] uppercase px-2 py-1 border border-rule text-ink-mid">
                        {user.role} (you)
                      </span>
                    ) : isSuperAdmin ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="font-sans text-[10px] tracking-wider uppercase bg-paper-white border border-rule text-ink-mid px-2 py-1 focus:outline-none focus:border-ink cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    ) : (
                      <span className="font-sans text-[9px] font-medium tracking-[0.14em] uppercase px-2 py-1 border border-rule text-ink-mid">
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-sans text-[9px] font-medium tracking-[0.14em] uppercase px-2 py-1 border border-rule text-ink-mid">
                      {user.status === 'blocked' ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-4 font-sans text-[10px] font-medium tracking-wider uppercase">
                      {user.status === 'blocked' ? (
                        <button onClick={() => handleUnblockUser(user._id)} className="text-ink-mid hover:text-ink transition-colors">Unblock</button>
                      ) : (
                        <button
                          onClick={() => !isSelf && handleBlockUser(user._id)}
                          disabled={isSelf}
                          className={isSelf ? 'text-ink-faint cursor-not-allowed' : 'text-ink-mid hover:text-ink transition-colors'}
                        >
                          Block
                        </button>
                      )}
                      <button
                        onClick={() => !isSelf && handleDeleteUser(user._id)}
                        disabled={isSelf}
                        className={isSelf ? 'text-ink-faint cursor-not-allowed' : 'text-ink-faint hover:text-ink transition-colors'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement
```

- [ ] **Step 6: Verify**

Navigate to `/admin` (as an admin user).
Expected: Ink sidebar with tracked uppercase nav, stat cards in rule-gapped grid on paper-white bg, tables with ink section heading + rule column headers + rule row dividers. No indigo/purple/green color anywhere.

- [ ] **Step 7: Commit**

```bash
git add src/components/AdminLayout.jsx src/components/admin/Sidebar.jsx src/components/admin/Dashboard.jsx src/components/admin/PostManagement.jsx src/components/admin/UserManagement.jsx
git commit -m "feat: redesign Admin Panel with monochrome token styles"
```

---

## Self-Review

**Spec coverage:**
- ✅ CSS design tokens — Task 1 (`index.css` + `tailwind.config.cjs`)
- ✅ Dark mode — Task 3 (localStorage toggle, `.dark` class on `<html>`, variable flip)
- ✅ Mobile responsiveness — all grids use `sm:` / `lg:` breakpoints; 44px min touch targets; hamburger drawer
- ✅ Libre Baskerville + Source Sans 3 — Task 1 Google Fonts import, Tailwind `font-serif` / `font-sans`
- ✅ Ink banner hero — Task 6 (`bg-ink` section with fluid `hero-title`)
- ✅ 3-col responsive card grid — Tasks 5, 6, 7 (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- ✅ Post detail: ink header, drop cap, blockquote, Arabic block — Task 8
- ✅ Comments — Task 9
- ✅ Login / Signup — Task 10
- ✅ Admin panel — Task 11
- ✅ Footer — Task 4
- ✅ PostForm/RTE — explicitly out of scope, not touched

**Placeholder scan:** No TBDs, TODOs, or "similar to Task N" patterns found.

**Token consistency:** All 11 tasks use the same 7 semantic color tokens (`bg-ink`, `text-ink`, `text-ink-mid`, `text-ink-faint`, `bg-paper`, `bg-paper-dark`, `bg-paper-white`, `border-rule`) and 2 font tokens (`font-serif`, `font-sans`) as defined in Task 1's `tailwind.config.cjs`.
