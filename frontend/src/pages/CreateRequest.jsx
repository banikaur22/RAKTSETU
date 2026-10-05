import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useToast } from '../context/ToastContext'
import { requestAPI } from '../services/api'
import {
  Droplets, Building2, MapPin, AlertTriangle,
  Activity, ArrowRight, Loader2, Zap
} from 'lucide-react'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const CITIES = ['Ludhiana', 'Chandigarh', 'Amritsar', 'Jalandhar', 'Patiala', 'Delhi', 'Mumbai', 'Other']

export default function CreateRequest() {
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    blood_group: '',
    units_required: 1,
    hospital_name: '',
    hospital_location: '',
    city: 'Ludhiana',
    urgency: 'NORMAL',
  })
  const [errors, setErrors] = useState({})

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.blood_group) e.blood_group = 'Please select a blood group'
    if (!form.units_required || form.units_required < 1) e.units_required = 'At least 1 unit required'
    if (!form.hospital_name.trim()) e.hospital_name = 'Hospital name is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await requestAPI.create(form)
      const { request, matches_found } = res.data
      toast.success(`Request created! Found ${matches_found} potential donor${matches_found !== 1 ? 's' : ''}.`)
      navigate(`/requester/matches/${request.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Blood Request</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details to find potentially matching donors.</p>
        </div>

        {/* Urgency selector — prominent */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, urgency: 'NORMAL' }))}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
              form.urgency === 'NORMAL'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-200'
            }`}
          >
            <Activity className={`w-7 h-7 ${form.urgency === 'NORMAL' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`font-bold text-sm ${form.urgency === 'NORMAL' ? 'text-blue-700' : 'text-gray-500'}`}>Normal</span>
            <span className="text-xs text-gray-400">Standard request</span>
          </button>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, urgency: 'URGENT' }))}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
              form.urgency === 'URGENT'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-white hover:border-red-200'
            }`}
          >
            <Zap className={`w-7 h-7 ${form.urgency === 'URGENT' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className={`font-bold text-sm ${form.urgency === 'URGENT' ? 'text-red-700' : 'text-gray-500'}`}>🚨 Urgent</span>
            <span className="text-xs text-gray-400">Priority matching</span>
          </button>
        </div>

        {form.urgency === 'URGENT' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Emergency Mode Active</p>
              <p className="text-xs text-red-600 mt-0.5">This request will be prioritized and shown prominently to nearby available donors.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Blood Group */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-red-600" /> Required Blood Group
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg} type="button"
                  onClick={() => { setForm(f => ({ ...f, blood_group: bg })); setErrors(e => ({ ...e, blood_group: '' })) }}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    form.blood_group === bg
                      ? 'border-red-600 bg-red-600 text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
            {errors.blood_group && <p className="text-red-500 text-xs mt-2">{errors.blood_group}</p>}
          </div>

          {/* Units */}
          <div className="card">
            <label className="label text-base font-bold">Units Required</label>
            <p className="text-xs text-gray-400 mb-3">How many units of blood are needed?</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, units_required: Math.max(1, f.units_required - 1) }))}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-red-300 hover:text-red-600 transition-all"
              >−</button>
              <span className="text-3xl font-extrabold text-red-600 w-12 text-center">{form.units_required}</span>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, units_required: Math.min(10, f.units_required + 1) }))}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-red-300 hover:text-red-600 transition-all"
              >+</button>
              <span className="text-sm text-gray-500">unit{form.units_required > 1 ? 's' : ''}</span>
            </div>
            {errors.units_required && <p className="text-red-500 text-xs mt-2">{errors.units_required}</p>}
          </div>

          {/* Hospital */}
          <div className="card space-y-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" /> Hospital Details
            </h2>
            <div>
              <label className="label">Hospital Name <span className="text-red-500">*</span></label>
              <input
                type="text" name="hospital_name" value={form.hospital_name} onChange={handleChange}
                className={`input ${errors.hospital_name ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="e.g. DMC Hospital"
              />
              {errors.hospital_name && <p className="text-red-500 text-xs mt-1">{errors.hospital_name}</p>}
            </div>
            <div>
              <label className="label">Hospital Location / Address</label>
              <input
                type="text" name="hospital_location" value={form.hospital_location} onChange={handleChange}
                className="input"
                placeholder="e.g. Tagore Nagar, Ludhiana"
              />
            </div>
            <div>
              <label className="label">City <span className="text-red-500">*</span></label>
              <select name="city" value={form.city} onChange={handleChange} className="input">
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
            ⚠️ Blood compatibility must be confirmed by a qualified medical professional before transfusion.
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full justify-center py-4 text-base font-bold rounded-2xl flex items-center gap-2 transition-all shadow-sm ${
              form.urgency === 'URGENT'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Finding potential donors...
              </>
            ) : (
              <>
                {form.urgency === 'URGENT' ? '🚨' : <ArrowRight className="w-5 h-5" />}
                Find Potential Donors
              </>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
