import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { donorAPI, matchAPI } from '../services/api'
import {
  Droplets, MapPin, Calendar, Clock, CheckCircle, XCircle,
  AlertTriangle, Edit, ToggleLeft, ToggleRight, Activity,
  User, Phone, Building2, Loader2
} from 'lucide-react'

export default function DonorDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profRes, matchRes] = await Promise.all([
        donorAPI.getMyProfile(),
        matchAPI.getMyMatches()
      ])
      setProfile(profRes.data.profile)
      setMatches(matchRes.data.matches || [])
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async () => {
    if (!profile) return
    setToggling(true)
    try {
      const res = await donorAPI.toggleAvailability(!profile.availability)
      setProfile(p => ({ ...p, availability: res.data.availability }))
      toast.success(res.data.availability ? 'You are now available for donation' : 'Availability set to unavailable')
    } catch {
      toast.error('Failed to update availability')
    } finally {
      setToggling(false)
    }
  }

  const respond = async (matchId, action) => {
    try {
      await matchAPI.respond(matchId, action)
      toast.success(`Request ${action.toLowerCase()}ed`)
      fetchData()
    } catch {
      toast.error('Failed to respond to request')
    }
  }

  const pendingMatches = matches.filter(m => m.status === 'PENDING')
  const urgentMatches = matches.filter(m => m.blood_request?.urgency === 'URGENT' && m.status === 'PENDING')
  const acceptedCount = matches.filter(m => m.status === 'ACCEPTED').length

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
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 text-sm mt-0.5">Here's your donor dashboard</p>
          </div>
          <Link to="/donor/profile" className="btn-secondary text-sm">
            <Edit className="w-4 h-4" /> Edit Profile
          </Link>
        </div>

        {/* No profile warning */}
        {!profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Complete your donor profile</p>
              <p className="text-sm text-amber-600 mt-1">Add your blood group and location so you can start receiving donation requests.</p>
              <Link to="/donor/profile" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 mt-2 hover:underline">
                Complete Profile →
              </Link>
            </div>
          </div>
        )}

        {/* Availability toggle */}
        {profile && (
          <div className={`rounded-2xl p-5 border-2 transition-all ${profile.availability ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${profile.availability ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {profile.availability ? 'Available for Donation' : 'Currently Unavailable'}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {profile.availability ? 'You will appear in blood requests matching your profile.' : 'Toggle on to start receiving donation requests.'}
                </p>
              </div>
              <button onClick={toggleAvailability} disabled={toggling} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${profile.availability ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-white hover:bg-gray-700'}`}>
                {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : profile.availability ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {profile.availability ? 'Available' : 'Unavailable'}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Blood Group', value: profile?.blood_group || '—', icon: Droplets, color: 'text-red-600 bg-red-50' },
            { label: 'Total Requests', value: matches.length, icon: Activity, color: 'text-blue-600 bg-blue-50' },
            { label: 'Accepted', value: acceptedCount, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
            { label: 'Pending', value: pendingMatches.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
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

        {/* Profile card */}
        {profile && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-red-600" /> Donor Profile</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="blood-group-tag mx-auto mb-1">{profile.blood_group}</div>
                <p className="text-xs text-gray-500">Blood Group</p>
              </div>
              <div className="flex flex-col justify-center p-3">
                <p className="flex items-center gap-1.5 text-sm text-gray-700"><MapPin className="w-4 h-4 text-gray-400" />{profile.area || '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{profile.city || '—'}</p>
              </div>
              <div className="flex flex-col justify-center p-3">
                <p className="flex items-center gap-1.5 text-sm text-gray-700"><Calendar className="w-4 h-4 text-gray-400" />
                  {profile.last_donation_date ? new Date(profile.last_donation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Last donation</p>
              </div>
              <div className="flex flex-col justify-center p-3">
                <p className="flex items-center gap-1.5 text-sm text-gray-700"><Phone className="w-4 h-4 text-gray-400" />{user?.phone || '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Contact</p>
              </div>
            </div>
          </div>
        )}

        {/* Urgent requests */}
        {urgentMatches.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
            <h2 className="font-bold text-red-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🚨</span> Urgent Blood Requests ({urgentMatches.length})
            </h2>
            <div className="space-y-3">
              {urgentMatches.map(m => <MatchCard key={m.id} match={m} onRespond={respond} />)}
            </div>
          </div>
        )}

        {/* All pending requests */}
        <div>
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" /> Blood Requests
          </h2>
          {matches.length === 0 ? (
            <div className="card text-center py-12">
              <Droplets className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No donation requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Complete your profile and stay available to receive requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map(m => <MatchCard key={m.id} match={m} onRespond={respond} />)}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function MatchCard({ match, onRespond }) {
  const br = match.blood_request
  if (!br) return null
  return (
    <div className={`card border-l-4 ${br.urgency === 'URGENT' ? 'border-l-red-500' : 'border-l-blue-400'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="blood-group-tag flex-shrink-0">{br.blood_group}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <UrgencyBadge urgency={br.urgency} />
              <StatusBadge status={match.status} />
            </div>
            <p className="font-semibold text-gray-900">{br.units_required} unit{br.units_required > 1 ? 's' : ''} needed</p>
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5"><Building2 className="w-3.5 h-3.5" />{br.hospital_name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{br.hospital_location || br.city}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(br.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        {match.status === 'PENDING' && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button onClick={() => onRespond(match.id, 'ACCEPT')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> Accept
            </button>
            <button onClick={() => onRespond(match.id, 'DECLINE')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        )}
      </div>
    </div>
  )
}



function UrgencyBadge({ urgency }) {
  if (urgency === 'URGENT') return <span className="badge-urgent">🚨 URGENT</span>
  return <span className="badge-normal">NORMAL</span>
}

function StatusBadge({ status }) {
  const map = {
    PENDING:  'bg-yellow-100 text-yellow-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
    FULFILLED:'bg-blue-100 text-blue-700',
  }
  return <span className={`badge-status ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}
