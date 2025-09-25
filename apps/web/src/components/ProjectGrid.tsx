import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { api } from '../lib/api'
import type { Project } from '../types'
import ProjectCard from './ProjectCard'

const skeletons = Array.from({ length: 3 })

export default function ProjectGrid() {
  const [filter, setFilter] = useState<string>('')

  const { data: tags } = useQuery<string[]>({
    queryKey: ['tags'],
    queryFn: async () => (await api.get('/tags')).data,
  })

  const {
    data: projects,
    isLoading,
  } = useQuery<Project[]>({
    queryKey: ['projects', filter],
    queryFn: async () => (await api.get('/projects', { params: { tag: filter || undefined } })).data,
  })

  const [featured, others] = useMemo(() => {
    const list = projects ?? []
    return [
      list.filter((project) => project.featured),
      list.filter((project) => !project.featured),
    ]
  }, [projects])

  return (
    <section id="projects" className="py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white">Selected Projects</h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            A snapshot of products and experiments I’ve shipped. Filter by speciality to explore the work.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilter('')}
            className={`rounded-full border px-4 py-1.5 transition ${
              filter === ''
                ? 'border-brand/60 bg-brand/20 text-brand'
                : 'border-zinc-700/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:text-white'
            }`}
          >
            All work
          </button>
          {tags?.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag === filter ? '' : tag)}
              className={`rounded-full border px-4 py-1.5 transition ${
                filter === tag
                  ? 'border-brand/60 bg-brand/20 text-brand'
                  : 'border-zinc-700/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:text-white'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5">
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skeletons.map((_, idx) => (
              <div
                key={idx}
                className="h-64 animate-pulse rounded-3xl border border-zinc-800/60 bg-zinc-900/40"
              />
            ))}
          </div>
        )}

        {!isLoading && projects?.length === 0 && (
          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-10 text-center text-sm text-zinc-400">
            Nothing here yet — add your first project via the admin panel.
          </div>
        )}

        {featured.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {others.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
