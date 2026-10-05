import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../context/ToastContext'
import { requestAPI, matchAPI } from '../services/api'
import {
  Droplets, MapPin, Phone, CheckCircle, Building2,
  ArrowLeft, Loader2, Users, AlertTriangle, Send,
  SortAsc, Star
} from 'lucide-react'

export default function MatchResults() {
  const { requestId } = useParams()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState({})
  const [sortBy, setSortBy] = useState('score')

  useEffect(() => { fetchMatches() }, [requestId])

  const fetchMatches = async () => {
    try {
      const res = await requestAPI.getMatches(requestId)
      setData(res.data)
    } catch {
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async (donorId, matchId) => {
    setSending(s => ({ ...s, [donorId]: true }))
    try {
      // If match already exists (from auto-matching), just re-notify by calling respond endpoint
      // Otherwise create a new match
      await matchAPI.sendToDonor(requestId, donorId)
      toast.success('Request sent to donor!')
      fetchMatches()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request')
    } finally {
      setSending(s => ({ ...s, [donorId]: false }))
    }
  }

  const sortedMatches = (data?.matches || []).slice().sort((a, b) => {
    if (sortBy === 'score') return b.match_score - a.match_score
    if (sortBy === 'distance') return (a.distance || 9999) - (b.distance || 9999)
    return 0
  })

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-gray-500 text-sm">Finding potential donors...</p>
      </div>
    </DashboardLayout>
  )

  const req = data?.request

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back */}
        <Link to="/requester/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Request summary */}
        {req && (
          <div className={`rounded-2xl p-5 border-2 ${req.urgency === 'URGENT' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
            {req.urgency === 'URGENT' && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🚨</span>
                <span className="font-bold text-red-700 text-lg">URGENT REQUEST — PRIORITY MATCHING</span>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="blood-group-tag flex-shrink-0 w-14 h-14 text-base">{req.blood_group}</div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 text-lg">{req.blood_group} blood needed</h2>
                <p className="text-gray-600 text-sm mt-0.5">{req.units_required} unit{req.units_required > 1 ? 's' : ''} • {req.hospital_name}</p>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />{req.hospital_location || req.city}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`badge-status text-sm font-semibold ${req.status === 'MATCHING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {req.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Potential Donor Matches</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {sortedMatches.length > 0
                ? `${sortedMatches.length} potentially suitable donor${sortedMatches.length > 1 ? 's' : ''} found`
                : 'No matches found'}
            </p>
          </div>
          {sortedMatches.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <button
                onClick={() => setSortBy('score')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${sortBy === 'score' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Best Match
              </button>
              <button
                onClick={() => setSortBy('distance')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${sortBy === 'distance' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Nearest
              </button>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Blood compatibility must be confirmed by a qualified medical professional/blood bank before transfusion.
        </div>

        {/* Match cards */}
        {sortedMatches.length === 0 ? (
          <div className="card text-center py-16">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold text-lg">No potential donors found nearby</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">There are no registered donors matching your requirements in this area at this time.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/requester/create-request" className="btn-secondary text-sm">Try different blood group</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMatches.map((match, idx) => (
              <MatchCard
                key={match.id}
                match={match}
                rank={idx + 1}
                urgent={req?.urgency === 'URGENT'}
                onSend={sendRequest}
                sending={sending[match.donor_id]}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function MatchCard({ match, rank, urgent, onSend, sending }) {
  const scorePercent = Math.min(100, match.match_score)
  const scoreColor = scorePercent >= 80 ? 'text-green-600' : scorePercent >= 60 ? 'text-amber-600' : 'text-gray-600'
  const barColor = scorePercent >= 80 ? 'bg-green-500' : scorePercent >= 60 ? 'bg-amber-500' : 'bg-gray-400'

  const alreadySent = match.status !== 'PENDING' || false

  return (
    <div className={`card relative overflow-hidden ${rank === 1 ? 'ring-2 ring-red-200' : ''}`}>
      {rank === 1 && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <Star className="w-3 h-3" /> Best Match
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <span className="text-red-700 font-bold text-lg">
              {(match.donor_name || '?').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-gray-900">{match.donor_name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-red-100 text-red-700 font-bold text-xs rounded-full border border-red-200">
                  🩸 {match.donor_blood_group}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${match.donor_availability ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${match.donor_availability ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {match.donor_availability ? 'Available' : 'Unavailable'}
                </span>
                {match.distance ? (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{match.distance} km away
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{match.donor_city || 'Nearby'}
                  </span>
                )}
                {match.donor_area && (
                  <span className="text-xs text-gray-400">{match.donor_area}</span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
              <p className={`text-2xl font-extrabold ${scoreColor}`}>{scorePercent}%</p>
              <p className="text-xs text-gray-400">match score</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-3 mb-3">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${scorePercent}%` }} />
            </div>
          </div>

          {/* Match reasons */}
          {match.reasons && match.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {match.reasons.map(r => (
                <span key={r} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                  <CheckCircle className="w-3 h-3" /> {r}
                </span>
              ))}
            </div>
          )}

          {/* Status row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              {match.donor_phone && match.status === 'ACCEPTED' && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {match.donor_phone}
                </p>
              )}
              {match.status !== 'PENDING' && (
                <span className={`badge-status text-xs ${
                  match.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                  match.status === 'DECLINED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {match.status === 'ACCEPTED' && '✓ '}
                  {match.status === 'DECLINED' && '✗ '}
                  {match.status}
                </span>
              )}
            </div>

            {match.status === 'PENDING' && (
              <button
                onClick={() => onSend(match.donor_id, match.id)}
                disabled={sending}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  urgent
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                } disabled:opacity-60`}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Request
              </button>
            )}

            {match.status === 'ACCEPTED' && (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold">
                <CheckCircle className="w-4 h-4" /> Accepted
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
