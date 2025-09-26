import { api } from './api'

const RELATIVE_ASSET_PREFIX = /^assets\//

export function resolveAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = api.defaults.baseURL?.replace(/\/$/, '') ?? ''
  const relative = path.replace(/^\/+/, '')
  if (RELATIVE_ASSET_PREFIX.test(relative)) {
    return `${base}/${relative}`
  }
  return `${base}/assets/${relative}`
}

export function isVideoAsset(path: string): boolean {
  return /(\.mp4|\.webm|\.ogg)$/i.test(path)
}

export function isImageAsset(path: string): boolean {
  return /(\.png|\.jpe?g|\.gif|\.webp|\.svg)$/i.test(path)
}
