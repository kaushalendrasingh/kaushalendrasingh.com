import { useMutation, useQuery } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { api } from '../lib/api'
import type { Profile } from '../types'

const EMAIL = 'kaushcodes@gmail.com'

type FormState = {
  name: string
  email: string
  company: string
  message: string
  attachment: File | null
}

const initialForm: FormState = {
  name: '',
  email: '',
  company: '',
  message: '',
  attachment: null,
}

export default function Contact() {
  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data,
  })

  const [form, setForm] = useState<FormState>(initialForm)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const data = new FormData()
      data.append('name', form.name)
      data.append('email', form.email)
      if (form.company) data.append('company', form.company)
      data.append('message', form.message)
      if (form.attachment) data.append('attachment', form.attachment)
      const res = await api.post('/inquiries', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: () => {
      setStatus('success')
      setErrorMsg(null)
      setForm(initialForm)
    },
    onError: (error: any) => {
      setStatus('error')
      setErrorMsg(error?.response?.data?.detail ?? 'Failed to send inquiry. Please try again later.')
    },
  })

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    setStatus('idle')
    setErrorMsg(null)
    mutation.mutate()
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(circle_at_top,_rgba(31,41,55,0.45),_rgba(12,10,16,0))]" />
      <Navbar profile={profile} />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28">
        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Let’s collaborate</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Need a hand with your next build?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
            Drop your details, share a bit about the project, or attach any supporting docs. I’ll be back with
            ideas fast.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-200">
            <span className="text-zinc-400">Email</span>
            <a href={`mailto:${EMAIL}`} className="font-medium text-white hover:underline">
              {EMAIL}
            </a>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-zinc-800/70 bg-zinc-900/60 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-xs uppercase tracking-wide text-zinc-500">
                  Your name
                </label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-xs uppercase tracking-wide text-zinc-500">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="company" className="text-xs uppercase tracking-wide text-zinc-500">
                Company / Organisation (optional)
              </label>
              <input
                id="company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Acme Inc."
                autoComplete="organization"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="message" className="text-xs uppercase tracking-wide text-zinc-500">
                Project details
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="What are you building? Timelines? Goals?"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="attachment" className="text-xs uppercase tracking-wide text-zinc-500">
                Attach brief / spec (optional)
              </label>
              <input
                id="attachment"
                type="file"
                onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] ?? null })}
                className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
              />
              <p className="text-xs text-zinc-500">PDF, DOCX, or ZIP up to a few MB.</p>
            </div>

            {status === 'success' && (
              <div className="rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                Thanks! Your inquiry is in. I’ll reach out shortly.
              </div>
            )}
            {status === 'error' && errorMsg && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-zinc-950 shadow-glow transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? 'Sending…' : 'Send inquiry'}
              </button>
              <span className="text-xs text-zinc-500">
                Prefer email? Reach me directly at{' '}
                <a href={`mailto:${EMAIL}`} className="text-zinc-300 underline">
                  {EMAIL}
                </a>
              </span>
            </div>
          </form>
        </section>
      </main>
      <Footer profile={profile} />
    </div>
  )
}
