import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'

type Role = 'USER' | 'ADMIN'

const api = axios.create({
  baseURL: '/api'
})

function App() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loginValue, setLoginValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [newLogin, setNewLogin] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<Role>('USER')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const canLogin = useMemo(
    () => loginValue.trim().length > 0 && passwordValue.trim().length > 0,
    [loginValue, passwordValue]
  )

  const canRegister = useMemo(
    () =>
      newLogin.trim().length > 0 &&
      newPassword.trim().length >= 4 &&
      ['USER', 'ADMIN'].includes(newRole),
    [newLogin, newPassword, newRole]
  )

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canLogin) {
      setMessage('Preencha login e senha para entrar.')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await api.post('/auth/login', {
        login: loginValue.trim(),
        senha: passwordValue
      })
      const jwt = response.data?.token ?? ''
      setToken(jwt)
      localStorage.setItem('gestaoSeiToken', jwt)
      setMessage('Login realizado com sucesso.')
    } catch {
      setToken('')
      setMessage('Falha no login. Verifique login e senha.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canRegister) {
      setMessage('Preencha login, senha (min. 4) e perfil.')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      await api.post('/auth/register', {
        login: newLogin.trim(),
        senha: newPassword,
        role: newRole
      })
      setMessage('Usuário criado com sucesso. Agora você pode fazer login.')
      setTab('login')
      setLoginValue(newLogin)
      setPasswordValue('')
      setNewPassword('')
    } catch {
      setMessage('Não foi possível criar usuário. Login pode já existir.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Gestao SEI</p>
        <h1>Acesso ao Sistema</h1>
        <p className="subtitle">
          Faça login para acessar a aplicação ou crie uma nova conta de usuário/administrador.
        </p>
      </header>

      <section className="card" aria-live="polite">
        <div className="tabs">
          <button
            type="button"
            className={tab === 'login' ? 'tab active' : 'tab'}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={tab === 'register' ? 'tab active' : 'tab'}
            onClick={() => setTab('register')}
          >
            Criar usuário
          </button>
        </div>

        {tab === 'login' ? (
          <form className="form" onSubmit={handleLogin}>
            <label htmlFor="login">Login</label>
            <input
              id="login"
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              placeholder="ex.: admin"
              autoComplete="username"
            />

            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={passwordValue}
              onChange={(event) => setPasswordValue(event.target.value)}
              placeholder="sua senha"
              autoComplete="current-password"
            />

            <button type="submit" className="primary" disabled={!canLogin || loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleRegister}>
            <label htmlFor="novo-login">Login</label>
            <input
              id="novo-login"
              value={newLogin}
              onChange={(event) => setNewLogin(event.target.value)}
              placeholder="novo login"
              autoComplete="username"
            />

            <label htmlFor="nova-senha">Senha</label>
            <input
              id="nova-senha"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="mínimo 4 caracteres"
              autoComplete="new-password"
            />

            <label htmlFor="perfil">Perfil</label>
            <select
              id="perfil"
              value={newRole}
              onChange={(event) => setNewRole(event.target.value as Role)}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <button type="submit" className="primary" disabled={!canRegister || loading}>
              {loading ? 'Criando...' : 'Criar usuário'}
            </button>
          </form>
        )}

        {message && <p className="message">{message}</p>}

        <div className="token-block">
          <p>Token atual</p>
          <textarea
            value={token || localStorage.getItem('gestaoSeiToken') || ''}
            readOnly
            placeholder="Após o login, o token JWT aparecerá aqui."
          />
        </div>
      </section>

      <footer className="footer-note">Backend: http://localhost:8081</footer>
    </main>
  )
}

export default App
