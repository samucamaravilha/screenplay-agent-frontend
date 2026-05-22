import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Play, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { generateArc } from '@/lib/api'
import { labelFor, SUBGENRES, TONES } from '@/lib/options'
import { saveArc } from '@/lib/storage'
import { useArc, useSeries } from '@/lib/storage/hooks'
import type { Arc, ArcBeat } from '@/lib/types'

const SAVE_DEBOUNCE_MS = 600

export function ArcOverview() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  const { series, loading: seriesLoading } = useSeries(seriesId)
  const { arc: remoteArc, loading: arcLoading, update: updateArc } = useArc(seriesId)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Local arc state for edit-as-you-type. Hydrates from remote on load
  // and on regeneration. Saves are debounced to avoid hammering Supabase.
  const [localArc, setLocalArc] = useState<Arc | null>(remoteArc)
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setLocalArc(remoteArc)
  }, [remoteArc])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [])

  const arc = localArc

  if (seriesLoading || arcLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!series) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Série não encontrada.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Voltar ao dashboard
        </Button>
      </div>
    )
  }

  if (!arc) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Arco ainda não foi gerado. Volte ao Setup.
      </div>
    )
  }

  function patchBeat(idx: number, patch: Partial<ArcBeat>) {
    if (!arc) return
    const beats = arc.beats.map((b, i) => (i === idx ? { ...b, ...patch } : b))
    const next = { ...arc, beats }
    setLocalArc(next)
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveArc(next).catch((e) => {
        // eslint-disable-next-line no-console
        console.error('saveArc failed:', e)
      })
    }, SAVE_DEBOUNCE_MS)
  }

  async function regenerateAll() {
    if (!series) return
    setRegenerating(true)
    setError(null)
    try {
      const fresh = await generateArc(series)
      // updateArc handles optimistic state + persist. Clear any pending debounced save.
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
      await updateArc(fresh)
      setLocalArc(fresh)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao regenerar arco.')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{series.title}</h1>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{labelFor(SUBGENRES, series.subgenre)}</Badge>
            <Badge variant="secondary">{labelFor(TONES, series.tone)}</Badge>
            <Badge variant="outline">{series.totalEpisodes} eps</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Arco com {arc.beats.length} beats. Cada item é editável; alterações são salvas automaticamente.
          </p>
        </div>
        <Button variant="outline" onClick={regenerateAll} disabled={regenerating}>
          {regenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Regenerar arco
        </Button>
      </header>

      {error && (
        <div className="text-sm text-destructive border border-destructive/40 rounded-md px-3 py-2 bg-destructive/5">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {arc.beats.map((beat, idx) => (
          <Card key={beat.episodeNumber}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {beat.episodeNumber.toString().padStart(2, '0')}
                  </span>
                  <Input
                    value={beat.function}
                    onChange={(e) => patchBeat(idx, { function: e.target.value })}
                    className="font-medium border-0 px-1 h-8 focus-visible:ring-1"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/series/${series!.id}/episode/${beat.episodeNumber}`)}
                >
                  <Play className="mr-1 h-3.5 w-3.5" /> Episódio
                </Button>
              </div>
              <div>
                <Label>Evento-chave</Label>
                <Textarea
                  rows={2}
                  value={beat.keyEvent}
                  onChange={(e) => patchBeat(idx, { keyEvent: e.target.value })}
                />
              </div>
              <div>
                <Label>Mood</Label>
                <Input
                  value={beat.emotionalNote}
                  onChange={(e) => patchBeat(idx, { emotionalNote: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
      {children}
    </div>
  )
}
