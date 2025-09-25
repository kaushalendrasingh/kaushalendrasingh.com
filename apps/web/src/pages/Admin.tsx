import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { ExternalLinkIcon, GitHubIcon } from '../components/icons'
import { api } from '../lib/api'
import type { Profile, Project } from '../types'

const STORAGE_KEY = 'portfolio.admin.apiKey'

const blankProjectForm = {
  id: undefined as number | undefined,
  title: '',
  description: '',
  tech_stack: '',
  tags: '',
  github_url: '',
  live_url: '',
  cover_image_url: '',
  featured: false,
}

type ProjectFormState = typeof blankProjectForm

type ProfileFormState = {
  name: string
  headline: string
  bio: string
  location: string
  years_experience: string
  skills: string
  avatar_url: string
  resume_url: string
  github: string
  linkedin: string
  twitter: string
  website: string
}

const blankProfileForm: ProfileFormState = {
  name: '',
  headline: '',
  bio: '',
  location: '',
  years_experience: '',
  skills: '',
  avatar_url: '',
  resume_url: '',
  github: '',
  linkedin: '',
  twitter: '',
  website: '',
}

const splitComma = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const toCommaString = (items?: string[] | null) => (items && items.length ? items.join(', ') : '')

const requireKey = (apiKey: string) => {
  if (!apiKey) {
    alert('Provide your admin API key first (from API .env).')
    return false
  }
  return true
}

