import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { donorAPI } from '../services/api'
import { Droplets, MapPin, Calendar, Phone, Save, Loader2, CheckCircle } from 'lucide-react'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

// Demo city coordinates for auto-fill
const CITY_COORDS = {
  'Ludhiana':   { lat: 30.9010, lon: 75.8573 },
  'Chandigarh': { lat: 30.7333, lon: 76.7794 },
  'Amritsar':   { lat: 31.6340, lon: 74.8723 },
  'Jalandhar':  { lat: 31.3260, lon: 75.5762 },
  'Delhi':      { lat: 28.6139, lon: 77.2090 },
}

export default function DonorProfile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    blood_group: '', city: '', area: '',
    availability: true, last_donation_date: '', phone: '',
    latitude: '', longitude: ''
  })

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const res = await donorAPI.getMyProfile()
      const { profile, user: userData } = res.data
      if (profile) {
        setForm({
          blood_group: profile.blood_group || '',
          city: profile.city || '',
          area: profile.area || '',
          availability: profile.availability !== false,
          last_donation_date: profile.last_donation_date || '',
          phone: userData?.phone || '',
          latitude: profile.latitude || '',
          longitude: profile.longitude || '',
        })
      } else {
        setForm(f => ({ ...f, phone: userData?.phone || '' }))
      }
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCityChange = e => {
    const city = e.target.value
    const coords = CITY_COORDS[city]
    setForm(f => ({
      ...f, city,
      latitude: coords ? coords.lat : f.latitude,
      longitude: coords ? coords.lon : f.longitude,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.blood_group) { toast.error('Please select your blood group'); return }
    setSaving(true)
    try {
      await donorAPI.saveProfile(form)
      setSaved(true)
      toast.success('Profile saved successfully!')
      setTimeout(() => { setSaved(false); navigate('/donor/dashboard') }, 1500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Keep your information updated so blood requests can find you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Blood Group */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Droplets className="w-4 h-4 text-red-600" /> Blood Group</h2>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map(bg => (
                <button
                  key={bg} type="button"
                  onClick={() => setForm(f => ({ ...f, blood_group: bg }))}
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
          </div>

          {/* Location */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-600" /> Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <select name="city" value={form.city} onChange={handleCityChange} className="input">
                  <option value="">Select city</option>
                  {Object.keys(CITY_COORDS).map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Area / Locality</label>
                <input type="text" name="area" value={form.area} onChange={handleChange} className="input" placeholder="e.g. Model Town" />
              </div>
            </div>
            {form.latitude && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Coordinates set ({Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)})
              </p>
            )}
          </div>

          {/* Availability & Last Donation */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-red-600" /> Availability</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Available for Donation</p>
                  <p className="text-xs text-gray-500">Turn off if you are temporarily unavailable</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="availability" checked={form.availability} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              <div>
                <label className="label">Last Donation Date</label>
                <input type="date" name="last_donation_date" value={form.last_donation_date} onChange={handleChange} className="input" max={new Date().toISOString().split('T')[0]} />
                <p className="text-xs text-gray-400 mt-1">Donors must wait at least 56 days between whole blood donations.</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-red-600" /> Contact</h2>
            <div>
              <label className="label">Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="+91 98765 43210" />
              <p className="text-xs text-gray-400 mt-1">Shared with requesters when you accept a donation request.</p>
            </div>
          </div>

          <button type="submit" disabled={saving} className={`btn-primary w-full justify-center py-3 text-base ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
            ) : saved ? (
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Saved!</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Profile</span>
            )}
          </button>
        </form>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
          ⚠️ Blood compatibility must be confirmed by a qualified medical professional or blood bank before any transfusion.
        </div>
      </div>
    </DashboardLayout>
  )
}
