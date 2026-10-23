import React from 'react';
import { Plane, Train, Bus, Sparkles, Compass, BarChart3, Ticket, User, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, bookingsCount, currency, setCurrency }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#4096FF] flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="relative flex items-center justify-center text-white">
                <Plane className="w-5 h-5 absolute -top-1 -right-1 text-white animate-pulse" />
                <Train className="w-5 h-5 absolute text-blue-100" />
                <Bus className="w-4 h-4 absolute -bottom-1 -left-1 text-amber-200" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#10224D] via-[#1677FF] to-[#10224D] bg-clip-text text-transparent">
                  TravelSmart
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F2FF] text-[#1677FF] border border-blue-200 uppercase tracking-wider">
                  India Multimodal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Integrated Transportation Management System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F4F8FF] p-1.5 rounded-2xl border border-blue-100">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-[#1677FF] shadow-sm'
                  : 'text-slate-600 hover:text-[#10224D] hover:bg-white/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Search Journeys
            </button>

            <button
              onClick={() => setActiveTab('hybrid-builder')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === 'hybrid-builder'
                  ? 'bg-white text-[#1677FF] shadow-sm'
                  : 'text-slate-600 hover:text-[#10224D] hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Choose Your Own Hybrid
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                Flagship
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#1677FF] shadow-sm'
                  : 'text-slate-600 hover:text-[#10224D] hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Mode Comparison
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === 'bookings'
                  ? 'bg-white text-[#1677FF] shadow-sm'
                  : 'text-slate-600 hover:text-[#10224D] hover:bg-white/50'
              }`}
            >
              <Ticket className="w-4 h-4" />
              My Bookings
              {bookingsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white text-[11px] font-bold flex items-center justify-center">
                  {bookingsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Tools (Currency Dropdown with INR default, User profile) */}
          <div className="flex items-center gap-3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select Currency"
              className="bg-[#F4F8FF] border border-blue-100 text-xs font-bold text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#1677FF] cursor-pointer"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#10224D] to-[#1677FF] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                AS
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-[#10224D]">Ananya Sharma</div>
                <div className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 inline" /> Verified Traveler
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