export default function Admin() {
  const qc = useQueryClient()
  const [apiKey, setApiKey] = useState('')
  const [activeTab, setActiveTab] = useState<'projects' | 'profile'>('projects')
  const [projectForm, setProjectForm] = useState<ProjectFormState>({ ...blankProjectForm })
  const [profileForm, setProfileForm] = useState<ProfileFormState>({ ...blankProfileForm })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) setApiKey(stored)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (apiKey) {
      window.localStorage.setItem(STORAGE_KEY, apiKey)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [apiKey])

  const { data: profile } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile')).data,
  })

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects', 'admin'],
    queryFn: async () => (await api.get('/projects')).data,
  })

  useEffect(() => {
    if (!profile) return
    setProfileForm({
      name: profile.name ?? '',
      headline: profile.headline ?? '',
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      years_experience: profile.years_experience?.toString() ?? '',
      skills: toCommaString(profile.skills),
      avatar_url: profile.avatar_url ?? '',
      resume_url: profile.resume_url ?? '',
      github: profile.github ?? '',
      linkedin: profile.linkedin ?? '',
      twitter: profile.twitter ?? '',
      website: profile.website ?? '',
    })
  }, [profile])

  const orderedProjects = useMemo(() => {
    if (!projects) return [] as Project[]
    return [...projects].sort((a, b) => {
      if (a.featured === b.featured) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return a.featured ? -1 : 1
    })
  }, [projects])

  const projectMutation = useMutation({
    mutationFn: async ({ mode, payload, id }: { mode: 'create' | 'update'; payload: any; id?: number }) => {
      const headers = { 'X-API-Key': apiKey }
      if (mode === 'create') {
        const { data } = await api.post('/projects', payload, { headers })
        return data as Project
      }
      if (!id) throw new Error('Missing project id for update')
      const { data } = await api.put(`/projects/${id}`, payload, { headers })
      return data as Project
    },
    onSuccess: (resp) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', 'admin'] })
      setProjectForm({ ...blankProjectForm })
      alert(`Project ${resp.title} saved!`)
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail ?? error.message ?? 'Failed to save project')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const headers = { 'X-API-Key': apiKey }
      await api.delete(`/projects/${id}`, { headers })
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', 'admin'] })
      alert('Project deleted')
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail ?? error.message ?? 'Failed to delete project')
    },
  })

  const profileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const headers = { 'X-API-Key': apiKey }
      const { data } = await api.put('/profile', payload, { headers })
      return data as Profile
    },
    onSuccess: (resp) => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      alert(`Profile for ${resp.name} updated!`)
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail ?? error.message ?? 'Failed to update profile')
    },
  })

  const handleProjectSubmit = () => {
    if (!requireKey(apiKey)) return
    const payload: Record<string, unknown> = {
      title: projectForm.title,
      description: projectForm.description,
      tech_stack: splitComma(projectForm.tech_stack),
      tags: splitComma(projectForm.tags),
      github_url: projectForm.github_url || null,
      live_url: projectForm.live_url || null,
      cover_image_url: projectForm.cover_image_url || null,
      featured: projectForm.featured,
    }

    if (!projectForm.id) {
      payload.images = []
    }

    const mode = projectForm.id ? 'update' : 'create'
    projectMutation.mutate({ mode, payload, id: projectForm.id })
  }

  const handleProfileSubmit = () => {
    if (!requireKey(apiKey)) return
    const years = Number(profileForm.years_experience)
    const payload = {
      name: profileForm.name,
      headline: profileForm.headline,
      bio: profileForm.bio,
      skills: splitComma(profileForm.skills),
      years_experience:
        profileForm.years_experience.trim() && Number.isFinite(years) ? years : null,
      location: profileForm.location || null,
      avatar_url: profileForm.avatar_url || null,
      resume_url: profileForm.resume_url || null,
      github: profileForm.github || null,
      linkedin: profileForm.linkedin || null,
      twitter: profileForm.twitter || null,
      website: profileForm.website || null,
    }

    profileMutation.mutate(payload)
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar profile={profile} />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28">
        <header className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Admin Dashboard</h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Manage the projects showcased on your portfolio and keep your profile details fresh.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-400">
              <p className="font-medium text-zinc-200">API Key</p>
              <input
                className="mt-2 w-72 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="X-API-Key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
              <p className="mt-2 text-[11px] text-zinc-500">Stored locally in your browser for convenience.</p>
            </div>
          </div>
          <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/60 p-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === 'projects' ? 'bg-brand text-zinc-950' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Projects
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === 'profile' ? 'bg-brand text-zinc-950' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Profile
            </button>
          </div>
        </header>

        {activeTab === 'projects' && (
          <section className="space-y-10">
            <div className="rounded-3xl border border-zinc-800/70 bg-zinc-900/50 p-8 shadow-lg shadow-black/20">
              <header className="mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {projectForm.id ? 'Edit project' : 'Add a new project'}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Showcase your latest work. Fill in the details below and hit save — instantly live on the site.
                </p>
              </header>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="Title"
                  value={projectForm.title}
                  onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })}
                />
                <input
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="Cover image URL"
                  value={projectForm.cover_image_url}
                  onChange={(event) =>
                    setProjectForm({ ...projectForm, cover_image_url: event.target.value })
                  }
                />
                <input
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="GitHub URL"
                  value={projectForm.github_url}
                  onChange={(event) => setProjectForm({ ...projectForm, github_url: event.target.value })}
                />
                <input
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="Live URL"
                  value={projectForm.live_url}
                  onChange={(event) => setProjectForm({ ...projectForm, live_url: event.target.value })}
                />
                <textarea
                  className="md:col-span-2 h-28 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="Description"
                  value={projectForm.description}
                  onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
                />
                <input
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="Tech stack (comma separated)"
                  value={projectForm.tech_stack}
                  onChange={(event) => setProjectForm({ ...projectForm, tech_stack: event.target.value })}
                />
                <input
                  className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="Tags (comma separated)"
                  value={projectForm.tags}
                  onChange={(event) => setProjectForm({ ...projectForm, tags: event.target.value })}
                />
                <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={(event) =>
                      setProjectForm({ ...projectForm, featured: event.target.checked })
                    }
                  />
                  <span>Feature on homepage</span>
                </label>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleProjectSubmit}
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-zinc-950 shadow-glow transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={projectMutation.isPending}
                >
                  {projectMutation.isPending ? 'Saving…' : projectForm.id ? 'Update project' : 'Create project'}
                </button>
                {projectForm.id && (
                  <button
                    type="button"
                    onClick={() => setProjectForm({ ...blankProjectForm })}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {orderedProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-3xl border border-zinc-800/70 bg-zinc-900/50 p-6 shadow shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-zinc-500">
                        {project.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-zinc-800/80 px-2 py-1 text-zinc-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {project.featured && (
                      <span className="rounded-full border border-brand/60 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-zinc-400 line-clamp-3">{project.description}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/70 px-2 py-1 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                      >
                        <GitHubIcon className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/70 px-2 py-1 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                        Live
                      </a>
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setProjectForm({
                          id: project.id,
                          title: project.title,
                          description: project.description,
                          tech_stack: toCommaString(project.tech_stack),
                          tags: toCommaString(project.tags),
                          github_url: project.github_url ?? '',
                          live_url: project.live_url ?? '',
                          cover_image_url: project.cover_image_url ?? '',
                          featured: project.featured,
                        })
                      }
                      className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!requireKey(apiKey)) return
                        if (!window.confirm('Delete this project?')) return
                        deleteMutation.mutate(project.id)
                      }}
                      className="rounded-xl border border-red-500/60 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-400 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {orderedProjects.length === 0 && (
                <div className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
                  No projects yet — add one above.
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="rounded-3xl border border-zinc-800/70 bg-zinc-900/50 p-8 shadow-lg shadow-black/20">
            <header className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Profile</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Update the hero info, links, and skills that appear across the site.
              </p>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Name"
                value={profileForm.name}
                onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Headline"
                value={profileForm.headline}
                onChange={(event) => setProfileForm({ ...profileForm, headline: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Location"
                value={profileForm.location}
                onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Years of experience"
                value={profileForm.years_experience}
                onChange={(event) => setProfileForm({ ...profileForm, years_experience: event.target.value })}
              />
              <textarea
                className="md:col-span-2 h-32 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Bio"
                value={profileForm.bio}
                onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })}
              />
              <input
                className="md:col-span-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Skills (comma separated)"
                value={profileForm.skills}
                onChange={(event) => setProfileForm({ ...profileForm, skills: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Avatar URL"
                value={profileForm.avatar_url}
                onChange={(event) => setProfileForm({ ...profileForm, avatar_url: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Resume URL"
                value={profileForm.resume_url}
                onChange={(event) => setProfileForm({ ...profileForm, resume_url: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="GitHub"
                value={profileForm.github}
                onChange={(event) => setProfileForm({ ...profileForm, github: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="LinkedIn"
                value={profileForm.linkedin}
                onChange={(event) => setProfileForm({ ...profileForm, linkedin: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Twitter"
                value={profileForm.twitter}
                onChange={(event) => setProfileForm({ ...profileForm, twitter: event.target.value })}
              />
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Website"
                value={profileForm.website}
                onChange={(event) => setProfileForm({ ...profileForm, website: event.target.value })}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleProfileSubmit}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-zinc-950 shadow-glow transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
                disabled={profileMutation.isPending}
              >
                {profileMutation.isPending ? 'Saving…' : 'Save profile'}
              </button>
              <button
                type="button"
                onClick={() => setProfileForm(profile ? {
                  name: profile.name ?? '',
                  headline: profile.headline ?? '',
                  bio: profile.bio ?? '',
                  location: profile.location ?? '',
                  years_experience: profile.years_experience?.toString() ?? '',
                  skills: toCommaString(profile.skills),
                  avatar_url: profile.avatar_url ?? '',
                  resume_url: profile.resume_url ?? '',
                  github: profile.github ?? '',
                  linkedin: profile.linkedin ?? '',
                  twitter: profile.twitter ?? '',
                  website: profile.website ?? '',
                } : { ...blankProfileForm })}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Reset
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
