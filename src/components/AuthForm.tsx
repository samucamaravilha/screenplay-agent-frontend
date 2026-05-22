import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useAuth } from '@/lib/auth'

type Mode = 'login' | 'signup'

export function AuthForm({ mode }: { mode: Mode }) {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const isLogin = mode === 'login'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        const { needsConfirmation } = await signUp(email, password)
        if (needsConfirmation) {
          setInfo('Confira seu email para confirmar a conta antes de entrar.')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <Link to="/" className="flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Sparkles className="h-4 w-4" />
        screenplay-agent
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isLogin ? 'Entrar' : 'Criar conta'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@dominio.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Mínimo 6 caracteres.
                </p>
              )}
            </div>
            {error && (
              <div className="text-sm text-destructive border border-destructive/40 rounded-md px-3 py-2 bg-destructive/5">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm text-foreground border border-border rounded-md px-3 py-2 bg-muted/40">
                {info}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <div className="text-xs text-muted-foreground text-center mt-4">
            {isLogin ? (
              <>
                Ainda não tem conta?{' '}
                <Link to="/signup" className="text-foreground underline underline-offset-2">
                  Criar conta
                </Link>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <Link to="/login" className="text-foreground underline underline-offset-2">
                  Entrar
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
