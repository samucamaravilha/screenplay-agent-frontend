import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { generateArc } from '@/lib/api'
import {
  ANTAGONIST_TYPES,
  ENDING_TYPES,
  PROTAGONIST_ARCHETYPES,
  SETTINGS,
  SUBGENRES,
  THEMES,
  TONES,
} from '@/lib/options'
import { saveArc, saveSeries } from '@/lib/storage'
import type {
  AntagonistType,
  EndingType,
  ProtagonistArchetype,
  Series,
  Setting,
  Subgenre,
  Theme,
  Tone,
} from '@/lib/types'

const DEFAULTS = {
  title: '',
  subgenre: '' as Subgenre | '',
  setting: '' as Setting | '',
  powerSystem: '',
  protagonist: {
    archetype: '' as ProtagonistArchetype | '',
    name: '',
    background: '',
    coreMotivation: '',
  },
  antagonist: {
    type: '' as AntagonistType | '',
    name: '',
    threat: '',
  },
  themes: [] as Theme[],
  totalEpisodes: 60,
  tone: '' as Tone | '',
  ending: '' as EndingType | '',
}

function validate(s: typeof DEFAULTS): string | null {
  if (!s.title.trim()) return 'Título é obrigatório.'
  if (!s.subgenre) return 'Escolha um subgênero.'
  if (!s.setting) return 'Escolha um setting.'
  if (!s.powerSystem.trim()) return 'Descreva o sistema de poder.'
  if (!s.protagonist.archetype) return 'Escolha o arquétipo do protagonista.'
  if (!s.protagonist.name.trim()) return 'Nome do protagonista é obrigatório.'
  if (!s.protagonist.background.trim()) return 'Background do protagonista é obrigatório.'
  if (!s.protagonist.coreMotivation.trim()) return 'Motivação core do protagonista é obrigatória.'
  if (!s.antagonist.type) return 'Escolha o tipo do antagonista.'
  if (!s.antagonist.name.trim()) return 'Nome do antagonista é obrigatório.'
  if (!s.antagonist.threat.trim()) return 'Threat do antagonista é obrigatório.'
  if (s.themes.length < 2 || s.themes.length > 4) return 'Escolha entre 2 e 4 temas.'
  if (!s.tone) return 'Escolha um tom geral.'
  if (!s.ending) return 'Escolha um tipo de final.'
  if (s.totalEpisodes < 5 || s.totalEpisodes > 200) return 'Episódios totais entre 5 e 200.'
  return null
}

