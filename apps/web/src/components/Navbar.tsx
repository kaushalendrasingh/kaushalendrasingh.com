import type { JSX } from 'react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Profile } from '../types'
import { GitHubIcon, LinkedInIcon } from './icons'

type NavbarProps = {
  profile?: Profile
}

export default function Navbar({ profile }: NavbarProps) {
  const { pathname } = useLocation()
  const isDark = true
  const [showThemeModal, setShowThemeModal] = useState(false)

  const LinkItem = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg transition hover:bg-zinc-800/90 ${pathname === to ? 'bg-zinc-800/60 text-white' : 'text-zinc-300'}`}
    >
      {label}
    </Link>
  )

  const social = [
    profile?.github && { href: profile.github, label: 'GitHub', icon: <GitHubIcon /> },
    profile?.linkedin && { href: profile.linkedin, label: 'LinkedIn', icon: <LinkedInIcon /> },
  ].filter(Boolean) as { href: string; label: string; icon: JSX.Element }[]

  return (
    <nav className="fixed top-0 left-0 right-0 backdrop-blur-lg bg-zinc-950/70 border-b border-zinc-800/60 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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
        <div className="flex items-center gap-2">
          <LinkItem to="/" label="Home" />
          <a href="#projects" className="px-3 py-2 rounded-lg text-zinc-300 transition hover:bg-zinc-800/90">
            Projects
          </a>
          <a href="#contact" className="px-3 py-2 rounded-lg text-zinc-300 transition hover:bg-zinc-800/90">
            Contact
          </a>
          <LinkItem to="/admin" label="Admin" />
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/70 p-1 text-xs font-medium text-zinc-300">
            <button
              type="button"
              className={`rounded-full px-3 py-1 transition ${isDark ? 'bg-brand text-zinc-950 shadow-glow' : 'hover:text-white'}`}
              aria-pressed={isDark}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setShowThemeModal(true)}
              className="rounded-full px-3 py-1 transition hover:text-white"
            >
              Light
            </button>
          </div>
          {social.length > 0 && (
            <span className="mx-1 h-6 w-px bg-zinc-800 hidden sm:block" aria-hidden />
          )}
          {social.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/70 text-zinc-300 hover:text-white hover:border-zinc-500 transition"
              aria-label={item.label}
            >
              {item.icon}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setShowThemeModal(true)}
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700/70 text-zinc-300 hover:text-white hover:border-zinc-500 transition"
            aria-label="Switch theme"
          >
            🌙
          </button>
        </div>
      </div>
      {showThemeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 px-6 backdrop-blur">
          <div className="max-w-sm rounded-3xl border border-zinc-800/70 bg-zinc-900/80 p-8 text-center shadow-[0_40px_70px_rgba(0,0,0,0.45)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/20 text-2xl text-brand">
              ⚡
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-white">Welcome to the Dark Side</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Real builders ship after midnight. Light mode is a myth told by tired keyboards. Stay luminous in the shadows.
            </p>
            <button
              type="button"
              onClick={() => setShowThemeModal(false)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-zinc-950 shadow-glow transition hover:shadow-glow"
            >
              Back to building
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
