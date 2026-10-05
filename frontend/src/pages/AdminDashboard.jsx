import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../context/ToastContext'
import { adminAPI } from '../services/api'
import {
  Users, Droplets, Activity, AlertTriangle, CheckCircle,
  TrendingUp, MapPin, Calendar, Loader2, Building2,
  UserCheck, UserX, Shield, Trash2
} from 'lucide-react'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const BG_COLORS = {
  'A+': 'bg-red-50 border-red-200 text-red-700',
  'A-': 'bg-rose-50 border-rose-200 text-rose-700',
  'B+': 'bg-orange-50 border-orange-200 text-orange-700',
  'B-': 'bg-amber-50 border-amber-200 text-amber-700',
  'O+': 'bg-green-50 border-green-200 text-green-700',
  'O-': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'AB+': 'bg-blue-50 border-blue-200 text-blue-700',
  'AB-': 'bg-indigo-50 border-indigo-200 text-indigo-700',
}

export default function AdminDashboard() {
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, reqRes, donorRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getRequests(),
        adminAPI.getDonors(),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data.users || [])
      setRequests(reqRes.data.requests || [])
      setDonors(donorRes.data.donors || [])
    } catch {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteUser(id)
      toast.success('User deleted')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user')
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    </DashboardLayout>
  )

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: `Requests (${requests.length})` },
    { id: 'donors', label: `Donors (${donors.length})` },
    { id: 'users', label: `Users (${users.length})` },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">RAKTSETU platform overview</p>
          </div>
        </div>

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'Registered Donors', value: stats.total_donors, icon: Droplets, color: 'text-red-600 bg-red-50' },
              { label: 'Active Donors', value: stats.active_donors, icon: UserCheck, color: 'text-green-600 bg-green-50' },
              { label: 'Active Requests', value: stats.active_requests, icon: Activity, color: 'text-amber-600 bg-amber-50' },
              { label: 'Urgent Requests', value: stats.urgent_requests, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
              { label: 'Accepted Matches', value: stats.accepted_matches, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              { label: 'Fulfilled Requests', value: stats.fulfilled_requests, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
              { label: 'Requesters', value: stats.total_requesters, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
            ].map(s => (
              <div key={s.label} className="card flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blood group availability */}
        {stats?.blood_group_stats && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-red-600" /> Blood Group Availability
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {BLOOD_GROUPS.map(bg => {
                const s = stats.blood_group_stats[bg] || { total: 0, available: 0 }
                return (
                  <div key={bg} className={`flex flex-col items-center p-3 rounded-xl border ${BG_COLORS[bg] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                    <span className="font-extrabold text-lg">{bg}</span>
                    <span className="text-2xl font-bold mt-1">{s.available}</span>
                    <span className="text-xs opacity-70">available</span>
                    <span className="text-xs opacity-50">{s.total} total</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === t.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900">Recent Blood Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Requester', 'Blood Group', 'Units', 'Hospital', 'Urgency', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.slice(0, 8).map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 font-medium text-gray-900">{r.requester_name}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center justify-center w-10 h-8 bg-red-100 text-red-700 font-bold text-xs rounded-lg">{r.blood_group}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{r.units_required}</td>
                      <td className="py-3 px-3 text-gray-600 max-w-32 truncate">{r.hospital_name}</td>
                      <td className="py-3 px-3">
                        {r.urgency === 'URGENT'
                          ? <span className="badge-urgent">🚨 URGENT</span>
                          : <span className="badge-normal">Normal</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`badge-status ${
                          r.status === 'FULFILLED' ? 'bg-green-100 text-green-700' :
                          r.status === 'MATCHING'  ? 'bg-blue-100 text-blue-700' :
                          r.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{r.status}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['#', 'Requester', 'Blood Group', 'Units', 'Hospital', 'City', 'Urgency', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-400 text-xs">{r.id}</td>
                    <td className="py-3 px-3 font-medium text-gray-900">{r.requester_name}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center justify-center w-10 h-8 bg-red-100 text-red-700 font-bold text-xs rounded-lg">{r.blood_group}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{r.units_required}</td>
                    <td className="py-3 px-3 text-gray-600 max-w-28 truncate">{r.hospital_name}</td>
                    <td className="py-3 px-3 text-gray-500">{r.city}</td>
                    <td className="py-3 px-3">
                      {r.urgency === 'URGENT'
                        ? <span className="badge-urgent">🚨</span>
                        : <span className="text-xs text-gray-400">Normal</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`badge-status ${
                        r.status === 'FULFILLED' ? 'bg-green-100 text-green-700' :
                        r.status === 'MATCHING'  ? 'bg-blue-100 text-blue-700' :
                        r.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{r.status}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Blood Group', 'City', 'Area', 'Availability', 'Last Donation'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donors.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">{d.user?.name}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center justify-center w-10 h-8 font-bold text-xs rounded-lg ${BG_COLORS[d.blood_group] || 'bg-gray-100 text-gray-700'}`}>
                        {d.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{d.city || '—'}</td>
                    <td className="py-3 px-3 text-gray-500">{d.area || '—'}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${d.availability ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${d.availability ? 'bg-green-500' : 'bg-gray-300'}`} />
                        {d.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">
                      {d.last_donation_date
                        ? new Date(d.last_donation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Email', 'Role', 'Phone', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 px-3 text-gray-600 text-xs">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`badge-status text-xs capitalize ${
                        u.role === 'admin'    ? 'bg-purple-100 text-purple-700' :
                        u.role === 'donor'    ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-500 text-xs">{u.phone || '—'}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
