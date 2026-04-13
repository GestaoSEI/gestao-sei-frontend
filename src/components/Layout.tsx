import { useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth, useTheme } from '../App'
import { alterarSenha } from '../api'

export default function Layout() {
  const { auth, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showSenhaModal, setShowSenhaModal] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [senhaError, setSenhaError] = useState('')
  const [senhaOk, setSenhaOk] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  function handleLogout() {
    signOut()
    navigate('/login')
  }

  function openSenhaModal() {
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmaSenha('')
    setSenhaError('')
    setSenhaOk('')
    setShowSenhaModal(true)
  }

  async function handleAlterarSenha(e: FormEvent) {
    e.preventDefault()
    if (novaSenha.length < 4) {
      setSenhaError('Nova senha deve ter no mínimo 4 caracteres.')
      return
    }
    if (novaSenha !== confirmaSenha) {
      setSenhaError('As senhas não coincidem.')
      return
    }
    if (!auth) return
    setSalvandoSenha(true)
    setSenhaError('')
    try {
      // Precisamos do ID do usuário; buscamos via getUserByLogin não é necessário
      // pois o backend identifica pelo token — mas o endpoint usa {id}.
      // Buscamos o id que foi guardado no contexto (precisamos adicioná-lo).
      // Por ora usamos o endpoint /api/usuarios/login/{login} para obter o id.
      const { getUserByLogin } = await import('../api')
      const res = await getUserByLogin(auth.login)
      await alterarSenha(res.data.id, senhaAtual || undefined, novaSenha)
      setSenhaOk('Senha alterada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmaSenha('')
    } catch {
      setSenhaError('Não foi possível alterar a senha. Verifique a senha atual.')
    } finally {
      setSalvandoSenha(false)
    }
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Logo Gestão SEI" className="sidebar-logo" />
          <span className="sidebar-title">Gestão SEI</span>
        </div>

        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/processos"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              📋 Processos
            </NavLink>
          </li>
          {auth?.role === 'ADMIN' && (
            <li>
              <NavLink
                to="/usuarios"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                👥 Usuários
              </NavLink>
            </li>
          )}
          {auth?.role === 'ADMIN' && (
            <li>
              <NavLink
                to="/importar"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                📥 Importar CSV
              </NavLink>
            </li>
          )}
        </ul>

        <div className="sidebar-footer">
          <span className="sidebar-user">{auth?.login}</span>
          <span className="sidebar-role-badge">{auth?.role}</span>
          <button type="button" className="btn-theme" onClick={toggleTheme} title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
            {theme === 'dark' ? '☀️ Tema claro' : '🌙 Tema escuro'}
          </button>
          <button type="button" className="btn-senha" onClick={openSenhaModal}>
            🔑 Alterar senha
          </button>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>

      <main className="content">
        <Outlet />
      </main>

      {showSenhaModal && (
        <div className="modal-overlay" onClick={() => setShowSenhaModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Alterar minha senha</h3>
            {senhaError && <p className="message message-error">{senhaError}</p>}
            {senhaOk && <p className="message">{senhaOk}</p>}
            <form className="form" onSubmit={handleAlterarSenha}>
              {auth?.role !== 'ADMIN' && (
                <>
                  <label htmlFor="senha-atual">Senha atual</label>
                  <input
                    id="senha-atual"
                    type="password"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="sua senha atual"
                    autoComplete="current-password"
                  />
                </>
              )}
              <label htmlFor="nova-senha-modal">Nova senha</label>
              <input
                id="nova-senha-modal"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="mínimo 4 caracteres"
                autoComplete="new-password"
              />
              <label htmlFor="confirma-senha-modal">Confirmar nova senha</label>
              <input
                id="confirma-senha-modal"
                type="password"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="repita a nova senha"
                autoComplete="new-password"
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={salvandoSenha}>
                  {salvandoSenha ? 'Salvando...' : 'Alterar senha'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSenhaModal(false)}
                  disabled={salvandoSenha}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
