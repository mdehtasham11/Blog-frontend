import React, { useState, useEffect } from 'react'
import { Container, Logo, Logoutbtn } from '../index'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  const isAdmin = userData?.role === "admin" || userData?.role === "superadmin"

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const navItems = [
    { name: 'Home', slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Articles", slug: "/all-posts", active: true },
    { name: "Write", slug: "/add-post", active: authStatus && isAdmin },
    { name: "Admin Panel", slug: "/admin", active: authStatus && isAdmin },
  ]

  return (
    <header className="sticky top-0 z-50 bg-ink border-b border-ink-mid">
      <Container>
        <nav className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link to="/" className="font-serif text-xl font-bold text-paper tracking-tight hover:text-ink-faint transition-colors">
            Islam &amp; Science
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navItems.filter(i => i.active).map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.slug)}
                  className={`px-4 py-1.5 text-sm font-sans uppercase tracking-widest transition-colors min-h-[44px] ${
                    location.pathname === item.slug
                      ? 'text-paper border-b border-paper'
                      : 'text-ink-faint hover:text-paper'
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
            {authStatus && (
              <li className="ml-2 pl-2 border-l border-ink-mid">
                <Logoutbtn />
              </li>
            )}
            {/* Dark mode toggle */}
            <li className="ml-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-ink-faint hover:text-paper transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </li>
          </ul>

          {/* Mobile: dark toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-ink-faint hover:text-paper transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-ink-faint hover:text-paper transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          <div className="md:hidden border-t border-ink-mid py-3">
            <ul className="flex flex-col">
              {navItems.filter(i => i.active).map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => { navigate(item.slug); setIsMenuOpen(false) }}
                    className={`block w-full text-left px-2 py-3 text-sm font-sans uppercase tracking-widest transition-colors ${
                      location.pathname === item.slug
                        ? 'text-paper'
                        : 'text-ink-faint hover:text-paper'
                    }`}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
              {authStatus && (
                <li className="pt-2 border-t border-ink-mid mt-2">
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
