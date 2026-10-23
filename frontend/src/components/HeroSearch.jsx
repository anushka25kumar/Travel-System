import React, { useState, useEffect, useRef } from 'react';
import { Plane, Train, Bus, Shuffle, ArrowRightLeft, Calendar, Users, Search, Sparkles, MapPin, Check, ChevronDown } from 'lucide-react';
import { travelApi } from '../services/api';

const INDIAN_POPULAR_CORRIDORS = [
  { from: 'Pune, Maharashtra (PNQ)', to: 'Mumbai, Maharashtra (BOM)', label: 'Pune → Mumbai' },
  { from: 'Pune, Maharashtra (PNQ)', to: 'New Delhi, Delhi (DEL)', label: 'Pune → Delhi' },
  { from: 'Mumbai, Maharashtra (BOM)', to: 'Bengaluru, Karnataka (BLR)', label: 'Mumbai → Bengaluru' },
  { from: 'New Delhi, Delhi (DEL)', to: 'Jaipur, Rajasthan (JAI)', label: 'Delhi → Jaipur' },
  { from: 'Mumbai, Maharashtra (BOM)', to: 'Goa (GOI)', label: 'Mumbai → Goa' },
  { from: 'New Delhi, Delhi (DEL)', to: 'Lucknow, Uttar Pradesh (LKO)', label: 'Delhi → Lucknow' },
  { from: 'Bengaluru, Karnataka (BLR)', to: 'Hyderabad, Telangana (HYD)', label: 'Bengaluru → Hyderabad' },
  { from: 'Chennai, Tamil Nadu (MAA)', to: 'Bengaluru, Karnataka (BLR)', label: 'Chennai → Bengaluru' }
];

