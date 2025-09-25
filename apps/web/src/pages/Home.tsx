import { useQuery } from '@tanstack/react-query'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import ProfileCard from '../components/ProfileCard'
import ProjectGrid from '../components/ProjectGrid'
import Footer from '../components/Footer'
import { api } from '../lib/api'
import type { Profile } from '../types'

export default function Home() {
  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data,
  })

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(31,41,55,0.5),_rgba(12,10,16,0))]" />
      <Navbar profile={profile} />
      <main className="mx-auto max-w-6xl px-4">
        <Hero profile={profile} />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <ProfileCard profile={profile} />
          </div>
          <div className="md:col-span-2">
            <ProjectGrid />
          </div>
        </div>
        <Footer profile={profile} />
      </main>
    </div>
  )
}
