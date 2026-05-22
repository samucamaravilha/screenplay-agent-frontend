import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { ArcOverview } from '@/components/ArcOverview'
import { AuthForm } from '@/components/AuthForm'
import { Dashboard } from '@/components/Dashboard'
import { EpisodeStudio } from '@/components/EpisodeStudio'
import { Landing } from '@/components/Landing'
import { ProjectGrid } from '@/components/ProjectGrid'
import { SeriesSetup } from '@/components/SeriesSetup'
import { Sidebar } from '@/components/Sidebar'
import { AuthProvider, useAuth } from '@/lib/auth'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (session) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function WorkshopShell({ children }: { children: React.ReactNode }) {
  const { seriesId } = useParams<{ seriesId: string }>()
  return (
    <div className="flex min-h-screen">
      <Sidebar seriesId={seriesId} />
      <main className="flex-1">{children}</main>
    </div>
  )
}

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <AuthForm mode="login" />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed>
            <AuthForm mode="signup" />
          </RedirectIfAuthed>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/project/:projectId"
        element={
          <RequireAuth>
            <ProjectGrid />
          </RequireAuth>
        }
      />
      <Route
        path="/project/:projectId/setup"
        element={
          <RequireAuth>
            <WorkshopShell>
              <SeriesSetup />
            </WorkshopShell>
          </RequireAuth>
        }
      />

      <Route
        path="/series/:seriesId/arc"
        element={
          <RequireAuth>
            <WorkshopShell>
              <ArcOverview />
            </WorkshopShell>
          </RequireAuth>
        }
      />
      <Route
        path="/series/:seriesId/episode/:episodeNumber"
        element={
          <RequireAuth>
            <WorkshopShell>
              <EpisodeStudio />
            </WorkshopShell>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routing />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
