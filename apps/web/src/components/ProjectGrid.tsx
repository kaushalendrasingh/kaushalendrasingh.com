import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api } from '../lib/api'
import type { Project } from '../types'
import ProjectCard from './ProjectCard'

const skeletons = Array.from({ length: 3 })

type Props = {
  filter: string
}

export default function ProjectGrid({ filter }: Props) {
  const {
    data: projects,
    isLoading,
  } = useQuery<Project[]>({
    queryKey: ['projects', filter],
    queryFn: async () => (await api.get('/projects', { params: { tag: filter || undefined } })).data,
  })

  const sortedProjects = useMemo(() => {
    if (!projects) return [] as Project[]
    return [...projects].sort((a, b) => {
      if (a.featured === b.featured) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return a.featured ? -1 : 1
    })
  }, [projects])

  return (
    <div className="pb-16">
      <div className="mt-8 md:mt-0">
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

        {!isLoading && sortedProjects.length === 0 && (
          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-10 text-center text-sm text-zinc-400">
            Nothing here yet — add your first project via the admin panel.
          </div>
        )}

        {sortedProjects.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
