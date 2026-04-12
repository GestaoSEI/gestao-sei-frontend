import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Role } from './types'
import { apiClient } from './api'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProcessoFormPage from './pages/ProcessoFormPage'
import HistoricoPage from './pages/HistoricoPage'
import UsuariosPage from './pages/UsuariosPage'
import ImportacaoPage from './pages/ImportacaoPage'

// ─── Auth Context ─────────────────────────────────────────
export type AuthInfo = {
  token: string
  login: string
  role: Role
}

type AuthContextType = {
  auth: AuthInfo | null
  signIn: (token: string, login: string, role: Role) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextType>({
  auth: null,
  signIn: () => {},
  signOut: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthInfo | null>(() => {
    const token = localStorage.getItem('gestaoSeiToken')
    const login = localStorage.getItem('gestaoSeiLogin')
    const role = localStorage.getItem('gestaoSeiRole') as Role | null
    if (token && login && role) return { token, login, role }
    return null
  })

  function signIn(token: string, login: string, role: Role) {
    localStorage.setItem('gestaoSeiToken', token)
    localStorage.setItem('gestaoSeiLogin', login)
    localStorage.setItem('gestaoSeiRole', role)
    setAuth({ token, login, role })
  }

  function signOut() {
    localStorage.removeItem('gestaoSeiToken')
    localStorage.removeItem('gestaoSeiLogin')
    localStorage.removeItem('gestaoSeiRole')
    setAuth(null)
  }

  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          signOut()
        }
        return Promise.reject(error)
      }
    )
    return () => apiClient.interceptors.response.eject(interceptorId)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Público */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protegido por autenticação */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/processos" replace />} />
              <Route path="/processos" element={<DashboardPage />} />
              <Route path="/processos/novo" element={<ProcessoFormPage />} />
              <Route path="/processos/editar/:numero" element={<ProcessoFormPage />} />
              <Route path="/processos/historico/:processoId" element={<HistoricoPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/importar" element={<ImportacaoPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
