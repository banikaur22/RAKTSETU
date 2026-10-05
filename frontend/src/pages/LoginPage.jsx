import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Droplets, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const DEMO_CREDS = [
  { role: 'Admin',     email: 'admin@raktsetu.com',     password: 'Admin@123',     color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { role: 'Donor',     email: 'donor@raktsetu.com',     password: 'Donor@123',     color: 'bg-green-50 border-green-200 text-green-700' },
  { role: 'Requester', email: 'requester@raktsetu.com', password: 'Requester@123', color: 'bg-blue-50 border-blue-200 text-blue-700' },
]

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      if (user.role === 'donor') navigate('/donor/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/requester/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (cred) => {
    setForm({ email: cred.email, password: cred.password })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-11 h-11 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-gray-900">RAKT<span className="text-red-600">SETU</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        {/* Demo credentials */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Demo Accounts — click to fill</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_CREDS.map(c => (
              <button key={c.role} onClick={() => fillDemo(c)} className={`text-xs font-semibold px-2 py-2 rounded-xl border transition-all hover:shadow-sm ${c.color}`}>
                {c.role}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  className="input pl-10" placeholder="you@example.com" autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className="input pl-10 pr-10" placeholder="Your password" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-red-600 font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
