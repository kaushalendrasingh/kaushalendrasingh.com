import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const LinkItem = ({ to, label }: { to: string, label: string }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-xl hover:bg-zinc-800 ${pathname === to ? 'bg-zinc-800' : ''}`}
    >
      {label}
    </Link>
  )
  return (
    <nav className="fixed top-0 left-0 right-0 backdrop-blur bg-zinc-950/60 border-b border-zinc-800 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold">Kaushalendra<span className="text-brand">Singh</span></Link>
        <div className="flex items-center gap-2">
          <LinkItem to="/" label="Home" />
          <a href="#projects" className="px-3 py-2 rounded-xl hover:bg-zinc-800">Projects</a>
          <a href="#contact" className="px-3 py-2 rounded-xl hover:bg-zinc-800">Contact</a>
          <LinkItem to="/admin" label="Admin" />
        </div>
      </div>
    </nav>
  )
}
