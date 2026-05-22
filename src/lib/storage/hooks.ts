import { useCallback, useEffect, useState } from 'react'
import type { Arc, Episode, Series } from '../types'
import {
  getArc,
  getEpisode,
  getSeries,
  listEpisodes,
  listSeries,
  saveArc,
  saveEpisode,
  saveSeries,
} from './index'

export function useSeriesList() {
  const [series, setSeries] = useState<Series[]>(() => listSeries())
  const refresh = useCallback(() => setSeries(listSeries()), [])
  const upsert = useCallback((s: Series) => {
    saveSeries(s)
    setSeries(listSeries())
  }, [])
  return { series, refresh, upsert }
}

export function useSeries(id: string | undefined) {
  const [series, setSeries] = useState<Series | null>(() =>
    id ? getSeries(id) : null,
  )
  useEffect(() => {
    setSeries(id ? getSeries(id) : null)
  }, [id])
  const update = useCallback(
    (s: Series) => {
      saveSeries(s)
      setSeries(s)
    },
    [],
  )
  return { series, update }
}

export function useArc(seriesId: string | undefined) {
  const [arc, setArc] = useState<Arc | null>(() =>
    seriesId ? getArc(seriesId) : null,
  )
  useEffect(() => {
    setArc(seriesId ? getArc(seriesId) : null)
  }, [seriesId])
  const update = useCallback((a: Arc) => {
    saveArc(a)
    setArc(a)
  }, [])
  return { arc, update }
}

export function useEpisode(seriesId: string | undefined, episodeNumber: number | undefined) {
  const [episode, setEpisode] = useState<Episode | null>(() =>
    seriesId && episodeNumber !== undefined ? getEpisode(seriesId, episodeNumber) : null,
  )
  useEffect(() => {
    setEpisode(
      seriesId && episodeNumber !== undefined ? getEpisode(seriesId, episodeNumber) : null,
    )
  }, [seriesId, episodeNumber])
  const update = useCallback((e: Episode) => {
    saveEpisode(e)
    setEpisode(e)
  }, [])
  return { episode, update }
}

export function usePreviousEpisodes(
  seriesId: string | undefined,
  upToEpisodeNumber: number | undefined,
  count = 3,
): Episode[] {
  if (!seriesId || upToEpisodeNumber === undefined) return []
  return listEpisodes(seriesId)
    .filter((ep) => ep.episodeNumber < upToEpisodeNumber)
    .sort((a, b) => b.episodeNumber - a.episodeNumber)
    .slice(0, count)
    .reverse()
}
