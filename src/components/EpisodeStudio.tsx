import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { generateEpisode } from '@/lib/api'
import { labelFor, SETTINGS, SUBGENRES, TONES } from '@/lib/options'
import {
  useArc,
  useEpisode,
  usePreviousEpisodes,
  useSeries,
} from '@/lib/storage/hooks'
import type { EpisodeBeat, Hook, Refinements } from '@/lib/types'

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function EpisodeStudio() {
  const { seriesId, episodeNumber: episodeNumberStr } = useParams<{
    seriesId: string
    episodeNumber: string
  }>()
  const episodeNumber = Number.parseInt(episodeNumberStr ?? '1', 10)
  const navigate = useNavigate()

  const { series } = useSeries(seriesId)
  const { arc } = useArc(seriesId)
  const { episode, update: updateEpisode } = useEpisode(seriesId, episodeNumber)
  const previousEpisodes = usePreviousEpisodes(seriesId, episodeNumber)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeEntryHook, setActiveEntryHook] = useState(0)
  const [activeExitHook, setActiveExitHook] = useState(0)

  if (!series || !arc) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Série/arco não encontrado.</p>
        <Button onClick={() => navigate('/setup')} className="mt-4">Voltar</Button>
      </div>
    )
  }

  const arcBeat = arc.beats.find((b) => b.episodeNumber === episodeNumber)

  async function runGeneration(refinements?: Refinements) {
    if (!series || !arc) return
    setLoading(true)
    setError(null)
    try {
      const next = await generateEpisode({
        series,
        arc,
        episodeNumber,
        previousEpisodes,
        refinements,
      })
      updateEpisode(next)
      setActiveEntryHook(0)
      setActiveExitHook(0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar episódio.')
    } finally {
      setLoading(false)
    }
  }

  function exportJson() {
    if (!episode) return
    const blob = new Blob([JSON.stringify(episode, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${series!.title.replace(/\s+/g, '_')}_ep${episodeNumber.toString().padStart(2, '0')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canPrev = episodeNumber > 1
  const canNext = episodeNumber < series.totalEpisodes

  return (
    <div className="flex h-full min-h-screen">
      {/* Left context column */}
      <div className="w-[280px] shrink-0 border-r border-border bg-card/30 p-4 space-y-4 overflow-y-auto">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Série
          </div>
          <div className="font-semibold">{series.title}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-[10px]">{labelFor(SUBGENRES, series.subgenre)}</Badge>
            <Badge variant="secondary" className="text-[10px]">{labelFor(SETTINGS, series.setting)}</Badge>
            <Badge variant="secondary" className="text-[10px]">{labelFor(TONES, series.tone)}</Badge>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Episódio {episodeNumber}/{series.totalEpisodes}
          </div>
          {arcBeat && (
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Função</div>
                <div className="font-medium">{arcBeat.function}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Evento</div>
                <div className="text-muted-foreground">{arcBeat.keyEvent}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mood</div>
                <div className="text-muted-foreground">{arcBeat.emotionalNote}</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={!canPrev}
              onClick={() => navigate(`/series/${series.id}/episode/${episodeNumber - 1}`)}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={!canNext}
              onClick={() => navigate(`/series/${series.id}/episode/${episodeNumber + 1}`)}
            >
              Próximo <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={loading}
            onClick={() => runGeneration()}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            {episode ? 'Regenerar episódio' : 'Gerar episódio'}
          </Button>
          {episode && (
            <Button size="sm" variant="outline" className="w-full" onClick={exportJson}>
              <Download className="h-3.5 w-3.5 mr-1" /> Exportar JSON
            </Button>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start text-xs"
          onClick={() => navigate(`/series/${series.id}/arc`)}
        >
          ← Voltar ao arco
        </Button>
      </div>

      {/* Center beats column */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="text-sm text-destructive border border-destructive/40 rounded-md px-3 py-2 bg-destructive/5 mb-4">
            {error}
          </div>
        )}

        {!episode && !loading && (
          <EmptyState onGenerate={() => runGeneration()} />
        )}

        {loading && !episode && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-muted/40 rounded-md animate-pulse" />
            ))}
          </div>
        )}

        {episode && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground flex items-center gap-3">
              <span>{episode.beats.length} beats</span>
              <span>·</span>
              <span>~{episode.metadata.estimatedDuration}s estimados</span>
              <span>·</span>
              <span>cliffhanger: {episode.metadata.cliffhangerType}</span>
            </div>
            {episode.beats.map((beat) => (
              <BeatCard key={beat.id} beat={beat} />
            ))}
          </div>
        )}
      </div>

      {/* Right hooks column */}
      <div className="w-[300px] shrink-0 border-l border-border bg-card/30 p-4 space-y-4 overflow-y-auto">
        {episode ? (
          <>
            <HookList
              title="Hook de entrada"
              hooks={episode.entryHooks}
              activeIndex={activeEntryHook}
              onSelect={setActiveEntryHook}
            />
            <HookList
              title="Hook de saída / Cliffhanger"
              hooks={episode.exitHooks}
              activeIndex={activeExitHook}
              onSelect={setActiveExitHook}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={() => runGeneration({ focus: 'iterar nos hooks de entrada e saída' })}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerar hooks
            </Button>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Gere o episódio para ver os hooks.
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="border border-dashed border-border rounded-md p-12 text-center">
      <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground mb-4">
        Episódio ainda não foi gerado.
      </p>
      <Button onClick={onGenerate}>Gerar agora</Button>
    </div>
  )
}

function BeatCard({ beat }: { beat: EpisodeBeat }) {
  const [open, setOpen] = useState(true)
  const endTime = beat.startTime + beat.duration

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              #{beat.index.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {fmtTime(beat.startTime)} → {fmtTime(endTime)}
            </span>
            <Badge variant="outline" className="text-[10px]">{beat.mood}</Badge>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {open && (
          <div className="mt-3 space-y-2 text-sm">
            <BeatField label="Visual">
              <span className="text-muted-foreground">{beat.imageDescription}</span>
            </BeatField>
            {beat.systemMessage && (
              <BeatField label="System">
                <pre className="whitespace-pre-wrap font-mono text-xs bg-muted/60 rounded px-2 py-1">
                  {beat.systemMessage}
                </pre>
              </BeatField>
            )}
            {beat.narration && (
              <BeatField label="Narração">
                <span>{beat.narration}</span>
              </BeatField>
            )}
            {beat.dialogue && beat.dialogue.length > 0 && (
              <BeatField label="Diálogo">
                <div className="space-y-1">
                  {beat.dialogue.map((d, i) => (
                    <div key={i}>
                      <span className="font-semibold">{d.speaker}</span>{' '}
                      <span className="text-xs text-muted-foreground italic">({d.emotion})</span>:{' '}
                      <span>{d.line}</span>
                    </div>
                  ))}
                </div>
              </BeatField>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
              <span>SFX: {beat.sfx.join(', ')}</span>
              <span>→ {beat.transition}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BeatField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div>{children}</div>
    </div>
  )
}

function HookList({
  title,
  hooks,
  activeIndex,
  onSelect,
}: {
  title: string
  hooks: Hook[]
  activeIndex: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      {hooks.map((h, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`w-full text-left rounded-md border p-2 transition-colors text-xs ${
            i === activeIndex
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/40'
          }`}
        >
          <div className="font-mono text-[10px] text-muted-foreground mb-1">
            #{i + 1} · {h.type}
          </div>
          {h.beat.imageDescription && (
            <div className="line-clamp-2">{h.beat.imageDescription}</div>
          )}
          {h.reasoning && (
            <div className="text-[10px] text-muted-foreground italic mt-1 line-clamp-2">
              {h.reasoning}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

