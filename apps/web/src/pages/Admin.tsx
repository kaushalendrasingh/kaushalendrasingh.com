import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Navbar from '../components/Navbar'
import { ExternalLinkIcon, GitHubIcon } from '../components/icons'
import { resolveAssetUrl, isVideoAsset } from '../lib/media'
import { api } from '../lib/api'
import type { Profile, Project, PaginatedInquiries, Inquiry } from '../types'

const STORAGE_KEY = 'portfolio.admin.apiKey'
const AUTH_KEY = 'portfolio.admin.authenticated'
const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? 'admin@kaushcodes.com'
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'shipfast'

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
  pendingAssets: [] as File[],
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
  instagram: string
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
  instagram: '',
}

const CONTACTS_PAGE_SIZE = 10

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
  const [activeTab, setActiveTab] = useState<'projects' | 'profile' | 'contacts'>('projects')
  const [projectForm, setProjectForm] = useState<ProjectFormState>({ ...blankProjectForm })
  const [profileForm, setProfileForm] = useState<ProfileFormState>({ ...blankProfileForm })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(AUTH_KEY) === 'true'
  })
  const [contactsPage, setContactsPage] = useState(1)
  const [contactsSearchInput, setContactsSearchInput] = useState('')
  const [contactsSearch, setContactsSearch] = useState('')

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
    enabled: isAuthed,
  })

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects', 'admin'],
    queryFn: async () => (await api.get('/projects')).data,
    enabled: isAuthed,
  })

  const contactsQuery = useQuery<PaginatedInquiries>({
    queryKey: ['inquiries', contactsPage, contactsSearch, apiKey],
    queryFn: async () => {
      const headers = { 'X-API-Key': apiKey }
      const params = {
        page: contactsPage,
        page_size: CONTACTS_PAGE_SIZE,
        search: contactsSearch || undefined,
      }
      const { data } = await api.get('/inquiries', { params, headers })
      return data as PaginatedInquiries
    },
    enabled: isAuthed && Boolean(apiKey),
    placeholderData: keepPreviousData,
  })

  const contactsError = contactsQuery.error as any
  const contactsErrorMessage = contactsError?.response?.data?.detail ?? contactsError?.message ?? 'Failed to load inquiries.'
  const contactsData = contactsQuery.data
  const contactsRangeStart = contactsData && contactsData.items.length > 0
    ? (contactsData.page - 1) * contactsData.page_size + 1
    : 0
  const contactsRangeEnd = contactsData && contactsData.items.length > 0
    ? contactsRangeStart + contactsData.items.length - 1
    : 0

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
      instagram: profile.instagram ?? '',
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
    mutationFn: async ({ mode, payload, id, files }: { mode: 'create' | 'update'; payload: any; id?: number; files?: File[] }) => {
      const headers = { 'X-API-Key': apiKey }
      if (mode === 'create') {
        const { data } = await api.post('/projects', payload, { headers })
        if (files && files.length > 0) {
          const formData = new FormData()
          files.forEach((file) => formData.append('files', file))
          try {
            await api.post(`/projects/${data.id}/assets`, formData, {
              headers: { ...headers, 'Content-Type': 'multipart/form-data' },
            })
            const refreshed = await api.get(`/projects/${data.id}`)
            return refreshed.data as Project
          } catch (error) {
            console.error(error)
            alert('Project saved, but asset upload failed. You can retry from the project list below.')
          }
        }
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

  const projectAssetUploadMutation = useMutation({
    mutationFn: async ({ projectId, files }: { projectId: number; files: File[] }) => {
      const headers = { 'X-API-Key': apiKey, 'Content-Type': 'multipart/form-data' }
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      const { data } = await api.post(`/projects/${projectId}/assets`, formData, { headers })
      return data as Project
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', 'admin'] })
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail ?? error.message ?? 'Failed to upload assets')
    },
  })

  const projectAssetDeleteMutation = useMutation({
    mutationFn: async ({ projectId, assetPath }: { projectId: number; assetPath: string }) => {
      const headers = { 'X-API-Key': apiKey }
      const { data } = await api.delete(`/projects/${projectId}/assets`, { params: { asset_path: assetPath }, headers })
      return data as Project
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', 'admin'] })
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail ?? error.message ?? 'Failed to remove asset')
    },
  })

  const resumeUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const headers = { 'X-API-Key': apiKey, 'Content-Type': 'multipart/form-data' }
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/profile/resume', formData, { headers })
      return data as Profile
    },
    onSuccess: (resp) => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      setProfileForm((prev) => ({ ...prev, resume_url: resp.resume_url ?? '' }))
      alert('Resume updated successfully!')
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail ?? error.message ?? 'Failed to upload resume')
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
    projectMutation.mutate({ mode, payload, id: projectForm.id, files: projectForm.pendingAssets })
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

  const handleContactsSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setContactsPage(1)
    setContactsSearch(contactsSearchInput.trim())
  }

  const handleContactsReset = () => {
    setContactsPage(1)
    setContactsSearch('')
    setContactsSearchInput('')
  }

  const handleProjectAssetUpload = (projectId: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!requireKey(apiKey)) return
    const fileArray = Array.from(files)
    projectAssetUploadMutation.mutate({ projectId, files: fileArray })
  }

  const handleProjectAssetDelete = (projectId: number, assetPath: string) => {
    if (!requireKey(apiKey)) return
    if (!window.confirm('Remove this asset from the project?')) return
    projectAssetDeleteMutation.mutate({ projectId, assetPath })
  }

  const handleResumeUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!requireKey(apiKey)) return
    resumeUploadMutation.mutate(files[0])
  }

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = loginForm.email.trim().toLowerCase()
    const expectedEmail = ADMIN_EMAIL.trim().toLowerCase()

    if (normalizedEmail === expectedEmail && loginForm.password === ADMIN_PASSWORD) {
      setIsAuthed(true)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_KEY, 'true')
      }
      setLoginError(null)
      setLoginForm({ email: '', password: '' })
      return
    }

    setLoginError('That combo unlocks nothing. Try again, code ranger.')
  }

  const handleLogout = () => {
    setIsAuthed(false)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_KEY)
    }
    setProjectForm({ ...blankProjectForm })
    setProfileForm({ ...blankProfileForm })
    setActiveTab('projects')
    setContactsPage(1)
    setContactsSearch('')
    setContactsSearchInput('')
  }

  if (!isAuthed) {
    return (
      <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
        <Navbar profile={profile} />
        <main className="mx-auto flex min-h-screen items-center justify-center px-4 pb-16 pt-28">
          <div className="max-w-md w-full rounded-3xl border border-zinc-800/70 bg-zinc-900/60 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Admin Access</p>
            <h1 className="mt-4 text-3xl font-semibold text-white">Enter the command deck</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Only trusted operators may deploy updates. Authenticate with your crew credentials.
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="text-xs uppercase tracking-wide text-zinc-500" htmlFor="admin-email">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="you@shipfast.dev"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-zinc-500" htmlFor="admin-password">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                />
              </div>
              {loginError && <p className="text-sm text-red-400">{loginError}</p>}
              <button
                type="submit"
                className="w-full rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-zinc-950 shadow-glow transition hover:shadow-glow"
              >
                Enter Control Room
              </button>
            </form>
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-[11px] text-zinc-500">
              <p className="font-medium text-zinc-300">Heads-up</p>
              <p className="mt-1">Configure `VITE_ADMIN_EMAIL` & `VITE_ADMIN_PASSWORD` in your web env to customise these credentials.</p>
            </div>
          </div>
        </main>
      </div>
    )
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
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Log out
              </button>
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
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === 'contacts' ? 'bg-brand text-zinc-950' : 'text-zinc-300 hover:text-white'
              }`}
            >
              Contacts
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
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-wide text-zinc-500">Upload assets (optional)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        pendingAssets: Array.from(event.target.files ?? []),
                      })
                    }
                    className="mt-1 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
                  />
                  {projectForm.pendingAssets.length > 0 && (
                    <p className="mt-2 text-xs text-zinc-500">
                      {projectForm.pendingAssets.length} file(s) ready to upload on save.
                    </p>
                  )}
                </div>
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
                  {project.images && project.images.length > 0 && (
                    <div className="mt-5 space-y-2">
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Assets</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {project.images.map((asset) => {
                          const url = resolveAssetUrl(asset)
                          if (!url) return null
                          const video = isVideoAsset(asset)
                          return (
                            <div
                              key={asset}
                              className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/60"
                            >
                              <div className="relative">
                                {video ? (
                                  <video src={url} controls className="w-full object-cover" />
                                ) : (
                                  <img src={url} alt="asset" className="w-full object-cover" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleProjectAssetDelete(project.id, asset)}
                                  disabled={projectAssetDeleteMutation.isPending}
                                  className="absolute right-2 top-2 rounded-full bg-zinc-950/80 px-3 py-1 text-[10px] uppercase tracking-wide text-zinc-200 transition hover:bg-red-500/80 hover:text-white disabled:opacity-60"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Upload new assets</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(event) => {
                        handleProjectAssetUpload(project.id, event.target.files)
                        event.target.value = ''
                      }}
                      className="mt-2 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
                      disabled={projectAssetUploadMutation.isPending}
                    />
                    <p className="mt-2 text-[11px] text-zinc-500">Images, GIFs, or videos up to 50MB each.</p>
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
                          pendingAssets: [],
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
              <input
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none"
                placeholder="Instagram"
                value={profileForm.instagram}
                onChange={(event) => setProfileForm({ ...profileForm, instagram: event.target.value })}
              />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Resume</p>
              {profileForm.resume_url && (
                <a
                  href={resolveAssetUrl(profileForm.resume_url) ?? profileForm.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/70 px-3 py-2 text-xs text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                >
                  Current resume
                </a>
              )}
              <input
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => {
                  handleResumeUpload(event.target.files)
                  event.target.value = ''
                }}
                disabled={resumeUploadMutation.isPending}
                className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-700"
              />
              <p className="text-[11px] text-zinc-500">Upload a PDF or DOCX up to 20MB.</p>
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
                  instagram: profile.instagram ?? '',
                } : { ...blankProfileForm })}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Reset
              </button>
            </div>
          </section>
        )}

        {activeTab === 'contacts' && (
          <section className="rounded-3xl border border-zinc-800/70 bg-zinc-900/50 p-8 shadow-lg shadow-black/20">
            <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Contact inquiries</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Review messages from leads, collaborators, and clients. Filter by keyword or step through pages.
                </p>
              </div>
              <form className="flex flex-wrap items-center gap-2" onSubmit={handleContactsSearchSubmit}>
                <input
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-brand/60 focus:outline-none md:w-64"
                  placeholder="Filter by name, email, company, message"
                  value={contactsSearchInput}
                  onChange={(event) => setContactsSearchInput(event.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={handleContactsReset}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </header>

            {!apiKey && (
              <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-6 text-sm text-zinc-400">
                Add your API key above to load inquiries.
              </div>
            )}

            {apiKey && (
              <div className="space-y-6">
                {contactsQuery.isLoading && (
                  <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-6 text-sm text-zinc-400">
                    Loading inquiries…
                  </div>
                )}

                {contactsQuery.isError && !contactsQuery.isLoading && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
                    {contactsErrorMessage}
                  </div>
                )}

                {!contactsQuery.isLoading && !contactsQuery.isError && contactsData && contactsData.items.length === 0 && (
                  <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-6 text-sm text-zinc-400">
                    No inquiries yet. Once someone reaches out via the contact form, their details will appear here.
                  </div>
                )}

                {contactsData && contactsData.items.length > 0 && (
                  <div className="space-y-4">
                    {contactsData.items.map((item) => {
                      const attachmentUrl = resolveAssetUrl(item.attachment_path ?? undefined)
                      const createdAt = new Date(item.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })

                      return (
                        <article
                          key={item.id}
                          className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 shadow shadow-black/20"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                                <a href={`mailto:${item.email}`} className="underline decoration-dotted decoration-zinc-500">
                                  {item.email}
                                </a>
                                {item.company && <span className="text-xs uppercase tracking-wide text-zinc-500">{item.company}</span>}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-500">{createdAt}</p>
                          </div>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                            {item.message}
                          </p>
                          {attachmentUrl && (
                            <div className="mt-4">
                              <a
                                href={attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/70 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                              >
                                View attachment
                              </a>
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                )}

                {contactsData && contactsData.total_pages > 1 && (
                  <div className="flex flex-col gap-3 border-t border-zinc-800/60 pt-4 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
                    <span>
                      Showing {contactsRangeStart} – {contactsRangeEnd} of {contactsData.total}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setContactsPage((prev) => Math.max(1, prev - 1))}
                        disabled={contactsPage === 1 || contactsQuery.isFetching}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Previous
                      </button>
                      <span className="text-xs uppercase tracking-wide text-zinc-500">
                        Page {contactsPage} / {contactsData.total_pages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setContactsPage((prev) => Math.min(contactsData.total_pages, prev + 1))}
                        disabled={contactsPage >= contactsData.total_pages || contactsQuery.isFetching}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
