export default function Footer() {
  return (
    <footer id="contact" className="py-12 text-center text-zinc-400">
      Built with <span className="text-brand">React</span> + <span className="text-brand">FastAPI</span> · © {new Date().getFullYear()} Kaushalendra Singh
    </footer>
  )
}
