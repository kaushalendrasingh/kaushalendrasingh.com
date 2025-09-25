import type { Project } from '../types'
import { ExternalLinkIcon, GitHubIcon } from './icons'

type Props = {
  project: Project
}

export default function ProjectCard({ project }: Props) {
  const primaryLink = project.live_url || project.github_url
  const linkLabel = project.live_url ? 'Live demo' : project.github_url ? 'Source' : null

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-900/40 shadow-md shadow-black/10 transition hover:border-zinc-600/80 hover:shadow-black/30">
      {project.cover_image_url && (
        <div className="overflow-hidden">
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-semibold text-white">{project.title}</h4>
            {project.featured && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-brand/50 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
                Featured
              </span>
            )}
          </div>
          {primaryLink && (
            <a
              href={primaryLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/60 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              {linkLabel}
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          )}
        </div>
        <p className="line-clamp-3 text-sm text-zinc-300">{project.description}</p>
        {project.tech_stack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 5).map((item) => (
              <span
                key={item}
                className="rounded-full border border-zinc-700/70 bg-zinc-900/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400"
              >
                {item}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-zinc-400">
          <div className="flex flex-wrap gap-1.5">
            {project.tags?.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-800/70 px-2 py-1">
                #{tag}
              </span>
            ))}
          </div>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/70 px-2 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              <GitHubIcon className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
