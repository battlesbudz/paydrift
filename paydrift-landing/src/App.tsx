import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { getToken } from './lib/auth'
import { Navbar } from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyPage from './pages/VerifyPage'
import { DashboardPage } from './pages/DashboardPage'
import { ClientsPage } from './pages/ClientsPage'
import { InvoicesPage } from './pages/InvoicesPage'
import { SettingsPage } from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const token = getToken()
  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><div className="min-h-screen bg-[#F8F9FF]"><Navbar /><DashboardPage /></div></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><div className="min-h-screen bg-[#F8F9FF]"><Navbar /><ClientsPage /></div></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><div className="min-h-screen bg-[#F8F9FF]"><Navbar /><InvoicesPage /></div></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><div className="min-h-screen bg-[#F8F9FF]"><Navbar /><SettingsPage /></div></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
