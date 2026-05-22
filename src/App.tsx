import { useEffect, useState } from 'react'
import { apiGet } from './lib/api'

type Health = { status: string }

function App() {
  const [health, setHealth] = useState<string>('checking...')

  useEffect(() => {
    apiGet<Health>('/api/health')
      .then((d) => setHealth(d.status))
      .catch((e) => setHealth(`error: ${e.message}`))
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          screenplay-agent
        </h1>
        <p className="text-neutral-400">
          Backend health:{' '}
          <span className="font-mono text-emerald-400">{health}</span>
        </p>
      </div>
    </main>
  )
}

export default App
