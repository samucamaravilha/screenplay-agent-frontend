import { supabase } from '../supabase'
import type { Arc, Episode, Series } from '../types'

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

export async function listSeries(): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select('data')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(`listSeries: ${error.message}`)
  return (data ?? []).map((r) => r.data as Series)
}

export async function getSeries(id: string): Promise<Series | null> {
  const { data, error } = await supabase
    .from('series')
    .select('data')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`getSeries: ${error.message}`)
  return (data?.data as Series | undefined) ?? null
}

export async function saveSeries(series: Series): Promise<void> {
  const { error } = await supabase
    .from('series')
    .upsert(
      {
        id: series.id,
        data: series,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
  if (error) throw new Error(`saveSeries: ${error.message}`)
}

export async function deleteSeries(id: string): Promise<void> {
  // Cascading deletes (arcs, episodes) are handled by the FK ON DELETE CASCADE.
  const { error } = await supabase.from('series').delete().eq('id', id)
  if (error) throw new Error(`deleteSeries: ${error.message}`)
}

// ---------------------------------------------------------------------------
// Arc
// ---------------------------------------------------------------------------

export async function getArc(seriesId: string): Promise<Arc | null> {
  const { data, error } = await supabase
    .from('arcs')
    .select('data')
    .eq('series_id', seriesId)
    .maybeSingle()
  if (error) throw new Error(`getArc: ${error.message}`)
  return (data?.data as Arc | undefined) ?? null
}

export async function saveArc(arc: Arc): Promise<void> {
  const { error } = await supabase
    .from('arcs')
    .upsert(
      {
        series_id: arc.seriesId,
        data: arc,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'series_id' },
    )
  if (error) throw new Error(`saveArc: ${error.message}`)
}

// ---------------------------------------------------------------------------
// Episodes
// ---------------------------------------------------------------------------

export async function getEpisode(
  seriesId: string,
  episodeNumber: number,
): Promise<Episode | null> {
  const { data, error } = await supabase
    .from('episodes')
    .select('data')
    .eq('series_id', seriesId)
    .eq('episode_number', episodeNumber)
    .maybeSingle()
  if (error) throw new Error(`getEpisode: ${error.message}`)
  return (data?.data as Episode | undefined) ?? null
}

export async function saveEpisode(episode: Episode): Promise<void> {
  const { error } = await supabase
    .from('episodes')
    .upsert(
      {
        id: episode.id,
        series_id: episode.seriesId,
        episode_number: episode.episodeNumber,
        data: episode,
        generated_at: episode.metadata.generatedAt,
      },
      { onConflict: 'series_id,episode_number' },
    )
  if (error) throw new Error(`saveEpisode: ${error.message}`)
}

export async function listEpisodes(seriesId: string): Promise<Episode[]> {
  const { data, error } = await supabase
    .from('episodes')
    .select('data')
    .eq('series_id', seriesId)
    .order('episode_number', { ascending: true })
  if (error) throw new Error(`listEpisodes: ${error.message}`)
  return (data ?? []).map((r) => r.data as Episode)
}

export async function listPreviousEpisodes(
  seriesId: string,
  upToEpisodeNumber: number,
  count = 3,
): Promise<Episode[]> {
  const { data, error } = await supabase
    .from('episodes')
    .select('data')
    .eq('series_id', seriesId)
    .lt('episode_number', upToEpisodeNumber)
    .order('episode_number', { ascending: false })
    .limit(count)
  if (error) throw new Error(`listPreviousEpisodes: ${error.message}`)
  // Return in chronological order (oldest first).
  return (data ?? []).map((r) => r.data as Episode).reverse()
}
