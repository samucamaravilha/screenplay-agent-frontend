import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'

import { ArcOverview } from '@/components/ArcOverview'
import { EpisodeStudio } from '@/components/EpisodeStudio'
import { SeriesSetup } from '@/components/SeriesSetup'
import { Sidebar } from '@/components/Sidebar'
import { listSeries } from '@/lib/storage'

function SidebarWrapper() {
  const { seriesId } = useParams<{ seriesId: string }>()
  return <Sidebar seriesId={seriesId} />
}

function Shell() {
  return (
    <div className="flex min-h-screen">
      <SidebarWrapper />
      <main className="flex-1">
        <Routes>
          <Route index element={<RootRedirect />} />
          <Route path="setup" element={<SeriesSetup />} />
          <Route path="series/:seriesId/arc" element={<ArcOverview />} />
          <Route
            path="series/:seriesId/episode/:episodeNumber"
            element={<EpisodeStudio />}
          />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function RootRedirect() {
  const series = listSeries()
  if (series.length === 0) return <Navigate to="/setup" replace />
  return <Navigate to={`/series/${series[0].id}/arc`} replace />
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}

export default App
