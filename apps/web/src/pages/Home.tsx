import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import ProfileCard from '../components/ProfileCard'
import ProjectGrid from '../components/ProjectGrid'
import Footer from '../components/Footer'
import ProjectFilters from '../components/ProjectFilters'
import { api } from '../lib/api'
import type { Profile } from '../types'

export default function Home() {
  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data,
  })
  const { data: tags, isLoading: tagsLoading } = useQuery<string[]>({
    queryKey: ['tags'],
    queryFn: async () => (await api.get('/tags')).data,
  })
  const [projectFilter, setProjectFilter] = useState('')

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(31,41,55,0.5),_rgba(12,10,16,0))]" />
      <Navbar profile={profile} />
      <main className="mx-auto max-w-6xl px-4">
        <Hero profile={profile} />
        <section id="projects">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-white">Selected Projects</h2>
            <p className="max-w-2xl text-sm text-zinc-400">
              A snapshot of products and experiments I’ve shipped. Filter by speciality to explore the work.
            </p>
          </div>
        </section>
        <div className="grid gap-6 md:grid-cols-3 mt-4">
          <div className="md:col-span-1 space-y-6">
            <ProfileCard profile={profile} />
            <ProjectFilters tags={tags} value={projectFilter} onChange={setProjectFilter} isLoading={tagsLoading} />
          </div>
          <div className="md:col-span-2">
            <ProjectGrid filter={projectFilter} />
          </div>
        </div>
        <Footer profile={profile} />
      </main>
    </div>
  )
}
