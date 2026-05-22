import type { Arc, Episode, Series } from '../types'

const KEYS = {
  series: 'sw:series',
  arc: (seriesId: string) => `sw:arc:${seriesId}`,
  episode: (seriesId: string, episodeNumber: number) =>
    `sw:episode:${seriesId}:${episodeNumber}`,
  episodeIndex: (seriesId: string) => `sw:episodes:${seriesId}`,
} as const

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

// Series ---------------------------------------------------------------

export function listSeries(): Series[] {
  return safeParse<Series[]>(localStorage.getItem(KEYS.series)) ?? []
}

export function getSeries(id: string): Series | null {
  return listSeries().find((s) => s.id === id) ?? null
}

export function saveSeries(series: Series): void {
  const all = listSeries()
  const idx = all.findIndex((s) => s.id === series.id)
  if (idx >= 0) all[idx] = series
  else all.push(series)
  localStorage.setItem(KEYS.series, JSON.stringify(all))
}

export function deleteSeries(id: string): void {
  const all = listSeries().filter((s) => s.id !== id)
  localStorage.setItem(KEYS.series, JSON.stringify(all))
  localStorage.removeItem(KEYS.arc(id))
  const episodes = listEpisodes(id)
  for (const ep of episodes) {
    localStorage.removeItem(KEYS.episode(id, ep.episodeNumber))
  }
  localStorage.removeItem(KEYS.episodeIndex(id))
}

// Arc ------------------------------------------------------------------

export function getArc(seriesId: string): Arc | null {
  return safeParse<Arc>(localStorage.getItem(KEYS.arc(seriesId)))
}

export function saveArc(arc: Arc): void {
  localStorage.setItem(KEYS.arc(arc.seriesId), JSON.stringify(arc))
}

// Episodes -------------------------------------------------------------

function getEpisodeIndex(seriesId: string): number[] {
  return safeParse<number[]>(localStorage.getItem(KEYS.episodeIndex(seriesId))) ?? []
}

function setEpisodeIndex(seriesId: string, numbers: number[]): void {
  localStorage.setItem(
    KEYS.episodeIndex(seriesId),
    JSON.stringify([...new Set(numbers)].sort((a, b) => a - b)),
  )
}

export function getEpisode(
  seriesId: string,
  episodeNumber: number,
): Episode | null {
  return safeParse<Episode>(
    localStorage.getItem(KEYS.episode(seriesId, episodeNumber)),
  )
}

export function saveEpisode(episode: Episode): void {
  localStorage.setItem(
    KEYS.episode(episode.seriesId, episode.episodeNumber),
    JSON.stringify(episode),
  )
  setEpisodeIndex(episode.seriesId, [
    ...getEpisodeIndex(episode.seriesId),
    episode.episodeNumber,
  ])
}

export function listEpisodes(seriesId: string): Episode[] {
  const idx = getEpisodeIndex(seriesId)
  return idx
    .map((n) => getEpisode(seriesId, n))
    .filter((e): e is Episode => e !== null)
}

export function listEpisodeNumbers(seriesId: string): number[] {
  return getEpisodeIndex(seriesId)
}
