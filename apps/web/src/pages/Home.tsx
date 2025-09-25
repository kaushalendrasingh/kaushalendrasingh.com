import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProfileCard from '../components/ProfileCard'
import ProjectGrid from '../components/ProjectGrid'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4">
        <Hero />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <ProfileCard />
          </div>
          <div className="md:col-span-2">
            <ProjectGrid />
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
