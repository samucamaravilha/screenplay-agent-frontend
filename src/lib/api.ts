import type { Arc, Episode, Refinements, Series } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    let detail: string
    try {
      const body = await res.json()
      detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body)
    } catch {
      detail = await res.text()
    }
    throw new Error(`API ${res.status}: ${detail}`)
  }
  return (await res.json()) as T
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path)
}

export async function generateArc(series: Series): Promise<Arc> {
  return request<Arc>('/api/generate-arc', {
    method: 'POST',
    body: JSON.stringify({ series }),
  })
}

export async function generateEpisode(args: {
  series: Series
  arc: Arc
  episodeNumber: number
  previousEpisodes: Episode[]
  refinements?: Refinements
}): Promise<Episode> {
  return request<Episode>('/api/generate-episode', {
    method: 'POST',
    body: JSON.stringify({
      series: args.series,
      arc: args.arc,
      episodeNumber: args.episodeNumber,
      previousEpisodes: args.previousEpisodes,
      refinements: args.refinements,
    }),
  })
}
