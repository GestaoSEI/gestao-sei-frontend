import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { createProcesso, updateProcesso } from '../api'
import type { Processo } from '../types'

const NUMERO_PATTERN = /^\d{4}\.\d{4}\/\d{7}-\d{1}$/
const STATUS_SUGESTOES = ['Em andamento', 'Respondido', 'Concluído', 'Arquivado', 'Expirado']

type FormData = {
  numeroProcesso: string
  tipoProcesso: string
  origem: string
  unidadeAtual: string
  status: string
  dataPrazoFinal: string
  observacao: string
}

function fromProcesso(p: Processo): FormData {
  return {
    numeroProcesso: p.numeroProcesso,
    tipoProcesso: p.tipoProcesso,
    origem: p.origem,
    unidadeAtual: p.unidadeAtual,
    status: p.status,
    dataPrazoFinal: p.dataPrazoFinal,
    observacao: p.observacao ?? '',
  }
}

const EMPTY_FORM: FormData = {
  numeroProcesso: '',
  tipoProcesso: '',
  origem: '',
  unidadeAtual: '',
  status: 'Em andamento',
  dataPrazoFinal: '',
  observacao: '',
}

export default function ProcessoFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const processoFromState = location.state?.processo as Processo | undefined
  const isEdit = Boolean(params.numero)

  // Se está editando mas não recebeu o processo pelo state, volta para a lista
  if (isEdit && !processoFromState) {
    navigate('/processos', { replace: true })
    return null
  }

  const [form, setForm] = useState<FormData>(
    processoFromState ? fromProcesso(processoFromState) : EMPTY_FORM
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!form.numeroProcesso.trim()) {
      newErrors.numeroProcesso = 'Campo obrigatório.'
    } else if (!NUMERO_PATTERN.test(form.numeroProcesso.trim())) {
      newErrors.numeroProcesso = 'Formato inválido. Use: 9999.9999/9999999-9'
    }
    if (!form.tipoProcesso.trim()) newErrors.tipoProcesso = 'Campo obrigatório.'
    if (!form.origem.trim()) newErrors.origem = 'Campo obrigatório.'
    if (!form.unidadeAtual.trim()) newErrors.unidadeAtual = 'Campo obrigatório.'
    if (!form.status.trim()) newErrors.status = 'Campo obrigatório.'
    if (!form.dataPrazoFinal) newErrors.dataPrazoFinal = 'Campo obrigatório.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError('')
    const payload = {
      ...form,
      numeroProcesso: form.numeroProcesso.trim(),
      observacao: form.observacao.trim() || undefined,
    }
    try {
      if (isEdit && processoFromState) {
        await updateProcesso(processoFromState.numeroProcesso, payload)
      } else {
        await createProcesso(payload)
      }
      navigate('/processos')
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 409 || status === 400) {
        setServerError('Número de processo já cadastrado ou dados inválidos.')
      } else {
        setServerError('Erro ao salvar processo. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">{isEdit ? 'Editar Processo' : 'Novo Processo'}</h2>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/processos')}>
            ← Voltar
          </button>
        </div>
      </div>

      {serverError && <p className="message message-error">{serverError}</p>}

      <div className="form-card">
        <form className="form form-processo" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numeroProcesso">Número do Processo *</label>
              <input
                id="numeroProcesso"
                name="numeroProcesso"
                value={form.numeroProcesso}
                onChange={handleChange}
                placeholder="9999.9999/9999999-9"
                className={errors.numeroProcesso ? 'input-error' : ''}
                disabled={isEdit}
                maxLength={20}
              />
              {errors.numeroProcesso && (
                <span className="field-error">{errors.numeroProcesso}</span>
              )}
              {!errors.numeroProcesso && (
                <span className="field-hint">Formato: 9999.9999/9999999-9</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="tipoProcesso">Tipo do Processo *</label>
              <input
                id="tipoProcesso"
                name="tipoProcesso"
                value={form.tipoProcesso}
                onChange={handleChange}
                placeholder="ex.: Licitação, Contrato, Requerimento"
                className={errors.tipoProcesso ? 'input-error' : ''}
              />
              {errors.tipoProcesso && (
                <span className="field-error">{errors.tipoProcesso}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="origem">Origem *</label>
              <input
                id="origem"
                name="origem"
                value={form.origem}
                onChange={handleChange}
                placeholder="ex.: SEFAZ, SEMEC, Protocolo Geral"
                className={errors.origem ? 'input-error' : ''}
              />
              {errors.origem && <span className="field-error">{errors.origem}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="unidadeAtual">Unidade Atual *</label>
              <input
                id="unidadeAtual"
                name="unidadeAtual"
                value={form.unidadeAtual}
                onChange={handleChange}
                placeholder="ex.: DGARQ, COAFI, Gabinete"
                className={errors.unidadeAtual ? 'input-error' : ''}
              />
              {errors.unidadeAtual && (
                <span className="field-error">{errors.unidadeAtual}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <input
                id="status"
                name="status"
                list="status-options"
                value={form.status}
                onChange={handleChange}
                placeholder="Selecione ou digite"
                className={errors.status ? 'input-error' : ''}
              />
              <datalist id="status-options">
                {STATUS_SUGESTOES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {errors.status && <span className="field-error">{errors.status}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="dataPrazoFinal">Prazo Final *</label>
              <input
                id="dataPrazoFinal"
                name="dataPrazoFinal"
                type="date"
                value={form.dataPrazoFinal}
                onChange={handleChange}
                className={errors.dataPrazoFinal ? 'input-error' : ''}
              />
              {errors.dataPrazoFinal && (
                <span className="field-error">{errors.dataPrazoFinal}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observacao">Observação</label>
            <textarea
              id="observacao"
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              placeholder="Informações adicionais sobre o processo (opcional)"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar processo'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/processos')}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
