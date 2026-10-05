import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  Droplets, MapPin, Clock, Shield, Heart,
  ChevronRight, Users, Activity, Zap, CheckCircle,
  ArrowRight
} from 'lucide-react'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const steps = [
  { icon: Users, title: 'Register', desc: 'Create your account as a donor or patient family member in under 2 minutes.', color: 'bg-blue-50 text-blue-600' },
  { icon: Activity, title: 'Request Blood', desc: 'Submit a blood request with blood group, hospital details, and urgency level.', color: 'bg-red-50 text-red-600' },
  { icon: Zap, title: 'Smart Matching', desc: 'RAKTSETU finds potentially suitable donors based on blood group, location, and availability.', color: 'bg-amber-50 text-amber-600' },
  { icon: Heart, title: 'Connect & Respond', desc: 'Donors receive the request and can accept or decline. Requester sees real-time status.', color: 'bg-green-50 text-green-600' },
]

const features = [
  { icon: Clock, title: 'Faster Donor Discovery', desc: 'Find potentially suitable registered donors in seconds, not hours.' },
  { icon: Droplets, title: 'Blood-Group Matching', desc: 'Proper blood compatibility logic ensures only potentially compatible donors are shown.' },
  { icon: MapPin, title: 'Location-Aware', desc: 'Prioritize nearby donors using city-based and coordinate-based distance ranking.' },
  { icon: Zap, title: 'Emergency Priority', desc: 'Urgent requests are flagged prominently and matched first for critical cases.' },
  { icon: Shield, title: 'Centralized Platform', desc: 'No more WhatsApp chains. One platform to register, request, and coordinate.' },
  { icon: CheckCircle, title: 'Donor Availability', desc: 'Donors control their availability status so requesters only see ready donors.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/30">
              <Droplets className="w-4 h-4" />
              Smart Blood Donor Matching Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Every Second<br />
              <span className="text-red-200">Matters.</span>
            </h1>
            <p className="text-lg sm:text-xl text-red-100 leading-relaxed mb-4 max-w-2xl">
              RAKTSETU connects blood requests with potentially suitable registered donors based on blood group, location, availability and urgency.
            </p>
            <p className="text-red-200 text-base mb-10 italic">
              "Connecting Blood. Connecting Lives."
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/requester/create-request" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all shadow-lg text-base">
                <Activity className="w-5 h-5" />
                Find Blood
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white/60 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-base backdrop-blur-sm">
                <Heart className="w-5 h-5" />
                Become a Donor
              </Link>
            </div>
          </div>
        </div>

        {/* Blood group pills */}
        <div className="relative border-t border-white/20 bg-black/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="text-red-200 text-sm font-medium whitespace-nowrap flex-shrink-0">Blood Groups:</span>
            {bloodGroups.map(bg => (
              <span key={bg} className="flex-shrink-0 px-3 py-1 bg-white/20 rounded-full text-sm font-bold border border-white/30 backdrop-blur-sm">
                {bg}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '15+', label: 'Registered Donors' },
            { value: '8', label: 'Blood Groups Covered' },
            { value: '< 30s', label: 'Matching Speed' },
            { value: '24/7', label: 'Platform Availability' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-red-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How RAKTSETU Works</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">A simple 4-step process that could make the difference in a critical moment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                {i + 1}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency feature spotlight */}
      <section className="bg-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-bold mb-6 border border-white/30">
              🚨 Emergency Mode
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Critical Moments</h2>
            <p className="text-red-100 text-lg mb-8 leading-relaxed">
              Mark a blood request as <strong>URGENT</strong> and RAKTSETU will prioritize matching — surfacing the nearest available compatible donors immediately, with emergency visual indicators throughout the platform.
            </p>
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 text-left max-w-sm mx-auto backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🚨</span>
                <span className="font-bold text-lg">URGENT BLOOD REQUEST</span>
              </div>
              <div className="space-y-1.5 text-sm text-red-100">
                <p>🩸 O+ blood required • 2 units</p>
                <p>🏥 DMC Hospital, Ludhiana</p>
                <p>✅ 3 matching donors found</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why RAKTSETU */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Why RAKTSETU?</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Everything you need to coordinate blood donation faster and smarter.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Save a Life?</h2>
          <p className="text-gray-400 text-lg mb-8">Join RAKTSETU today — as a donor or to find blood for someone in need.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=donor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all text-base">
              <Heart className="w-5 h-5" />
              Register as Donor
            </Link>
            <Link to="/register?role=requester" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all text-base">
              <Activity className="w-5 h-5" />
              Find Blood Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">RAKT<span className="text-red-600">SETU</span></span>
            </div>
            <p className="text-xs text-gray-400 text-center max-w-xl leading-relaxed">
              ⚠️ RAKTSETU is a coordination platform and does not replace professional medical advice, blood banks, hospitals, or compatibility testing. Blood compatibility must be confirmed by a qualified medical professional before transfusion.
            </p>
            <p className="text-xs text-gray-400">© 2026 RAKTSETU</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
