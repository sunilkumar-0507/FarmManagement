import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Guards a route. `role` optionally restricts to 'admin' or 'owner'.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (role && user.role !== role) {
    // Send users to the dashboard that matches their role.
    return <Navigate to={user.role === 'admin' ? '/admin' : '/owner'} replace />
  }

  return children
}
