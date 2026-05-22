import { NavLink } from 'react-router-dom'
import { FileText, Layers, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

type Item = {
  to: string
  label: string
  icon: typeof FileText
  disabled?: boolean
}

export function Sidebar({ seriesId }: { seriesId?: string }) {
  const items: Item[] = [
    { to: '/setup', label: 'Series Setup', icon: FileText },
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
      <div className="text-xs font-bold tracking-widest text-muted-foreground rotate-180 [writing-mode:vertical-rl] mb-3">
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
