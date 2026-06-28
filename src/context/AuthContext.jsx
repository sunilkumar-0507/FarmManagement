import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/mockApi.js'

const AuthContext = createContext(null)

const STORAGE_KEY = 'fm_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on first load.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch {
      // ignore corrupt storage
    }
    setLoading(false)
  }, [])

  async function login(username, password) {
    const loggedIn = await api.login(username, password)
    setUser(loggedIn)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn))
    return loggedIn
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
