import type { JSX } from 'react'
import type { Profile } from '../types'
import { GitHubIcon, LinkedInIcon } from './icons'

type FooterProps = {
  profile?: Profile
}

export default function Footer({ profile }: FooterProps) {
  const socials = [
    profile?.github && { href: profile.github, label: 'GitHub', icon: <GitHubIcon className="h-4 w-4" /> },
    profile?.linkedin && { href: profile.linkedin, label: 'LinkedIn', icon: <LinkedInIcon className="h-4 w-4" /> },
  ].filter(Boolean) as { href: string; label: string; icon: JSX.Element }[]

  return (
    <footer id="contact" className="py-16">
      <div className="rounded-3xl border border-zinc-800/70 bg-zinc-900/50 px-6 py-10 text-center shadow-inner shadow-black/40 sm:px-10">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Let’s build together</p>
        <h3 className="mt-4 text-2xl font-semibold text-white">Open to product engineering, consulting, and collaborations.</h3>
        {socials.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {socials.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/70 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        )}
        <p className="mt-8 text-xs text-zinc-500">
          Built with <span className="text-brand">React</span> + <span className="text-brand">FastAPI</span> • © {new Date().getFullYear()} Kaushalendra Singh
        </p>
      </div>
    </footer>
  )
}
