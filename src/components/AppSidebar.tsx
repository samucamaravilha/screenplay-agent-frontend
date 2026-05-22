import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FolderOpen, LayoutGrid, Loader2, LogOut, Plus, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { useProjects } from '@/lib/storage/hooks'

export function AppSidebar({ onNewProject }: { onNewProject?: () => void }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, loading } = useProjects()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card/30 flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          screenplay-agent
        </Link>
      </div>

      <div className="px-3 py-3">
        <Button
          size="sm"
          className="w-full justify-start"
          onClick={onNewProject ?? (() => navigate('/dashboard?new=1'))}
        >
          <Plus className="h-4 w-4 mr-2" /> Novo projeto
        </Button>
      </div>

      <nav className="px-2 flex-1 overflow-y-auto">
        <NavItem to="/dashboard" icon={LayoutGrid} active={location.pathname === '/dashboard'}>
          Dashboard
        </NavItem>

        <div className="mt-4 px-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Projetos
        </div>
        {loading ? (
          <div className="px-2 py-1 text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Carregando...
          </div>
        ) : projects.length === 0 ? (
          <div className="px-2 py-1 text-xs text-muted-foreground">
            Nenhum projeto ainda.
          </div>
        ) : (
          projects.slice(0, 10).map((p) => (
            <NavItem
              key={p.id}
              to={`/project/${p.id}`}
              icon={FolderOpen}
              active={location.pathname.startsWith(`/project/${p.id}`)}
            >
              <span className="truncate">{p.name}</span>
            </NavItem>
          ))
        )}
      </nav>

      <div className="border-t border-border px-3 py-3 space-y-2">
        <div className="text-xs text-muted-foreground truncate px-1">
          {user?.email}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start text-xs"
          onClick={handleSignOut}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" /> Sair
        </Button>
      </div>
    </aside>
  )
}

function NavItem({
  to,
  icon: Icon,
  active,
  children,
}: {
  to: string
  icon: typeof LayoutGrid
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </Link>
  )
}
