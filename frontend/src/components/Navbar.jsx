import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Droplets, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'donor') return '/donor/dashboard'
    if (user.role === 'requester') return '/requester/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    return '/'
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-red-700 transition-colors">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              RAKT<span className="text-red-600">SETU</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                    <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-800 leading-none">{user.name.split(' ')[0]}</span>
                      <span className="text-xs text-gray-400 capitalize leading-none mt-0.5">{user.role}</span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-red-600 px-4 py-2 rounded-lg transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 w-full text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="flex items-center gap-2 w-full text-sm font-medium text-red-600 py-2.5 px-3 rounded-lg hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-sm font-semibold text-white bg-red-600 py-2.5 px-3 rounded-lg text-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
