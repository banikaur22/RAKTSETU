import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { requestAPI } from '../services/api'
import {
  Plus, Activity, Clock, CheckCircle, Droplets,
  MapPin, Building2, Eye, XCircle, Loader2, AlertTriangle
} from 'lucide-react'

function UrgencyBadge({ urgency }) {
  if (urgency === 'URGENT') return <span className="badge-urgent">🚨 URGENT</span>
  return <span className="badge-normal">NORMAL</span>
}

function StatusBadge({ status }) {
  const map = {
    PENDING:   'bg-yellow-100 text-yellow-700',
    MATCHING:  'bg-blue-100 text-blue-700',
    FULFILLED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  }
  return <span className={`badge-status ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

export default function RequesterDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    try {
      const res = await requestAPI.getAll()
      setRequests(res.data.requests || [])
    } catch {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const cancelRequest = async (id) => {
    if (!window.confirm('Cancel this blood request?')) return
    try {
      await requestAPI.cancel(id)
      toast.success('Request cancelled')
      fetchRequests()
    } catch {
      toast.error('Failed to cancel request')
    }
  }

  const fulfillRequest = async (id) => {
    try {
      await requestAPI.fulfill(id)
      toast.success('Request marked as fulfilled!')
      fetchRequests()
    } catch {
      toast.error('Failed to update request')
    }
  }

  const active = requests.filter(r => ['PENDING','MATCHING'].includes(r.status))
  const urgent = requests.filter(r => r.urgency === 'URGENT' && ['PENDING','MATCHING'].includes(r.status))
  const fulfilled = requests.filter(r => r.status === 'FULFILLED')

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Blood. Faster.</h1>
            <p className="text-gray-500 text-sm mt-0.5">Welcome, {user?.name?.split(' ')[0]}</p>
          </div>
          <Link to="/requester/create-request" className="btn-primary">
            <Plus className="w-4 h-4" /> Create Blood Request
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', value: requests.length, icon: Activity, color: 'text-blue-600 bg-blue-50' },
            { label: 'Active', value: active.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Urgent', value: urgent.length, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
            { label: 'Fulfilled', value: fulfilled.length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Urgent requests spotlight */}
        {urgent.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
            <h2 className="font-bold text-red-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🚨</span> Active Urgent Requests
            </h2>
            <div className="space-y-3">
              {urgent.map(r => (
                <RequestCard key={r.id} request={r} onCancel={cancelRequest} onFulfill={fulfillRequest} />
              ))}
            </div>
          </div>
        )}

        {/* All requests */}
        <div>
          <h2 className="font-bold text-gray-900 mb-4">All Blood Requests</h2>
          {requests.length === 0 ? (
            <div className="card text-center py-16">
              <Droplets className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold text-lg">No blood requests yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">Create your first request to find potential donors.</p>
              <Link to="/requester/create-request" className="btn-primary inline-flex">
                <Plus className="w-4 h-4" /> Create Blood Request
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <RequestCard key={r.id} request={r} onCancel={cancelRequest} onFulfill={fulfillRequest} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function RequestCard({ request: r, onCancel, onFulfill }) {
  const isActive = ['PENDING', 'MATCHING'].includes(r.status)
  return (
    <div className={`card border-l-4 ${r.urgency === 'URGENT' ? 'border-l-red-500' : 'border-l-blue-400'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="blood-group-tag flex-shrink-0">{r.blood_group}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <UrgencyBadge urgency={r.urgency} />
              <StatusBadge status={r.status} />
              <span className="text-xs text-gray-400">{r.units_required} unit{r.units_required > 1 ? 's' : ''}</span>
            </div>
            <p className="font-semibold text-gray-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {r.hospital_name}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {r.hospital_location || r.city}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {r.status === 'MATCHING' && (
            <Link
              to={`/requester/matches/${r.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> View Matches
            </Link>
          )}
          {r.status === 'PENDING' && (
            <Link
              to={`/requester/matches/${r.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </Link>
          )}
          {isActive && (
            <>
              <button
                onClick={() => onFulfill(r.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Fulfilled
              </button>
              <button
                onClick={() => onCancel(r.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
