import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth } from '../lib/auth'
import { getUser } from '../lib/auth'

export function Navbar() {
  const user = getUser()
  const navigate = useNavigate()
  const location = useLocation()

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/clients', label: 'Clients' },
    { to: '/invoices', label: 'Invoices' },
    { to: '/settings', label: 'Settings' },
  ]

  function handleLogout() {
    clearAuth()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-bold text-[--pd]">PayDrift</Link>
          <div className="hidden md:flex gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-[--pd]/10 text-[--pd]'
                    : 'text-gray-600 hover:text-[--pd] hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
