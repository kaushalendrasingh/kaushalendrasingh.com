import type { Dispatch, SetStateAction } from 'react'

interface ProjectFiltersProps {
  tags?: string[]
  value: string
  onChange: Dispatch<SetStateAction<string>>
  isLoading?: boolean
}

export default function ProjectFilters({ tags, value, onChange, isLoading }: ProjectFiltersProps) {
  const buttons = tags ?? []

  return (
    <aside className="rounded-3xl border border-zinc-800/70 bg-zinc-900/50 p-5 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Filter</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Project tags</h3>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={isLoading}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
            value === ''
              ? 'border-brand/60 bg-brand/20 text-brand shadow-glow'
              : 'border-zinc-700/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:text-white'
          } ${isLoading ? 'opacity-60' : ''}`}
        >
          All work
        </button>
        {buttons.map((tag) => {
          const active = value === tag
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(active ? '' : tag)}
              disabled={isLoading}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-brand/60 bg-brand/20 text-brand shadow-glow'
                  : 'border-zinc-700/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-500 hover:text-white'
              } ${isLoading ? 'opacity-60' : ''}`}
            >
              #{tag}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
