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
  exportarProcessosCsv,
} from '../api'
import type { Processo } from '../types'

const STATUS_FILTROS = ['Em andamento', 'Prazo próximo', 'Respondido', 'Concluído', 'Encerrado', 'Expirado']
const STATUS_GRAFICO = ['Em andamento', 'Prazo próximo', 'Respondido', 'Concluído', 'Encerrado', 'Expirado']

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

function percentual(parte: number, total: number): string {
  return total === 0 ? '0%' : `${Math.round((parte / total) * 100)}%`
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
  const [filterUnidade, setFilterUnidade] = useState('')
  const [apenasVencidos, setApenasVencidos] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)
  const [sortPrazo, setSortPrazo] = useState<'desc' | 'asc'>('desc')
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
    if (!keyword.trim() && !filterStatus && !filterUnidade && !apenasVencidos) {
      fetchAll()
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        if (keyword.trim() && !filterStatus && !filterUnidade && !apenasVencidos) {
          const res = await searchProcessos(keyword.trim())
          setProcessos(res.data)
        } else {
          const params: Record<string, string | boolean> = {}
          if (filterStatus) params.status = filterStatus
          if (filterUnidade) params.unidade = filterUnidade
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
  }, [keyword, filterStatus, filterUnidade, apenasVencidos])

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
      if (filterUnidade) params.unidade = filterUnidade
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

  async function handleExportCsv() {
    setExportingCsv(true)
    try {
      const res = await exportarProcessosCsv()
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'processos.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao exportar processos para CSV.')
    } finally {
      setExportingCsv(false)
    }
  }

  function handleFilterStatusChange(e: ChangeEvent<HTMLSelectElement>) {
    setFilterStatus(e.target.value)
  }

  function handleFilterUnidadeChange(e: ChangeEvent<HTMLSelectElement>) {
    setFilterUnidade(e.target.value)
  }

  function handleLimpar() {
    setKeyword('')
    setFilterStatus('')
    setFilterUnidade('')
    setApenasVencidos(false)
  }

  const statusCounts = STATUS_GRAFICO.map((status) => ({
    status,
    total: processos.filter((processo) => processo.status?.toLowerCase() === status.toLowerCase()).length,
  }))
  const unidadeCounts = Object.entries(
    processos.reduce<Record<string, number>>((counts, processo) => {
      const unidade = processo.unidadeAtual || 'Sem unidade'
      counts[unidade] = (counts[unidade] ?? 0) + 1
      return counts
    }, {}),
  )
    .sort(([, totalA], [, totalB]) => totalB - totalA)
    .slice(0, 6)
  const totalProcessos = processos.length
  const totalExpirados = statusCounts.find(({ status }) => status === 'Expirado')?.total ?? 0
  const totalConcluidos = (statusCounts.find(({ status }) => status === 'Concluído')?.total ?? 0)
    + (statusCounts.find(({ status }) => status === 'Encerrado')?.total ?? 0)
  const totalPrazoProximo = statusCounts.find(({ status }) => status === 'Prazo próximo')?.total ?? 0
  const maiorUnidadeTotal = unidadeCounts[0]?.[1] ?? 1
  const unidadesDisponiveis = Array.from(new Set(processos.map((processo) => processo.unidadeAtual).filter(Boolean))).sort()
  const percentualPrazoProximo = percentual(totalPrazoProximo, totalProcessos)
  const percentualExpirados = percentual(totalExpirados, totalProcessos)
  const percentualConcluidos = percentual(totalConcluidos, totalProcessos)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const prazoCounts = Object.entries(
    processos.reduce<Record<string, number>>((counts, processo) => {
      if (!processo.dataPrazoFinal) {
        counts['Sem prazo definido'] = (counts['Sem prazo definido'] ?? 0) + 1
        return counts
      }
      const dataPrazo = new Date(`${processo.dataPrazoFinal}T00:00:00`)
      const diasAtePrazo = Math.ceil((dataPrazo.getTime() - hoje.getTime()) / 86400000)
      const faixa = diasAtePrazo < 0
        ? 'Vencidos'
        : diasAtePrazo <= 5
          ? 'Vencendo em até 5 dias'
          : 'Prazo acima de 5 dias'
      counts[faixa] = (counts[faixa] ?? 0) + 1
      return counts
    }, {}),
  )
  const prazoLabels = ['Vencidos', 'Vencendo em até 5 dias', 'Prazo acima de 5 dias', 'Sem prazo definido']
  const maiorPrazoTotal = Math.max(...prazoLabels.map((label) => prazoCounts.find(([prazo]) => prazo === label)?.[1] ?? 0), 1)

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Processos</h2>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={handlePdf} disabled={downloadingPdf}>
            {downloadingPdf ? 'Gerando PDF...' : '📄 Gerar PDF'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv} disabled={exportingCsv}>
            {exportingCsv ? 'Exportando CSV...' : '📊 Exportar CSV'}
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
        <select value={filterUnidade} onChange={handleFilterUnidadeChange} aria-label="Filtrar por unidade">
          <option value="">Todas as unidades</option>
          {unidadesDisponiveis.map((unidade) => (
            <option key={unidade} value={unidade}>{unidade}</option>
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
      ) : (
        <>
          <section className="dashboard-summary" aria-label="Resumo dos processos">
            <div className="summary-card">
              <span className="summary-label">Processos no recorte</span>
              <strong>{totalProcessos}</strong>
              <span className="summary-percent">100%</span>
              <span className="summary-detail">resultado(s) atual(is)</span>
            </div>
            <div className="summary-card summary-card-warning">
              <span className="summary-label">Prazo próximo</span>
              <strong>{totalPrazoProximo}</strong>
              <span className="summary-percent">{percentualPrazoProximo}</span>
              <span className="summary-detail">atenção nos próximos dias</span>
            </div>
            <div className="summary-card summary-card-danger">
              <span className="summary-label">Expirados</span>
              <strong>{totalExpirados}</strong>
              <span className="summary-percent">{percentualExpirados}</span>
              <span className="summary-detail">processo(s) vencido(s)</span>
            </div>
            <div className="summary-card summary-card-success">
              <span className="summary-label">Concluídos ou encerrados</span>
              <strong>{totalConcluidos}</strong>
              <span className="summary-percent">{percentualConcluidos}</span>
              <span className="summary-detail">processo(s) finalizado(s)</span>
            </div>
          </section>

          {processos.length > 0 && (
            <section className="dashboard-charts" aria-label="Estatísticas dos processos">
              <div className="chart-panel">
                <div className="chart-heading">
                  <div>
                    <span className="eyebrow">Distribuição</span>
                    <h3>Processos por status</h3>
                  </div>
                  <span className="chart-total">{totalProcessos} total</span>
                </div>
                <div className="bar-chart">
                  {statusCounts.map(({ status, total }) => (
                    <button className="bar-row chart-bar-button" key={status} onClick={() => { setFilterStatus(status); setFilterUnidade('') }} title={`Filtrar por status: ${status}`}>
                      <span className="bar-label">{status}</span>
                      <div className="bar-track"><span className={`bar-fill bar-${status.toLowerCase().replaceAll(' ', '-').replace('ê', 'e')}`} style={{ width: `${totalProcessos ? (total / totalProcessos) * 100 : 0}%` }} /></div>
                      <strong className="bar-value">{total}</strong>
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-panel">
                <div className="chart-heading">
                  <div>
                    <span className="eyebrow">Distribuição</span>
                    <h3>Processos por unidade</h3>
                  </div>
                  <span className="chart-total">top {unidadeCounts.length}</span>
                </div>
                <div className="bar-chart">
                  {unidadeCounts.map(([unidade, total]) => (
                    <button className="bar-row chart-bar-button" key={unidade} onClick={() => { setFilterUnidade(unidade); setFilterStatus('') }} title={`Filtrar por unidade: ${unidade}`}>
                      <span className="bar-label" title={unidade}>{unidade}</span>
                      <div className="bar-track"><span className="bar-fill bar-fill-unit" style={{ width: `${(total / maiorUnidadeTotal) * 100}%` }} /></div>
                      <strong className="bar-value">{total}</strong>
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-panel chart-panel-wide">
                <div className="chart-heading">
                  <div>
                    <span className="eyebrow">Acompanhamento</span>
                    <h3>Distribuição por prazo</h3>
                  </div>
                  <span className="chart-total">hoje</span>
                </div>
                <div className="bar-chart deadline-chart">
                  {prazoLabels.map((label) => {
                    const total = prazoCounts.find(([prazo]) => prazo === label)?.[1] ?? 0
                    const colorClass = label === 'Vencidos'
                      ? 'bar-expirado'
                      : label === 'Vencendo em até 5 dias'
                        ? 'bar-prazo-proximo'
                        : label === 'Sem prazo definido' ? 'bar-no-deadline' : 'bar-fill-unit'
                    return (
                      <div className="bar-row" key={label}>
                        <span className="bar-label">{label}</span>
                        <div className="bar-track"><span className={`bar-fill ${colorClass}`} style={{ width: `${(total / maiorPrazoTotal) * 100}%` }} /></div>
                        <strong className="bar-value">{total}</strong>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {processos.length === 0 ? (
          <div className="empty-state">
            {keyword.trim() || filterStatus || filterUnidade || apenasVencidos ? (
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
                    Prazo Final {sortPrazo === 'desc' ? '▼' : '▲'}
                  </th>
                  <th>Observação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {[...processos]
                  .sort((a, b) => {
                    const hasA = !!a.dataPrazoFinal
                    const hasB = !!b.dataPrazoFinal
                    if (!hasA && !hasB) return 0
                    if (!hasA) return 1
                    if (!hasB) return -1
                    const da = new Date(a.dataPrazoFinal).getTime()
                    const db = new Date(b.dataPrazoFinal).getTime()
                    return sortPrazo === 'desc' ? db - da : da - db
                  })
                  .map((p) => (
                  <tr key={p.id} className={p.duplicata ? 'row-duplicata' : ''}>
                    <td className="mono" title={p.numeroProcesso}>
                      {p.numeroProcesso}
                      {p.duplicata && <span className="badge badge-duplicata" style={{ marginLeft: '8px' }}>Duplicata</span>}
                    </td>
                    <td>{p.tipoProcesso}</td>
                    <td>{p.origem}</td>
                    <td>{p.unidadeAtual}</td>
                    <td className="status-cell">
                      <span className={statusClass(p.status)} title={p.status}>{p.status}</span>
                    </td>
                    <td>{formatDate(p.dataPrazoFinal)}</td>
                    <td className="obs-cell" title={p.observacao ?? ''}>{p.observacao || '—'}</td>
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
      )}
    </>
  )
}
