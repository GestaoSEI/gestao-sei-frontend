import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import {
  getProcessos,
  searchProcessos,
  filterProcessos,
  deleteProcesso,
  getRelatorio,
} from '../api'
import type { Processo } from '../types'

const STATUS_FILTROS = ['Em andamento', 'Respondido', 'Concluído', 'Encerrado', 'Expirado']

function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function statusClass(status: string): string {
  const s = status?.toLowerCase() ?? ''
  if (s === 'expirado') return 'badge badge-expirado'
  if (s === 'concluído' || s === 'encerrado' || s === 'respondido') return 'badge badge-ok'
  return 'badge badge-default'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const isAdmin = auth?.role === 'ADMIN'
  const [processos, setProcessos] = useState<Processo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [apenasVencidos, setApenasVencidos] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [sortPrazo, setSortPrazo] = useState<'asc' | 'desc' | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getProcessos()
      setProcessos(res.data)
    } catch {
      setError('Não foi possível carregar os processos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  /* Busca debounced */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!keyword.trim() && !filterStatus && !apenasVencidos) {
      fetchAll()
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        if (keyword.trim() && !filterStatus && !apenasVencidos) {
          const res = await searchProcessos(keyword.trim())
          setProcessos(res.data)
        } else {
          const params: Record<string, string | boolean> = {}
          if (filterStatus) params.status = filterStatus
          if (apenasVencidos) params.prazoExpirado = true
          const res = await filterProcessos(params)
          let results = res.data
          if (keyword.trim()) {
            const kw = keyword.trim().toLowerCase()
            results = results.filter((p: Processo) =>
              p.numeroProcesso?.toLowerCase().includes(kw) ||
              p.tipoProcesso?.toLowerCase().includes(kw) ||
              p.origem?.toLowerCase().includes(kw) ||
              p.unidadeAtual?.toLowerCase().includes(kw) ||
              p.observacao?.toLowerCase().includes(kw)
            )
          }
          setProcessos(results)
        }
      } catch {
        setError('Erro ao buscar processos.')
      } finally {
        setLoading(false)
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, filterStatus, apenasVencidos])

  async function handleDelete(numero: string, id: number) {
    if (!confirm(`Excluir processo ${numero}? Esta ação não pode ser desfeita.`)) return
    setDeletingId(id)
    try {
      await deleteProcesso(numero)
      setProcessos((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Não foi possível excluir o processo.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handlePdf() {
    setDownloadingPdf(true)
    try {
      const params: Record<string, string> = {}
      if (filterStatus) params.status = filterStatus
      if (apenasVencidos) params.prazoExpirado = 'true'
      if (keyword.trim()) params.keyword = keyword.trim()
      const res = await getRelatorio(params)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'relatorio-processos.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao gerar relatório PDF.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  function handleFilterStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    setFilterStatus(e.target.value)
  }

  function handleLimpar() {
    setKeyword('')
    setFilterStatus('')
    setApenasVencidos(false)
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Processos</h2>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handlePdf} disabled={downloadingPdf}>
            {downloadingPdf ? 'Gerando...' : '📄 Gerar PDF'}
          </button>
          {isAdmin && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/importar')}>
              📥 Importar CSV
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/processos/novo')}>
            + Novo Processo
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          type="search"
          placeholder="Buscar por número, tipo, origem, unidade..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={filterStatus} onChange={handleFilterStatusChange} aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          {STATUS_FILTROS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={apenasVencidos}
            onChange={(e) => setApenasVencidos(e.target.checked)}
          />
          Apenas Vencidos
        </label>
        <button className="btn btn-secondary btn-sm" onClick={handleLimpar} title="Limpar filtros">
          ↺ Limpar
        </button>
      </div>

      {error && <p className="message message-error">{error}</p>}

      {loading ? (
        <p className="loading">Carregando...</p>
      ) : processos.length === 0 ? (
        <div className="empty-state">
          {keyword.trim() || filterStatus || apenasVencidos ? (
            <p>Nenhum processo encontrado para os filtros aplicados.</p>
          ) : (
            <>
              <p>Nenhum processo cadastrado.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/processos/novo')}>
                Cadastrar primeiro processo
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Origem</th>
                <th>Unidade Atual</th>
                <th>Status</th>
                <th
                  className="th-sortable"
                  onClick={() => setSortPrazo((s) => (s === 'desc' ? 'asc' : 'desc'))}
                  title="Ordenar por Prazo Final"
                >
                  Prazo Final {sortPrazo === 'asc' ? '▲' : sortPrazo === 'desc' ? '▼' : '⇅'}
                </th>
                <th>Observação</th>
                <th>Urgência</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {[...processos]
                .sort((a, b) => {
                  if (!sortPrazo) return 0
                  const da = a.dataPrazoFinal ? new Date(a.dataPrazoFinal).getTime() : Infinity
                  const db = b.dataPrazoFinal ? new Date(b.dataPrazoFinal).getTime() : Infinity
                  return sortPrazo === 'asc' ? da - db : db - da
                })
                .map((p) => (
                <tr key={p.id} className={p.duplicata ? 'row-duplicata' : p.alertaUrgencia ? 'row-urgente' : ''}>
                  <td className="mono" title={p.numeroProcesso}>{p.numeroProcesso}</td>
                  <td>{p.tipoProcesso}</td>
                  <td>{p.origem}</td>
                  <td>{p.unidadeAtual}</td>
                  <td className="status-cell">
                    <span className={statusClass(p.status)} title={p.status}>{p.status}</span>
                  </td>
                  <td>{formatDate(p.dataPrazoFinal)}</td>
                  <td className="obs-cell" title={p.observacao ?? ''}>{p.observacao || '—'}</td>
                  <td>
                    {p.duplicata ? (
                      <span className="badge badge-duplicata">Duplicata</span>
                    ) : p.alertaUrgencia ? (
                      <span className="badge badge-urgente">⚠ Urgente</span>
                    ) : (
                      <span className="badge badge-ok">Normal</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate(`/processos/editar/${encodeURIComponent(p.numeroProcesso)}`, {
                          state: { processo: p },
                        })
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/processos/historico/${p.id}`)}
                    >
                      Histórico
                    </button>
                    {isAdmin && p.duplicata && (
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.numeroProcesso, p.id)}
                        title="Excluir duplicata"
                      >
                        {deletingId === p.id ? '...' : 'Excluir'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-count">{processos.length} processo(s) encontrado(s)</p>
        </div>
      )}
    </>
  )
}
