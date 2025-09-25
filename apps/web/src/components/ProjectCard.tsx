type Props = {
  project: any
}

export default function ProjectCard({ project }: Props) {
  return (
    <a href={project.live_url || project.github_url || '#'} target="_blank" className="group rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/40 hover:border-zinc-700">
      {project.cover_image_url && (
        <img src={project.cover_image_url} alt={project.title} className="h-44 w-full object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold">{project.title}</h4>
          {project.featured && <span className="text-xs px-2 py-1 rounded-full bg-brand/20 border border-brand/40 text-brand">Featured</span>}
        </div>
        <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{project.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags?.slice(0, 5).map((t: string) => (
            <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">{t}</span>
          ))}
        </div>
      </div>
    </a>
  )
}
