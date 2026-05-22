import { useCallback, useEffect, useState } from 'react'
import { getProject, listProjects, type Project } from '../projects'
import type { Arc, Episode, Series } from '../types'
import {
  getArc,
  getEpisode,
  getSeries,
  listPreviousEpisodes,
  listSeries,
  saveArc,
  saveEpisode,
  saveSeries,
} from './index'

type AsyncResource<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

function useAsyncResource<T>(
  fetcher: () => Promise<T | null>,
  deps: ReadonlyArray<unknown>,
): AsyncResource<T> & { setData: (next: T | null) => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await fetcher()
      setData(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error')
      setData(null)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then((next) => {
        if (!cancelled) {
          setData(next)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'unknown error')
          setData(null)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refresh, setData }
}

export function useSeriesList() {
  const { data, loading, error, refresh, setData } = useAsyncResource<Series[]>(
    () => listSeries(),
    [],
  )
  const upsert = useCallback(
    async (s: Series) => {
      // Optimistic: refresh list locally, then persist.
      const current = data ?? []
      const next = [s, ...current.filter((x) => x.id !== s.id)]
      setData(next)
      try {
        await saveSeries(s)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('upsert series failed:', e)
      }
    },
    [data, setData],
  )
  return { series: data ?? [], loading, error, refresh, upsert }
}

// Optimistic update: setData first (instant UI), then persist in background.
// Save failures are logged but don't roll back the UI in v1.
function makeOptimisticUpdate<T>(
  setData: (next: T | null) => void,
  persist: (value: T) => Promise<void>,
  label: string,
) {
  return async (value: T) => {
    setData(value)
    try {
      await persist(value)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`${label} failed:`, e)
    }
  }
}

export function useSeries(id: string | undefined) {
  const { data, loading, error, refresh, setData } = useAsyncResource<Series>(
    () => (id ? getSeries(id) : Promise.resolve(null)),
    [id],
  )
  const update = useCallback(makeOptimisticUpdate<Series>(setData, saveSeries, 'saveSeries'), [setData])
  return { series: data, loading, error, refresh, update }
}

export function useArc(seriesId: string | undefined) {
  const { data, loading, error, refresh, setData } = useAsyncResource<Arc>(
    () => (seriesId ? getArc(seriesId) : Promise.resolve(null)),
    [seriesId],
  )
  const update = useCallback(makeOptimisticUpdate<Arc>(setData, saveArc, 'saveArc'), [setData])
  return { arc: data, loading, error, refresh, update }
}

export function useEpisode(
  seriesId: string | undefined,
  episodeNumber: number | undefined,
) {
  const { data, loading, error, refresh, setData } = useAsyncResource<Episode>(
    () =>
      seriesId && episodeNumber !== undefined
        ? getEpisode(seriesId, episodeNumber)
        : Promise.resolve(null),
    [seriesId, episodeNumber],
  )
  const update = useCallback(makeOptimisticUpdate<Episode>(setData, saveEpisode, 'saveEpisode'), [setData])
  return { episode: data, loading, error, refresh, update }
}

export function useProjects() {
  const { data, loading, error, refresh } = useAsyncResource<Project[]>(
    () => listProjects(),
    [],
  )
  return { projects: data ?? [], loading, error, refresh }
}

export function useProject(id: string | undefined) {
  const { data, loading, error, refresh, setData } = useAsyncResource<Project>(
    () => (id ? getProject(id) : Promise.resolve(null)),
    [id],
  )
  return { project: data, loading, error, refresh, setProject: setData }
}

export function usePreviousEpisodes(
  seriesId: string | undefined,
  upToEpisodeNumber: number | undefined,
  count = 3,
) {
  const { data, loading, error } = useAsyncResource<Episode[]>(
    () =>
      seriesId && upToEpisodeNumber !== undefined
        ? listPreviousEpisodes(seriesId, upToEpisodeNumber, count)
        : Promise.resolve([]),
    [seriesId, upToEpisodeNumber, count],
  )
  return { previousEpisodes: data ?? [], loading, error }
}
