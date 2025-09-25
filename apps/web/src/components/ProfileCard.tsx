import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function ProfileCard() {
  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data
  })

  if (!data) return null

  return (
    <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40">
      <div className="flex items-start gap-4">
        {data.avatar_url && <img src={data.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover" />}
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{data.name}</h3>
          <p className="text-zinc-400">{data.headline}</p>
          <p className="mt-3 text-zinc-300">{data.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.skills?.map((s: string) => (
              <span key={s} className="text-xs px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">{s}</span>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            {data.resume_url && <a id="resume" href={data.resume_url} target="_blank" className="text-brand underline">Resume</a>}
            {data.github && <a href={data.github} target="_blank" className="hover:underline">GitHub</a>}
            {data.linkedin && <a href={data.linkedin} target="_blank" className="hover:underline">LinkedIn</a>}
            {data.twitter && <a href={data.twitter} target="_blank" className="hover:underline">Twitter</a>}
            {data.website && <a href={data.website} target="_blank" className="hover:underline">Website</a>}
          </div>
        </div>
      </div>
    </div>
  )
}
