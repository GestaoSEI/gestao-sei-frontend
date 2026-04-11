import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../App'

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export default function ProtectedRoute() {
  const { auth, signOut } = useAuth()

  if (!auth) return <Navigate to="/login" replace />

  if (isTokenExpired(auth.token)) {
    signOut()
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
