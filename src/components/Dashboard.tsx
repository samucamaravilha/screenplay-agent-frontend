import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FolderOpen, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { AppSidebar } from '@/components/AppSidebar'
import { useAuth } from '@/lib/auth'
import { createProject, listProjects } from '@/lib/projects'

const GREETINGS = [
  'O que vamos criar hoje?',
  'O que manda?',
  'Pronto pra começar?',
]

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(searchParams.get('new') === '1')
  const [openProjectsView, setOpenProjectsView] = useState(false)
  const [projects, setProjects] = useState(() => listProjects())

  const greeting = useMemo(
    () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    [],
  )

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModalOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleCreate(name: string) {
    const project = createProject(name)
    setProjects(listProjects())
    navigate(`/project/${project.id}`)
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar onNewProject={() => setModalOpen(true)} />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {openProjectsView ? (
          <ProjectListView
            projects={projects}
            onOpen={(id) => navigate(`/project/${id}`)}
            onBack={() => setOpenProjectsView(false)}
          />
        ) : (
          <div className="max-w-2xl w-full space-y-10">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Olá, {user?.email?.split('@')[0] ?? 'criador'}.
              </p>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                {greeting}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ActionCard
                icon={Plus}
                title="Novo projeto"
                description="Comece do zero — defina série, arco e episódios."
                onClick={() => setModalOpen(true)}
              />
              <ActionCard
                icon={FolderOpen}
                title="Abrir projeto"
                description={
                  projects.length === 0
                    ? 'Nenhum projeto salvo ainda.'
                    : `${projects.length} projeto${projects.length === 1 ? '' : 's'} salvo${projects.length === 1 ? '' : 's'}.`
                }
                disabled={projects.length === 0}
                onClick={() => setOpenProjectsView(true)}
              />
            </div>
          </div>
        )}
      </main>

      <NewProjectDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreate}
      />
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: typeof Plus
  title: string
  description: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-left disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <Card className="h-full transition-colors group-hover:not-disabled:border-primary/60">
        <CardContent className="pt-6 pb-6 space-y-3">
          <div className="h-10 w-10 rounded-md bg-accent flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

function ProjectListView({
  projects,
  onOpen,
  onBack,
}: {
  projects: ReturnType<typeof listProjects>
  onOpen: (id: string) => void
  onBack: () => void
}) {
  return (
    <div className="max-w-3xl w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Seus projetos</h1>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Voltar
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(p.id)}
            className="text-left"
          >
            <Card className="hover:border-primary/60 transition-colors">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <FolderOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      atualizado em {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}

function NewProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')

  function handleCreate() {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed)
    setName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
          <DialogDescription>
            Dê um nome ao projeto. Você poderá escolher os módulos a seguir.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="project-name">Nome</Label>
          <Input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: A Lâmina que Lembra"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
