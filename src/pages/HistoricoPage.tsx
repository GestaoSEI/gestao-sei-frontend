import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getHistorico } from '../api'
import type { HistoricoItem } from '../types'

function formatDateTime(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function diff(before: string, after: string) {
  if (before === after) return <span>{after}</span>
  return (
    <span>
      <span className="diff-before">{before || '—'}</span>
      {' → '}
      <span className="diff-after">{after || '—'}</span>
    </span>
  )
}

export default function HistoricoPage() {
  const navigate = useNavigate()
  const { processoId } = useParams<{ processoId: string }>()
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!processoId) {
      navigate('/processos', { replace: true })
      return
    }
    const id = parseInt(processoId, 10)
    if (isNaN(id)) {
      navigate('/processos', { replace: true })
      return
    }
    getHistorico(id)
      .then((res) => setHistorico(res.data))
      .catch(() => setError('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false))
  }, [processoId, navigate])

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Histórico do Processo</h2>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/processos')}>
            ← Voltar para Processos
          </button>
        </div>
      </div>

      {error && <p className="message message-error">{error}</p>}

      {loading ? (
        <p className="loading">Carregando histórico...</p>
      ) : historico.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma alteração registrada para este processo.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Usuário</th>
                <th>Status</th>
                <th>Unidade</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((h) => (
                <tr key={h.id}>
                  <td className="nowrap">{formatDateTime(h.dataAtualizacao)}</td>
                  <td>{h.usuarioLogin}</td>
                  <td>{diff(h.statusAnterior, h.statusNovo)}</td>
                  <td>{diff(h.unidadeAnterior, h.unidadeNova)}</td>
                  <td>{h.observacaoDaMudanca ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-count">{historico.length} registro(s)</p>
        </div>
      )}
    </>
  )
}
