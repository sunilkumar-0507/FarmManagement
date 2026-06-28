import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const isAdmin = user.role === 'admin'
  const base = isAdmin ? '/admin' : '/owner'

  const links = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
        { to: '/admin/entries', label: 'Manage Entries', icon: '📝' },
      ]
    : [
        { to: '/owner', label: 'Dashboard', icon: '📊', end: true },
        { to: '/owner/expenses', label: 'Expenses', icon: '💸' },
      ]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="login-logo">🌿</span>
          <div>
            <strong>Farm Mgmt</strong>
            <small>{isAdmin ? 'Admin Panel' : 'Owner Portal'}</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button className="nav-item logout" onClick={handleLogout}>
          <span className="nav-icon">🚪</span> Log out
        </button>
      </aside>

      {open && <div className="backdrop" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            ☰
          </button>
          <div className="topbar-title">
            {isAdmin ? 'Administrator' : `${user.name}'s Farm`}
          </div>
          <div className="topbar-user">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="topbar-user-meta">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
