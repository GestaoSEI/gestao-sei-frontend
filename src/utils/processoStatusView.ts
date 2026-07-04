import { STATUS_PROCESSO } from '../constants/processoStatus'

export function getStatusBadgeClass(status: string): string {
  const s = status?.toLowerCase() ?? ''
  if (s === STATUS_PROCESSO.EXPIRADO.toLowerCase()) return 'badge badge-expirado'
  if (s === STATUS_PROCESSO.PRAZO_PROXIMO.toLowerCase()) return 'badge badge-warn'
  if (
    s === STATUS_PROCESSO.CONCLUIDO.toLowerCase() ||
    s === STATUS_PROCESSO.ENCERRADO.toLowerCase() ||
    s === STATUS_PROCESSO.RESPONDIDO.toLowerCase()
  ) return 'badge badge-ok'
  return 'badge badge-default'
}
