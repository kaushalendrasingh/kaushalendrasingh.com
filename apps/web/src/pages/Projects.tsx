import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { api } from '../lib/api'
import type { Profile, Project } from '../types'
import { resolveAssetUrl, isVideoAsset } from '../lib/media'

export default function Projects() {
  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data,
  })

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects', 'list-screen'],
    queryFn: async () => (await api.get('/projects')).data,
  })

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(31,41,55,0.45),_rgba(12,10,16,0))]" />
      <Navbar profile={profile} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-28">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Work library</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Projects I’ve built end-to-end
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
            Browse deeper break-downs with additional media, prototypes, and notes for each project.
          </p>
        </header>

        <section className="mt-12 grid gap-6">
          {isLoading && (
            <div className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
              Loading projects…
            </div>
          )}

          {!isLoading && projects?.length === 0 && (
            <div className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
              No projects published yet. Add one via the admin dashboard.
            </div>
          )}

          {projects?.map((project) => {
            const primaryMedia = project.images?.[0]
            const mediaUrl = resolveAssetUrl(primaryMedia ?? project.cover_image_url)
            const video = primaryMedia ? isVideoAsset(primaryMedia) : false

            return (
              <article
                key={project.id}
                className="overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-900/50 shadow shadow-black/20 transition hover:border-zinc-600/70"
              >
                {mediaUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-zinc-900/80">
                    {video ? (
                      <video src={mediaUrl} controls className="h-full w-full object-cover" />
                    ) : (
                      <img src={mediaUrl} alt={project.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    {project.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-brand/60 bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
                        Featured
                      </span>
                    )}
                    <span>{new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{project.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm text-zinc-300">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-zinc-500">
                    {project.tags?.map((tag) => (
                      <span key={tag} className="rounded-full bg-zinc-800/60 px-2 py-1">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-zinc-950 shadow-glow transition hover:shadow-glow"
                    >
                      View details
                    </Link>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-700/70 px-5 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                      >
                        Live demo
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-700/70 px-5 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                      >
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </main>
      <Footer profile={profile} />
    </div>
  )
}
