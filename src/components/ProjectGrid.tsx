import { useNavigate, useParams } from 'react-router-dom'
import {
  Brush,
  Edit3,
  FileText,
  Film,
  Info,
  Loader2,
  Lock,
  Mic,
  Music,
  Sparkles,
  Users,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { AppSidebar } from '@/components/AppSidebar'
import { cn } from '@/lib/utils'
import { useProject } from '@/lib/storage/hooks'

type ModuleId =
  | 'script'
  | 'characters'
  | 'scenes'
  | 'storyboard'
  | 'animate'
  | 'voices'
  | 'soundtrack'
  | 'edit'

type Module = {
  id: ModuleId
  label: string
  description: string
  icon: typeof FileText
  requires?: string
}

const MODULES: Module[] = [
  {
    id: 'script',
    label: 'Criar roteiro',
    description: 'Defina série, arco e gere episódios.',
    icon: FileText,
  },
  {
    id: 'characters',
    label: 'Criar personagens',
    description: 'Designs visuais consistentes pros personagens do roteiro.',
    icon: Users,
    requires: 'Criar roteiro',
  },
  {
    id: 'scenes',
    label: 'Criar cenários',
    description: 'Locações visuais pros beats do roteiro.',
    icon: Brush,
    requires: 'Criar personagens',
  },
  {
    id: 'storyboard',
    label: 'Criar storyboard',
    description: 'Sequência de painéis por episódio, baseada em beats e visuais.',
    icon: Film,
    requires: 'Criar cenários',
  },
  {
    id: 'animate',
    label: 'Animar',
    description: 'Gere animações verticais a partir do storyboard.',
    icon: Sparkles,
    requires: 'Criar storyboard',
  },
  {
    id: 'voices',
    label: 'Criar vozes',
    description: 'Atuação dos diálogos via ElevenLabs.',
    icon: Mic,
    requires: 'Animar',
  },
  {
    id: 'soundtrack',
    label: 'Criar trilha sonora',
    description: 'Música e ambiente por episódio.',
    icon: Music,
    requires: 'Criar vozes',
  },
  {
    id: 'edit',
    label: 'Editar',
    description: 'Montagem final: animação + voz + trilha.',
    icon: Edit3,
    requires: 'Criar trilha sonora',
  },
]

export function ProjectGrid() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { project, loading } = useProject(projectId)

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center px-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Projeto não encontrado.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm underline underline-offset-2"
            >
              Voltar pro dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  function handleScript() {
    if (!project) return
    if (project.seriesId) {
      navigate(`/series/${project.seriesId}/arc`)
    } else {
      navigate(`/project/${project.id}/setup`)
    }
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen">
        <AppSidebar />

        <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">
          <header className="mb-8 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Projeto
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
          </header>

          <div className="flex items-start gap-2 mb-6 text-xs text-muted-foreground border border-border rounded-md px-3 py-2 bg-muted/30">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              As etapas devem ser concluídas em ordem — cada módulo depende do
              anterior. Apenas <strong className="text-foreground">Criar roteiro</strong> está
              disponível na v1; os demais serão liberados em breve.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODULES.map((m) => {
              const enabled = m.id === 'script'
              const Icon = m.icon
              const card = (
                <Card
                  className={cn(
                    'h-full transition-colors relative',
                    enabled
                      ? 'cursor-pointer hover:border-primary/60'
                      : 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <CardContent className="pt-5 pb-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      {!enabled && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{m.label}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {m.description}
                      </div>
                    </div>
                    {!enabled && m.requires && (
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 pt-2 border-t border-border">
                        Requer: {m.requires}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )

              if (!enabled) {
                return (
                  <Tooltip key={m.id}>
                    <TooltipTrigger asChild>
                      <div>{card}</div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-xs">
                        Disponível após concluir <strong>{m.requires}</strong>.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={handleScript}
                  className="text-left"
                >
                  {card}
                </button>
              )
            })}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
