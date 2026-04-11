import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, alterarSenha, getRelatorioUsuarios } from '../api'
import type { Usuario, Role } from '../types'

type FormState = {
  login: string
  role: Role
}

type SenhaForm = {
  novaSenha: string
  confirma: string
}

const EMPTY: FormState = { login: '', role: 'USER' }
const EMPTY_SENHA: SenhaForm = { novaSenha: '', confirma: '' }

export default function UsuariosPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()

  // Proteção ADMIN
  useEffect(() => {
    if (auth?.role !== 'ADMIN') {
      navigate('/processos', { replace: true })
    }
  }, [auth, navigate])

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  // reset de senha de outro usuário (ADMIN)
  const [senhaParaId, setSenhaParaId] = useState<{ id: number; login: string } | null>(null)
  const [senhaForm, setSenhaForm] = useState<SenhaForm>(EMPTY_SENHA)
  const [senhaFormError, setSenhaFormError] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    getUsuarios()
      .then((res) => setUsuarios(res.data))
      .catch(() => setError('Não foi possível carregar os usuários.'))
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditId(null)
    setForm(EMPTY)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(u: Usuario) {
    setEditId(u.id)
    setForm({ login: u.login, role: u.role })
    setFormError('')
    setShowForm(true)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFormError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.login.trim()) {
      setFormError('Login é obrigatório.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editId !== null) {
        const res = await updateUsuario(editId, { login: form.login.trim(), role: form.role })
        setUsuarios((prev) => prev.map((u) => (u.id === editId ? res.data : u)))
      } else {
        const res = await createUsuario({ login: form.login.trim(), role: form.role })
        setUsuarios((prev) => [...prev, res.data])
      }
      setShowForm(false)
      setForm(EMPTY)
    } catch {
      setFormError(
        editId !== null
          ? 'Erro ao atualizar usuário. Login pode já estar em uso.'
          : 'Erro ao criar usuário. Login pode já existir.'
      )
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setShowForm(false)
    setForm(EMPTY)
    setFormError('')
  }

  async function handleDelete(u: Usuario) {
    if (!confirm(`Excluir o usuário "${u.login}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(u.id)
    try {
      await deleteUsuario(u.id)
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id))
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alert(msg ?? 'Não foi possível excluir o usuário. Ele pode ter registros no histórico de processos.')
    } finally {
      setDeletingId(null)
    }
  }

  function openSenhaForm(u: Usuario) {
    setSenhaParaId({ id: u.id, login: u.login })
    setSenhaForm(EMPTY_SENHA)
    setSenhaFormError('')
  }

  async function handlePdf() {
    setDownloadingPdf(true)
    try {
      const res = await getRelatorioUsuarios()
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'relatorio-usuarios.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao gerar relatório PDF.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  async function handleResetSenha(e: FormEvent) {
    e.preventDefault()
    if (!senhaParaId) return
    if (senhaForm.novaSenha.length < 4) {
      setSenhaFormError('Nova senha deve ter no mínimo 4 caracteres.')
      return
    }
    if (senhaForm.novaSenha !== senhaForm.confirma) {
      setSenhaFormError('As senhas não coincidem.')
      return
    }
    setSalvandoSenha(true)
    setSenhaFormError('')
    try {
      // ADMIN não precisa de senhaAtual - envia undefined
      await alterarSenha(senhaParaId.id, undefined, senhaForm.novaSenha)
      setSenhaParaId(null)
    } catch {
      setSenhaFormError('Erro ao definir a nova senha.')
    } finally {
      setSalvandoSenha(false)
    }
  }

  if (auth?.role !== 'ADMIN') return null

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Gestão de Usuários</h2>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handlePdf} disabled={downloadingPdf}>
            {downloadingPdf ? 'Gerando...' : '📄 Gerar PDF'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            + Novo Usuário
          </button>
        </div>
      </div>

      {error && <p className="message message-error">{error}</p>}

      {showForm && (
        <div className="form-card form-inline">
          <h3>{editId !== null ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          {formError && <p className="message message-error">{formError}</p>}
          <form className="form form-usuario" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="u-login">Login *</label>
                <input
                  id="u-login"
                  name="login"
                  value={form.login}
                  onChange={handleChange}
                  placeholder="login do usuário"
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="u-role">Perfil</label>
                <select
                  id="u-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            {editId === null && (
              <p className="field-hint">
                Senha padrão: <strong>senha123</strong> — solicite troca no primeiro acesso.
              </p>
            )}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : editId !== null ? 'Salvar alterações' : 'Criar usuário'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="loading">Carregando usuários...</p>
      ) : usuarios.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Login</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.login}</td>
                  <td>
                    <span className={u.role === 'ADMIN' ? 'badge badge-admin' : 'badge badge-default'}>
                      {u.role}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn btn-primary btn-sm" onClick={() => openEdit(u)}>
                      Editar
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => openSenhaForm(u)}>
                      🔑 Senha
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={deletingId === u.id}
                      onClick={() => handleDelete(u)}
                    >
                      {deletingId === u.id ? '...' : 'Excluir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-count">{usuarios.length} usuário(s)</p>
        </div>
      )}

      {senhaParaId && (
        <div className="modal-overlay" onClick={() => setSenhaParaId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Redefinir senha — {senhaParaId.login}</h3>
            {senhaFormError && <p className="message message-error">{senhaFormError}</p>}
            <form className="form" onSubmit={handleResetSenha}>
              <label htmlFor="rs-nova">Nova senha</label>
              <input
                id="rs-nova"
                type="password"
                value={senhaForm.novaSenha}
                onChange={(e) => setSenhaForm((prev) => ({ ...prev, novaSenha: e.target.value }))}
                placeholder="mínimo 4 caracteres"
                autoComplete="new-password"
              />
              <label htmlFor="rs-confirma">Confirmar senha</label>
              <input
                id="rs-confirma"
                type="password"
                value={senhaForm.confirma}
                onChange={(e) => setSenhaForm((prev) => ({ ...prev, confirma: e.target.value }))}
                placeholder="repita a nova senha"
                autoComplete="new-password"
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={salvandoSenha}>
                  {salvandoSenha ? 'Salvando...' : 'Definir senha'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSenhaParaId(null)}
                  disabled={salvandoSenha}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
