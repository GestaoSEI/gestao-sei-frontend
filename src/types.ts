export type Role = 'ADMIN' | 'USER'

export interface Processo {
  id: number
  numeroProcesso: string
  tipoProcesso: string
  origem: string
  unidadeAtual: string
  status: string
  dataPrazoFinal: string
  observacao?: string
  alertaUrgencia?: boolean
  duplicata?: boolean
}

export interface ImportacaoResultado {
  importados: number
  duplicatas: number
  erros: number
  mensagensErro: string[]
}

export interface HistoricoItem {
  id: number
  dataAtualizacao: string
  usuarioLogin: string
  statusAnterior: string
  statusNovo: string
  unidadeAnterior: string
  unidadeNova: string
  observacaoDaMudanca?: string
}

export interface Usuario {
  id: number
  login: string
  nomeCompleto: string
  email: string
  dataNascimento: string
  role: Role
}
