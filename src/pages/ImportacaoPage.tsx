import { useState, useRef } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { importarProcessos } from '../api'
import type { ImportacaoResultado } from '../types'

export default function ImportacaoPage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<ImportacaoResultado | null>(null)
  const [erro, setErro] = useState('')

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setArquivo(file)
    setResultado(null)
    setErro('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!arquivo) {
      setErro('Selecione um arquivo CSV antes de importar.')
      return
    }
    setEnviando(true)
    setErro('')
    setResultado(null)
    try {
      const res = await importarProcessos(arquivo)
      setResultado(res.data)
      if (inputRef.current) inputRef.current.value = ''
      setArquivo(null)
    } catch {
      setErro('Erro ao enviar o arquivo. Verifique o formato e tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Importar Processos via CSV</h2>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/processos')}>
            ← Voltar
          </button>
        </div>
      </div>

      <div className="form-card">
        <p className="importacao-desc">
          Importe processos a partir de um arquivo CSV seguindo o modelo abaixo. Processos cujo
          número já exista no sistema serão marcados como <strong>Duplicata</strong> para revisão —
          apenas esses poderão ser excluídos. Processos novos são cadastrados normalmente.
        </p>

        <div className="importacao-modelo">
          NumeroProcesso,TipoProcesso,Origem,UnidadeAtual,Status,DataPrazoFinal,Observacao
          <br />
          6024.2023/0001234-5,Ofício,Protocolo Geral,CREAS NPJ,Em andamento,2026-12-31,Opcional
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="csv-file">Arquivo CSV</label>
          <input
            id="csv-file"
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="importacao-file-input"
          />

          {erro && <p className="message message-error">{erro}</p>}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={enviando || !arquivo}
            >
              {enviando ? 'Importando...' : '📥 Importar'}
            </button>
          </div>
        </form>

        {resultado && (
          <div className="importacao-resultado">
            <h3 className="importacao-resultado-title">Resultado da Importação</h3>
            <div className="importacao-stats">
              <div className="importacao-stat importacao-stat-ok">
                <div className="importacao-stat-num">{resultado.importados}</div>
                <div className="importacao-stat-label">Importados</div>
              </div>
              <div className="importacao-stat importacao-stat-dup">
                <div className="importacao-stat-num">{resultado.duplicatas}</div>
                <div className="importacao-stat-label">Marcados como Duplicata</div>
              </div>
              <div className={`importacao-stat ${resultado.erros > 0 ? 'importacao-stat-err' : 'importacao-stat-none'}`}>
                <div className="importacao-stat-num">{resultado.erros}</div>
                <div className="importacao-stat-label">Erros</div>
              </div>
            </div>

            {resultado.mensagensErro.length > 0 && (
              <div className="importacao-erros">
                <p className="importacao-erros-title">Detalhes dos erros:</p>
                <ul className="importacao-erros-list">
                  {resultado.mensagensErro.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {resultado.duplicatas > 0 && (
              <p className="importacao-aviso-dup">
                {resultado.duplicatas} processo(s) já existiam e foram marcados como{' '}
                <strong>Duplicata</strong>. Acesse a lista de processos para revisar e, se necessário,
                excluir as entradas duplicadas.
              </p>
            )}

            <div className="importacao-resultado-actions">
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/processos')}>
                Ver Processos
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
