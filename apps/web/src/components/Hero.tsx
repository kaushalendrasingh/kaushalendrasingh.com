import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Profile } from '../types'

type HeroProps = {
  profile?: Profile
}

export default function Hero({ profile }: HeroProps) {
  const primaryCta = profile?.resume_url
  const socials = [
    profile?.github && { label: 'GitHub', href: profile.github },
    profile?.linkedin && { label: 'LinkedIn', href: profile.linkedin },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <section className="relative pt-32 pb-20">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/40 blur-3xl opacity-40" />
        <div className="absolute right-10 top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl opacity-40" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-zinc-400">
          {profile?.location ? `${profile.location} · ` : ''}Full-stack Engineering
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Hey, I’m {profile?.name ?? 'Kaushalendra'} — building calm, polished products end-to-end.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
          {profile?.bio ?? 'Full-stack developer focused on delightful experiences, performance, and shipping quickly with confidence.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-glow transition hover:shadow-glow"
          >
            View Latest Work
          </Link>
          {primaryCta && (
            <a
              href={primaryCta}
              id="resume"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              Download Resume
            </a>
          )}
          {socials.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 px-4 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-zinc-300">
          {profile?.skills?.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-zinc-800/80 bg-zinc-900/60 px-4 py-1 text-xs uppercase tracking-wide text-zinc-400"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
