import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ManageEntries from './pages/admin/ManageEntries.jsx'
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx'
import OwnerExpenses from './pages/owner/OwnerExpenses.jsx'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin area */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="entries" element={<ManageEntries />} />
      </Route>

      {/* Owner area */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute role="owner">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OwnerDashboard />} />
        <Route path="expenses" element={<OwnerExpenses />} />
      </Route>

      {/* Default redirect based on auth state */}
      <Route
        path="*"
        element={
          <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/owner') : '/login'} replace />
        }
      />
    </Routes>
  )
}
