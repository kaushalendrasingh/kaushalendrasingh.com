export type Profile = {
  id: number
  name: string
  headline: string
  bio: string
  location?: string | null
  years_experience?: number | null
  skills: string[]
  avatar_url?: string | null
  resume_url?: string | null
  github?: string | null
  linkedin?: string | null
  twitter?: string | null
  website?: string | null
  instagram?: string | null
}

export type Project = {
  id: number
  title: string
  description: string
  tech_stack: string[]
  tags: string[]
  cover_image_url?: string | null
  images: string[]
  github_url?: string | null
  live_url?: string | null
  featured: boolean
  date_started?: string | null
  date_completed?: string | null
  created_at: string
  updated_at: string
}

export type Inquiry = {
  id: number
  name: string
  email: string
  company?: string | null
  message: string
  attachment_path?: string | null
  created_at: string
}

export type PaginatedInquiries = {
  items: Inquiry[]
  page: number
  page_size: number
  total: number
  total_pages: number
}
