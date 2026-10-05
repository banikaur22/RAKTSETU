import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Droplets, User, Mail, Lock, Phone, Eye, EyeOff, Heart, Activity, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: searchParams.get('role') || 'requester'
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'donor' || r === 'requester') setForm(f => ({ ...f, role: r }))
  }, [searchParams])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome to RAKTSETU, ${user.name.split(' ')[0]}!`)
      if (user.role === 'donor') navigate('/donor/profile')
      else navigate('/requester/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join RAKTSETU today</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, role: 'donor' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border-2 transition-all text-sm ${
              form.role === 'donor' ? 'border-red-600 bg-red-600 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-red-200'
            }`}
          >
            <Heart className="w-4 h-4" /> I'm a Donor
          </button>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, role: 'requester' }))}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border-2 transition-all text-sm ${
              form.role === 'requester' ? 'border-red-600 bg-red-600 text-white shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-red-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Finding Blood
          </button>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" name="name" value={form.name} onChange={handleChange} className="input pl-10" placeholder="Your full name" />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input pl-10" placeholder="you@example.com" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="label">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input pl-10" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className="input pl-10 pr-10" placeholder="Min 6 characters" autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {form.role === 'donor' && (
              <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-sm text-green-700">
                ✓ After registering, you'll complete your donor profile with blood group and location.
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account...</span>
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
