import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import ProjectCard from './ProjectCard'
import { useState } from 'react'

export default function ProjectGrid() {
  const [filter, setFilter] = useState<string>('')
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await api.get('/tags')).data
  })
  const { data: projects } = useQuery({
    queryKey: ['projects', filter],
    queryFn: async () => (await api.get('/projects', { params: { tag: filter || undefined } })).data
  })

  return (
    <section id="projects" className="py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <div className="flex items-center gap-2">
          <select
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All tags</option>
            {tags?.map((t: string) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((p: any) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  )
}
