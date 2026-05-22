import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Layers, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { listProjects } from '@/lib/projects'

type Item = {
  to: string
  label: string
  icon: typeof FileText
  disabled?: boolean
}

export function Sidebar({ seriesId }: { seriesId?: string }) {
  const navigate = useNavigate()
  const project = seriesId
    ? listProjects().find((p) => p.seriesId === seriesId)
    : undefined

  const items: Item[] = [
    {
      to: seriesId ? `/series/${seriesId}/arc` : '/arc',
      label: 'Arc Overview',
      icon: Layers,
      disabled: !seriesId,
    },
    {
      to: seriesId ? `/series/${seriesId}/episode/1` : '/episode',
      label: 'Episode Studio',
      icon: Play,
      disabled: !seriesId,
    },
  ]

  return (
    <aside className="w-16 shrink-0 border-r border-border bg-card/40 flex flex-col items-center py-4 gap-2">
      <button
        type="button"
        onClick={() => navigate(project ? `/project/${project.id}` : '/dashboard')}
        title={project ? `Voltar a ${project.name}` : 'Voltar ao dashboard'}
        className="h-9 w-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="text-xs font-bold tracking-widest text-muted-foreground rotate-180 [writing-mode:vertical-rl] my-3">
        STORY · WORKSHOP
      </div>
      {items.map(({ to, label, icon: Icon, disabled }) => (
        <NavLink
          key={label}
          to={disabled ? '#' : to}
          onClick={(e) => disabled && e.preventDefault()}
          title={label}
          className={({ isActive }) =>
            cn(
              'h-11 w-11 rounded-md flex items-center justify-center transition-colors',
              disabled && 'opacity-30 cursor-not-allowed',
              !disabled && 'hover:bg-accent',
              isActive && !disabled && 'bg-accent text-accent-foreground',
            )
          }
        >
          <Icon className="h-5 w-5" />
        </NavLink>
      ))}
    </aside>
  )
}