export default function HeroSearch({ 
  searchParams, 
  setSearchParams, 
  onSearch, 
  loading,
  onOpenCustomBuilder 
}) {
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [airports, setAirports] = useState([]);
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);

  const sourceRef = useRef(null);
  const destRef = useRef(null);

  // Load Indian airports on mount
  useEffect(() => {
    travelApi.getAirports()
      .then(data => {
        if (data && data.length > 0) {
          setAirports(data);
        }
      })
      .catch(err => console.error('Error fetching airports:', err));
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target)) {
        setIsSourceOpen(false);
      }
      if (destRef.current && !destRef.current.contains(e.target)) {
        setIsDestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwap = () => {
    setSearchParams(prev => ({
      ...prev,
      source: prev.destination,
      destination: prev.source
    }));
  };

  const handleModeChange = (mode) => {
    setSearchParams(prev => ({ ...prev, mode }));
  };

  // Filter airports by City, Airport Name, State, or IATA Code
  const filterAirportList = (searchTerm, excludeValue) => {
    const term = (searchTerm || '').toLowerCase().trim();
    return airports.filter(a => {
      const formatted = `${a.city}, ${a.state} (${a.iataCode})`;
      if (excludeValue && formatted.toLowerCase() === excludeValue.toLowerCase()) {
        return false;
      }
      if (!term) return true;
      return (
        a.city.toLowerCase().includes(term) ||
        a.airportName.toLowerCase().includes(term) ||
        a.state.toLowerCase().includes(term) ||
        a.iataCode.toLowerCase().includes(term)
      );
    });
  };

  const handleSelectSource = (airport) => {
    const val = `${airport.city}, ${airport.state} (${airport.iataCode})`;
    setSearchParams(prev => ({ ...prev, source: val }));
    setIsSourceOpen(false);
    setSourceSearch('');
  };

  const handleSelectDest = (airport) => {
    const val = `${airport.city}, ${airport.state} (${airport.iataCode})`;
    setSearchParams(prev => ({ ...prev, destination: val }));
    setIsDestOpen(false);
    setDestSearch('');
  };

  return (
    <div className="relative pt-8 pb-10">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#E8F2FF]/70 via-[#F4F8FF] to-transparent -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Tagline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F2FF] border border-blue-200 text-[#1677FF] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            India's First Integrated Multimodal Travel Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#10224D] leading-tight">
            Connect <span className="text-[#1677FF]">Flights, Trains & Buses</span> in One Seamless Ticket
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Compare Indian domestic routes across Air India, IndiGo, Vande Bharat, and Intercity Coaches. Or craft your own custom hybrid itinerary with fares in Indian Rupees (₹).
          </p>
        </div>

        {/* Main Search Panel */}
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-4 sm:p-6 transition-all hover:shadow-card-hover">
          
          {/* Transport Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-5">
            <div className="flex flex-wrap items-center gap-2 bg-[#F4F8FF] p-1.5 rounded-2xl border border-blue-100">
              
              <button
                type="button"
                onClick={() => handleModeChange('ALL')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  searchParams.mode === 'ALL'
                    ? 'bg-[#1677FF] text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-[#10224D] hover:bg-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                All Multimodal
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('FLIGHT')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  searchParams.mode === 'FLIGHT'
                    ? 'bg-[#1677FF] text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-[#10224D] hover:bg-white'
                }`}
              >
                <Plane className="w-4 h-4" />
                Flights
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('TRAIN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  searchParams.mode === 'TRAIN'
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/25'
                    : 'text-slate-600 hover:text-[#10224D] hover:bg-white'
                }`}
              >
                <Train className="w-4 h-4" />
                Trains (Vande Bharat / IRCTC)
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('BUS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  searchParams.mode === 'BUS'
                    ? 'bg-[#F59E0B] text-white shadow-md shadow-amber-500/25'
                    : 'text-slate-600 hover:text-[#10224D] hover:bg-white'
                }`}
              >
                <Bus className="w-4 h-4" />
                Buses (SmartBus / Volvo)
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('HYBRID')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  searchParams.mode === 'HYBRID'
                    ? 'bg-gradient-to-r from-[#1677FF] to-[#7C3AED] text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-[#10224D] hover:bg-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
                Hybrid Journeys
              </button>
            </div>

            {/* Custom Builder Quick Trigger */}
            <button
              type="button"
              onClick={onOpenCustomBuilder}
              className="flex items-center gap-2 text-xs font-bold text-[#1677FF] bg-[#E8F2FF] hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Build Custom Hybrid Route &rarr;
            </button>
          </div>

          {/* Search Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Searchable Origin Dropdown */}
            <div className="md:col-span-3 relative" ref={sourceRef}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Leaving From
              </label>
              <div 
                onClick={() => setIsSourceOpen(!isSourceOpen)}
                className="w-full pl-9 pr-8 py-3 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs sm:text-sm font-bold text-[#10224D] focus:ring-2 focus:ring-[#1677FF] cursor-pointer flex items-center justify-between"
              >
                <MapPin className="w-4 h-4 absolute left-3 text-slate-400" />
                <span className="truncate">{searchParams.source || 'Pune, Maharashtra (PNQ)'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5" />
              </div>

              {isSourceOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95">
                  <input
                    type="text"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    placeholder="Search by city, airport, state, or IATA (e.g. PNQ, Pune, BOM)"
                    autoFocus
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs font-bold text-[#10224D] outline-none mb-2 focus:ring-2 focus:ring-[#1677FF]"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filterAirportList(sourceSearch, searchParams.destination).slice(0, 20).map(a => (
                      <div
                        key={a.iataCode}
                        onClick={() => handleSelectSource(a)}
                        className="p-2.5 rounded-xl hover:bg-[#E8F2FF] cursor-pointer transition-colors flex items-start justify-between text-xs"
                      >
                        <div>
                          <div className="font-extrabold text-[#10224D]">{a.city}, {a.state}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[240px]">{a.airportName}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#1677FF] font-black text-[10px]">
                          {a.iataCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap origin and destination"
                className="w-10 h-10 rounded-full bg-[#E8F2FF] hover:bg-[#1677FF] text-[#1677FF] hover:text-white border border-blue-200 flex items-center justify-center transition-all shadow-xs hover:rotate-180 hover:scale-105"
                title="Swap origin and destination"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Searchable Destination Dropdown */}
            <div className="md:col-span-3 relative" ref={destRef}>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Going To
              </label>
              <div 
                onClick={() => setIsDestOpen(!isDestOpen)}
                className="w-full pl-9 pr-8 py-3 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs sm:text-sm font-bold text-[#10224D] focus:ring-2 focus:ring-[#1677FF] cursor-pointer flex items-center justify-between"
              >
                <MapPin className="w-4 h-4 absolute left-3 text-[#1677FF]" />
                <span className="truncate">{searchParams.destination || 'New Delhi, Delhi (DEL)'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5" />
              </div>

              {isDestOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95">
                  <input
                    type="text"
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    placeholder="Search by city, airport, state, or IATA (e.g. DEL, Delhi, Mumbai)"
                    autoFocus
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs font-bold text-[#10224D] outline-none mb-2 focus:ring-2 focus:ring-[#1677FF]"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filterAirportList(destSearch, searchParams.source).slice(0, 20).map(a => (
                      <div
                        key={a.iataCode}
                        onClick={() => handleSelectDest(a)}
                        className="p-2.5 rounded-xl hover:bg-[#E8F2FF] cursor-pointer transition-colors flex items-start justify-between text-xs"
                      >
                        <div>
                          <div className="font-extrabold text-[#10224D]">{a.city}, {a.state}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[240px]">{a.airportName}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-[#1677FF] font-black text-[10px]">
                          {a.iataCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Travel Date */}
            <div className="md:col-span-2 relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Departure Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={searchParams.travelDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, travelDate: e.target.value }))}
                  aria-label="Departure Date"
                  className="w-full pl-9 pr-3 py-3 bg-[#F4F8FF] border border-blue-100 rounded-xl text-sm font-semibold text-[#10224D] focus:ring-2 focus:ring-[#1677FF] focus:bg-white outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Passengers Dropdown */}
            <div className="md:col-span-2 relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Passengers
              </label>
              <button
                type="button"
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="w-full pl-9 pr-3 py-3 bg-[#F4F8FF] border border-blue-100 rounded-xl text-sm font-semibold text-[#10224D] flex items-center justify-between text-left focus:ring-2 focus:ring-[#1677FF]"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <span>{searchParams.passengers} Passenger{searchParams.passengers > 1 ? 's' : ''}</span>
                </div>
              </button>

              {showPassengerDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-[#10224D]">Passengers</div>
                      <div className="text-xs text-slate-400">Adults (12+ yrs)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSearchParams(p => ({ ...p, passengers: Math.max(1, p.passengers - 1) }))}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-[#10224D]">{searchParams.passengers}</span>
                      <button
                        type="button"
                        onClick={() => setSearchParams(p => ({ ...p, passengers: Math.min(6, p.passengers + 1) }))}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassengerDropdown(false)}
                    className="w-full py-2 bg-[#E8F2FF] text-[#1677FF] font-bold text-xs rounded-xl hover:bg-blue-100"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="md:col-span-1 flex items-end">
              <button
                type="button"
                onClick={onSearch}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#1677FF] to-[#2F54EB] hover:from-[#4096FF] hover:to-[#1677FF] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

          </div>

          {/* Indian Popular Corridors */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Popular Indian Corridors:</span>
            {INDIAN_POPULAR_CORRIDORS.map(corridor => (
              <button
                key={corridor.label}
                type="button"
                onClick={() => setSearchParams(prev => ({ ...prev, source: corridor.from, destination: corridor.to }))}
                className="px-2.5 py-1 rounded-lg bg-[#F4F8FF] hover:bg-blue-50 text-slate-700 hover:text-[#1677FF] font-medium border border-blue-50 transition-colors"
              >
                {corridor.label}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
