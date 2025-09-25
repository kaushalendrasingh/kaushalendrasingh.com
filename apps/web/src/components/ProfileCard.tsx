import type { JSX } from 'react'
import type { Profile } from '../types'
import { ExternalLinkIcon, GitHubIcon, LinkedInIcon, LocationIcon, WorkIcon } from './icons'

type ProfileCardProps = {
  profile?: Profile
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  if (!profile) return null

  const links = [
    profile.github && { href: profile.github, label: 'GitHub', icon: <GitHubIcon className="h-4 w-4" /> },
    profile.linkedin && { href: profile.linkedin, label: 'LinkedIn', icon: <LinkedInIcon className="h-4 w-4" /> },
    profile.website && { href: profile.website, label: 'Website', icon: <ExternalLinkIcon className="h-4 w-4" /> },
    profile.twitter && { href: profile.twitter, label: 'Twitter', icon: <ExternalLinkIcon className="h-4 w-4" /> },
  ].filter(Boolean) as { href: string; label: string; icon: JSX.Element }[]

  return (
    <aside className="rounded-3xl border border-zinc-800/70 bg-zinc-900/50 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={`${profile.name} avatar`}
            className="h-20 w-20 rounded-2xl object-cover ring-2 ring-brand/30"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/20 text-xl font-semibold text-brand">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-semibold tracking-tight text-white">{profile.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">{profile.headline}</p>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-zinc-300 text-center sm:text-left">{profile.bio}</p>
      <dl className="mt-5 grid grid-cols-1 gap-3 text-sm text-zinc-300">
        {profile.location && (
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
            <LocationIcon className="h-4 w-4" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Based in</dt>
              <dd className="font-medium text-zinc-200">{profile.location}</dd>
            </div>
          </div>
        )}
        {profile.years_experience != null && (
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
            <WorkIcon className="h-4 w-4" />
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Experience</dt>
              <dd className="font-medium text-zinc-200">{profile.years_experience}+ years shipping</dd>
            </div>
          </div>
        )}
      </dl>
      {profile.skills?.length > 0 && (
        <div className="mt-5">
          <p className="text-center text-xs uppercase tracking-wide text-zinc-500 sm:text-left">Core Stack</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/70 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </div>
      )}
    </aside>
  )
}
