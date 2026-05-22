import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Hero />
    </div>
  )
}

function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>screenplay-agent</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Criar conta</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <main className="flex-1 flex items-center">
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Em desenvolvimento · v1
        </div>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          Roteiros de manhwa vertical,
          <br />
          do beat ao episódio.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Componha uma série a partir de escolhas estruturadas e gere roteiros
          episódio por episódio, otimizados pro formato curto.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button size="lg" asChild>
            <Link to="/signup">Começar agora</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Já tenho conta</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
