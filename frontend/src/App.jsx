import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DonorDashboard from './pages/DonorDashboard'
import DonorProfile from './pages/DonorProfile'
import RequesterDashboard from './pages/RequesterDashboard'
import CreateRequest from './pages/CreateRequest'
import MatchResults from './pages/MatchResults'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading RAKTSETU...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'donor') return <Navigate to="/donor/dashboard" replace />
    if (user.role === 'requester') return <Navigate to="/requester/dashboard" replace />
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    if (user.role === 'donor') return <Navigate to="/donor/dashboard" replace />
    if (user.role === 'requester') return <Navigate to="/requester/dashboard" replace />
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Donor Routes */}
      <Route path="/donor/dashboard" element={
        <ProtectedRoute allowedRoles={['donor']}>
          <DonorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/donor/profile" element={
        <ProtectedRoute allowedRoles={['donor']}>
          <DonorProfile />
        </ProtectedRoute>
      } />

      {/* Requester Routes */}
      <Route path="/requester/dashboard" element={
        <ProtectedRoute allowedRoles={['requester']}>
          <RequesterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/requester/create-request" element={
        <ProtectedRoute allowedRoles={['requester']}>
          <CreateRequest />
        </ProtectedRoute>
      } />
      <Route path="/requester/matches/:requestId" element={
        <ProtectedRoute allowedRoles={['requester']}>
          <MatchResults />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
