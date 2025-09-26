import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { api } from '../lib/api'
import type { Profile, Project } from '../types'
import { resolveAssetUrl, isVideoAsset } from '../lib/media'

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const id = Number(projectId)
  const invalidId = !Number.isFinite(id) || id <= 0

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data,
  })

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => (await api.get(`/projects/${id}`)).data,
    enabled: !invalidId,
  })

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(31,41,55,0.45),_rgba(12,10,16,0))]" />
      <Navbar profile={profile} />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28">
        <Link to="/projects" className="text-sm text-zinc-400 transition hover:text-white">
          ← Back to projects
        </Link>

        {invalidId && (
          <div className="mt-10 rounded-3xl border border-red-500/40 bg-red-500/10 p-10 text-center text-sm text-red-200">
            Invalid project reference.
          </div>
        )}

        {!invalidId && isLoading && (
          <div className="mt-10 rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-10 text-center text-sm text-zinc-400">
            Loading project…
          </div>
        )}

        {!invalidId && isError && (
          <div className="mt-10 rounded-3xl border border-red-500/40 bg-red-500/10 p-10 text-center text-sm text-red-200">
            Could not load project. Try again later.
          </div>
        )}

        {project && !invalidId && (
          <article className="mt-10 space-y-10">
            <header>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Project</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {project.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                {project.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-brand/60 bg-brand/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
                    Featured
                  </span>
                )}
                <span>{new Date(project.created_at).toLocaleString(undefined, { dateStyle: 'medium' })}</span>
              </div>
            </header>

            {project.cover_image_url && (
              <div className="overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-900/60">
                <img
                  src={resolveAssetUrl(project.cover_image_url)}
                  alt={project.title}
                  className="w-full object-cover"
                />
              </div>
            )}

            <section className="grid gap-6 md:grid-cols-[2fr,1fr]">
              <div>
                <h2 className="text-xl font-semibold text-white">Overview</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                  {project.description}
                </p>
              </div>
              <aside className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 text-sm text-zinc-300">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Tech stack</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.tech_stack?.map((item) => (
                      <span key={item} className="rounded-full border border-zinc-700/70 px-3 py-1 text-xs text-zinc-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-zinc-700/70 px-3 py-2 text-xs text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                    >
                      View live demo
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-zinc-700/70 px-3 py-2 text-xs text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                    >
                      View source code
                    </a>
                  )}
                </div>
              </aside>
            </section>

            {project.images && project.images.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white">Gallery</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {project.images.map((asset) => {
                    const url = resolveAssetUrl(asset)
                    if (!url) return null
                    const video = isVideoAsset(asset)
                    return (
                      <figure
                        key={asset}
                        className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/60"
                      >
                        {video ? (
                          <video src={url} controls className="h-full w-full object-cover" />
                        ) : (
                          <img src={url} alt={project.title} className="h-full w-full object-cover" />
                        )}
                      </figure>
                    )
                  })}
                </div>
              </section>
            )}
          </article>
        )}
      </main>
      <Footer profile={profile} />
    </div>
  )
}
