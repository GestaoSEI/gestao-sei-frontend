import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../App'

export default function ProtectedRoute() {
  const { auth } = useAuth()
  return auth ? <Outlet /> : <Navigate to="/login" replace />
}
