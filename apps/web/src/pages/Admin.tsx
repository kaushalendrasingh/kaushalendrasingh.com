import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'

export default function Admin() {
  const qc = useQueryClient()
  const [apiKey, setApiKey] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', tech_stack: '', tags: '',
    github_url: '', live_url: '', cover_image_url: '', featured: false
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        tech_stack: form.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        images: []
      }
      const res = await api.post('/projects', payload, { headers: { 'X-API-Key': apiKey }})
      return res.data
    },
    onSuccess: () => {
      setForm({ title: '', description: '', tech_stack: '', tags: '', github_url: '', live_url: '', cover_image_url: '', featured: false })
      qc.invalidateQueries({ queryKey: ['projects'] })
      alert('Project created!')
    }
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-28">
        <h1 className="text-3xl font-semibold">Admin — Add Project</h1>
        <p className="text-zinc-400 mt-2">Provide your API key to create projects.</p>

        <div className="mt-6 grid gap-4">
          <input className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2" placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <input className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2" rows={4} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2" placeholder="Tech stack (comma separated)" value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} />
          <input className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <input className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2" placeholder="GitHub URL" value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} />
          <input className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2" placeholder="Live URL" value={form.live_url} onChange={e => setForm({ ...form, live_url: e.target.value })} />
          <input className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2" placeholder="Cover image URL" value={form.cover_image_url} onChange={e => setForm({ ...form, cover_image_url: e.target.value })} />
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
            <span>Featured</span>
          </label>
          <button onClick={() => mutation.mutate()} className="px-4 py-2 rounded-2xl bg-brand hover:shadow-glow disabled:opacity-50" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
