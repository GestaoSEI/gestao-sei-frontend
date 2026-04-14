import { useState, useMemo } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '../App'
import { authLogin, authResetPassword, getUserByLogin } from '../api'

function decodeJwtLogin(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? ''
  } catch {
    return ''
  }
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetLogin, setResetLogin] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const canLogin = useMemo(
    () => loginValue.trim().length > 0 && password.length > 0,
    [loginValue, password]
  )
  const canReset = useMemo(
    () => resetLogin.trim().length > 0 && resetPassword.length >= 4,
    [resetLogin, resetPassword]
  )

  function setOk(msg: string) {
    setIsError(false)
    setMessage(msg)
  }

  function setErr(msg: string) {
    setIsError(true)
    setMessage(msg)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!canLogin) return
    setLoading(true)
    setMessage('')
    try {
      const res = await authLogin(loginValue.trim(), password)
      const token = res.data.token
      const login = decodeJwtLogin(token)
      // Coloca o token temporariamente para a próxima chamada
      localStorage.setItem('gestaoSeiToken', token)
      const userRes = await getUserByLogin(login)
      signIn(token, login, userRes.data.role)
      navigate('/processos')
    } catch {
      localStorage.removeItem('gestaoSeiToken')
      setErr('Falha no login. Verifique o e-mail e a senha.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault()
    if (!canReset) return
    setLoading(true)
    setMessage('')
    try {
      await authResetPassword(resetLogin.trim(), resetPassword)
      setOk('Senha resetada com sucesso. Faça login com a nova senha.')
      setLoginValue(resetLogin.trim())
      setPassword('')
      setShowReset(false)
      setResetPassword('')
    } catch {
      setErr('Não foi possível resetar a senha. Verifique o e-mail informado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="login-theme-btn-wrap">
        <button type="button" className="btn-theme-login" onClick={toggleTheme} title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
          {theme === 'dark' ? '☀️ Tema claro' : '🌙 Tema escuro'}
        </button>
      </div>
      <header className="hero">
        <div className="login-logo-wrap">
          <img src="/logo.png" alt="Logo Gestão SEI" className="login-logo" />
        </div>
        <p className="eyebrow">Gestão SEI</p>
        <h1>Acesso ao Sistema</h1>
        <p className="subtitle">
          Faça login para acessar o sistema. O cadastro de novos usuários é realizado somente por um administrador.
        </p>
      </header>

      <section className="card" aria-live="polite">
          <>
            <form className="form" onSubmit={handleLogin}>
              <label htmlFor="login">E-mail</label>
              <input
                id="login"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder="seu e-mail cadastrado"
                autoComplete="username"
              />
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="sua senha"
                autoComplete="current-password"
              />
              <button type="submit" className="primary" disabled={!canLogin || loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <button
              type="button"
              className="ghost"
              onClick={() => setShowReset((v) => !v)}
              disabled={loading}
            >
              {showReset ? 'Cancelar' : 'Esqueci a senha / Resetar senha'}
            </button>

            {showReset && (
              <form className="form reset-form" onSubmit={handleResetPassword}>
                <label htmlFor="reset-login">E-mail para reset</label>
                <input
                  id="reset-login"
                  value={resetLogin}
                  onChange={(e) => setResetLogin(e.target.value)}
                  placeholder="seu e-mail cadastrado"
                  autoComplete="username"
                />
                <label htmlFor="reset-senha">Nova senha</label>
                <input
                  id="reset-senha"
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="mínimo 4 caracteres"
                  autoComplete="new-password"
                />
                <button type="submit" className="primary" disabled={!canReset || loading}>
                  {loading ? 'Resetando...' : 'Resetar senha'}
                </button>
              </form>
            )}
          </>

        {message && (
          <p className={isError ? 'message message-error' : 'message'}>{message}</p>
        )}
      </section>

      <footer className="footer-note">Backend: http://localhost:8081</footer>
    </main>
  )
}