export function SeriesSetup() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(DEFAULTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleTheme(t: Theme) {
    setDraft((d) =>
      d.themes.includes(t)
        ? { ...d, themes: d.themes.filter((x) => x !== t) }
        : { ...d, themes: [...d.themes, t] },
    )
  }

  async function onGenerate() {
    const err = validate(draft)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setLoading(true)

    const now = new Date().toISOString()
    const series: Series = {
      id: `series_${Date.now().toString(36)}`,
      title: draft.title.trim(),
      subgenre: draft.subgenre as Subgenre,
      setting: draft.setting as Setting,
      powerSystem: draft.powerSystem.trim(),
      protagonist: {
        archetype: draft.protagonist.archetype as ProtagonistArchetype,
        name: draft.protagonist.name.trim(),
        background: draft.protagonist.background.trim(),
        coreMotivation: draft.protagonist.coreMotivation.trim(),
      },
      antagonist: {
        type: draft.antagonist.type as AntagonistType,
        name: draft.antagonist.name.trim(),
        threat: draft.antagonist.threat.trim(),
      },
      themes: draft.themes,
      totalEpisodes: draft.totalEpisodes,
      tone: draft.tone as Tone,
      ending: draft.ending as EndingType,
      createdAt: now,
      updatedAt: now,
    }

    saveSeries(series)

    try {
      const arc = await generateArc(series)
      saveArc(arc)
      navigate(`/series/${series.id}/arc`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar arco.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Nova série</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Defina a série bible. O arco completo é gerado a partir disso.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Identidade</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Título">
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ex: O Retornado da Torre Negra"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Subgênero">
              <OptionSelect
                value={draft.subgenre}
                onChange={(v) => setDraft({ ...draft, subgenre: v as Subgenre })}
                options={SUBGENRES}
                placeholder="Escolha o subgênero"
              />
            </Field>
            <Field label="Setting">
              <OptionSelect
                value={draft.setting}
                onChange={(v) => setDraft({ ...draft, setting: v as Setting })}
                options={SETTINGS}
                placeholder="Escolha o setting"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sistema de poder</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={draft.powerSystem}
            onChange={(e) => setDraft({ ...draft, powerSystem: e.target.value })}
            placeholder="Ex: Sistema de cultivo em 10 estágios. Avanços requerem absorver essência de monstros. Nível visível como aura colorida."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Protagonista</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Arquétipo">
              <OptionSelect
                value={draft.protagonist.archetype}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    protagonist: { ...draft.protagonist, archetype: v as ProtagonistArchetype },
                  })
                }
                options={PROTAGONIST_ARCHETYPES}
                placeholder="Escolha o arquétipo"
              />
            </Field>
            <Field label="Nome">
              <Input
                value={draft.protagonist.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    protagonist: { ...draft.protagonist, name: e.target.value },
                  })
                }
                placeholder="Ex: Kaito Sora"
              />
            </Field>
          </div>
          <Field label="Background (2-3 frases)">
            <Textarea
              rows={3}
              value={draft.protagonist.background}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  protagonist: { ...draft.protagonist, background: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Motivação core (1 frase)">
            <Input
              value={draft.protagonist.coreMotivation}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  protagonist: { ...draft.protagonist, coreMotivation: e.target.value },
                })
              }
              placeholder="O que ele quer acima de tudo?"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Antagonista</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <OptionSelect
                value={draft.antagonist.type}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    antagonist: { ...draft.antagonist, type: v as AntagonistType },
                  })
                }
                options={ANTAGONIST_TYPES}
                placeholder="Escolha o tipo"
              />
            </Field>
            <Field label="Nome">
              <Input
                value={draft.antagonist.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    antagonist: { ...draft.antagonist, name: e.target.value },
                  })
                }
                placeholder="Ex: A Torre Negra"
              />
            </Field>
          </div>
          <Field label="Threat (o que representa)">
            <Textarea
              rows={2}
              value={draft.antagonist.threat}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  antagonist: { ...draft.antagonist, threat: e.target.value },
                })
              }
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Temas{' '}
            <span className="text-xs text-muted-foreground font-normal">
              (escolha 2-4)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={draft.themes.includes(t.id)}
                  onCheckedChange={() => toggleTheme(t.id)}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tom e final</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Tom geral">
              <OptionSelect
                value={draft.tone}
                onChange={(v) => setDraft({ ...draft, tone: v as Tone })}
                options={TONES}
                placeholder="Escolha o tom"
              />
            </Field>
            <Field label="Final">
              <OptionSelect
                value={draft.ending}
                onChange={(v) => setDraft({ ...draft, ending: v as EndingType })}
                options={ENDING_TYPES}
                placeholder="Escolha o final"
              />
            </Field>
            <Field label="Episódios totais">
              <Input
                type="number"
                min={5}
                max={200}
                value={draft.totalEpisodes}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    totalEpisodes: Number.parseInt(e.target.value || '0', 10),
                  })
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-destructive border border-destructive/40 rounded-md px-3 py-2 bg-destructive/5">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button size="lg" disabled={loading} onClick={onGenerate}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Gerando arco...' : 'Gerar arco'}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

function OptionSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string; description?: string }[]
  placeholder: string
}) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            <div className="flex flex-col">
              <span>{o.label}</span>
              {o.description && (
                <span className="text-xs text-muted-foreground">
                  {o.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
