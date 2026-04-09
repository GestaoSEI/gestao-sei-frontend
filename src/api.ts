import axios from 'axios'
import type { Processo, HistoricoItem, Usuario, Role } from './types'

export const apiClient = axios.create({ baseURL: '/api' })

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gestaoSeiToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth (/auth/* no backend → /api/auth/* pelo proxy do Vite)
export const authLogin = (login: string, senha: string) =>
  apiClient.post<{ token: string }>('/auth/login', { login, senha })

export const authRegister = (login: string, senha: string, role: Role) =>
  apiClient.post('/auth/register', { login, senha, role })

export const authResetPassword = (login: string, novaSenha: string) =>
  apiClient.post('/auth/reset-password', { login, novaSenha })

// Processos (/api/processos/* no backend → /api/api/processos/* pelo proxy do Vite)
export const getProcessos = () =>
  apiClient.get<Processo[]>('/api/processos')

export const createProcesso = (data: Omit<Processo, 'id' | 'alertaUrgencia'>) =>
  apiClient.post<Processo>('/api/processos', data)

export const updateProcesso = (numero: string, data: Omit<Processo, 'id' | 'alertaUrgencia'>) =>
  apiClient.put<Processo>('/api/processos/atualizar', data, { params: { numero } })

export const deleteProcesso = (numero: string) =>
  apiClient.delete('/api/processos/excluir', { params: { numero } })

export const searchProcessos = (keyword: string) =>
  apiClient.get<Processo[]>('/api/processos/busca', { params: { keyword } })

export const filterProcessos = (params: Record<string, string | boolean | undefined>) =>
  apiClient.get<Processo[]>('/api/processos/filtro', { params })

export const getHistorico = (processoId: number) =>
  apiClient.get<HistoricoItem[]>(`/api/processos/historico/${processoId}`)

export const getRelatorio = (params?: Record<string, string | undefined>) =>
  apiClient.get('/api/processos/relatorio', { params, responseType: 'blob' })

// Usuários (/api/usuarios/* no backend → /api/api/usuarios/* pelo proxy do Vite)
export const getUsuarios = () =>
  apiClient.get<Usuario[]>('/api/usuarios')

export const getUserByLogin = (login: string) =>
  apiClient.get<Usuario>(`/api/usuarios/login/${encodeURIComponent(login)}`)

export const createUsuario = (data: { login: string; role: Role }) =>
  apiClient.post<Usuario>('/api/usuarios', data)

export const updateUsuario = (id: number, data: { login: string; role: Role }) =>
  apiClient.put<Usuario>(`/api/usuarios/${id}`, data)

export const deleteUsuario = (id: number) =>
  apiClient.delete(`/api/usuarios/${id}`)

export const alterarSenha = (id: number, senhaAtual: string | undefined, novaSenha: string) =>
  apiClient.put(`/api/usuarios/${id}/senha`, { senhaAtual, novaSenha })
