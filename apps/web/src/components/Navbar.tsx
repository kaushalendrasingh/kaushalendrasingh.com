import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Profile } from '../types'
import { CloseIcon, GitHubIcon, LinkedInIcon, MenuIcon, MoonIcon, SunIcon } from './icons'

type NavbarProps = {
  profile?: Profile
}

export default function Navbar({ profile }: NavbarProps) {
  const { pathname } = useLocation()
  const isDark = true
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const trapToDarkSide = () => {
    setShowThemeModal(true)
    setMobileMenuOpen(false)
  }

  const LinkItem = ({
    to,
    label,
    className = '',
    onNavigate,
  }: {
    to: string
    label: string
    className?: string
    onNavigate?: () => void
  }) => (
    <Link
      to={to}
      className={`rounded-lg px-3 py-2 transition hover:bg-zinc-800/90 ${
        pathname === to ? 'bg-zinc-800/60 text-white' : 'text-zinc-300'
      } ${className}`}
      onClick={onNavigate}
    >
      {label}
    </Link>
  )

  const social = [
    profile?.github && { href: profile.github, label: 'GitHub', icon: <GitHubIcon /> },
    profile?.linkedin && { href: profile.linkedin, label: 'LinkedIn', icon: <LinkedInIcon /> },
  ].filter(Boolean) as { href: string; label: string; icon: JSX.Element }[]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-lg">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-semibold tracking-tight text-lg">
            Kaushalendra<span className="text-brand">Singh</span>
          </Link>
          {profile?.headline && (
            <span className="hidden sm:inline rounded-full bg-zinc-800/60 border border-zinc-700/60 text-xs text-zinc-300 px-3 py-1">
              {profile.headline}
            </span>
          )}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <LinkItem to="/" label="Home" />
          <a href="#projects" className="rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-zinc-800/90">
            Projects
          </a>
          <a href="#contact" className="rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-zinc-800/90">
            Contact
          </a>
          <LinkItem to="/admin" label="Admin" />
          <div className="hidden items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/70 p-1 text-xs font-medium text-zinc-300 lg:flex">
            <button
              type="button"
              className={`flex items-center gap-2 rounded-full px-3 py-1 transition ${
                isDark ? 'bg-brand text-zinc-950 shadow-glow' : 'hover:text-white'
              }`}
              aria-pressed={isDark}
            >
              <MoonIcon className="h-3.5 w-3.5" />
              Dark
            </button>
            <button
              type="button"
              onClick={trapToDarkSide}
              className="flex items-center gap-2 rounded-full px-3 py-1 transition hover:text-white"
            >
              <SunIcon className="h-3.5 w-3.5" />
              Light
            </button>
          </div>
          {social.length > 0 && (
            <span className="mx-1 hidden h-6 w-px bg-zinc-800 lg:block" aria-hidden />
          )}
          {social.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/70 text-zinc-300 transition hover:border-zinc-500 hover:text-white lg:inline-flex"
              aria-label={item.label}
            >
              {item.icon}
            </a>
          ))}
          <button
            type="button"
            onClick={trapToDarkSide}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/70 text-zinc-300 transition hover:border-zinc-500 hover:text-white lg:hidden"
            aria-label="Switch theme"
          >
            <SunIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={trapToDarkSide}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/70 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            aria-label="Switch theme"
          >
            <SunIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/70 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 z-40 px-3 pb-4 md:hidden">
          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/95 p-4 shadow-lg shadow-black/30">
            <div className="flex flex-col gap-2">
              <LinkItem
                to="/"
                label="Home"
                className="w-full text-left text-sm"
                onNavigate={() => setMobileMenuOpen(false)}
              />
              <a
                href="#projects"
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </a>
              <a
                href="#contact"
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <LinkItem
                to="/admin"
                label="Admin"
                className="w-full text-left text-sm"
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {social.map((item) => (
                <a
                  key={`${item.href}-mobile`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700/70 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={trapToDarkSide}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700/70 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              <SunIcon className="h-4 w-4" />
              Light mode?
            </button>
          </div>
        </div>
      )}
      {showThemeModal && (
        <div className="fixed inset-0 z-[70] bg-zinc-950/90 px-6 py-10 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center">
            <div className="w-full rounded-3xl border border-zinc-800/70 bg-zinc-900/80 p-8 text-center shadow-[0_40px_70px_rgba(0,0,0,0.45)]">
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700/70 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                aria-label="Close"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
              <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 text-3xl text-brand">
                ⚡
              </div>
              <h3 className="mt-6 text-3xl font-semibold text-white">Welcome to the Dark Side</h3>
              <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                Real builders ship after midnight. Light mode exists only in legends and outdated slide decks. Embrace the glow of monitors and keep crafting brilliance in the shadows.
              </p>
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-zinc-950 shadow-glow transition hover:shadow-glow"
              >
                Back to building
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
