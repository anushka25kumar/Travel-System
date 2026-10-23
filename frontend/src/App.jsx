import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSearch from './components/HeroSearch';
import QuickFilterBar from './components/QuickFilterBar';
import JourneyCard from './components/JourneyCard';
import RouteMap from './components/RouteMap';
import HybridJourneyBuilder from './components/HybridJourneyBuilder';
import ModeComparisonCharts from './components/ModeComparisonCharts';
import MyBookings from './components/MyBookings';
import BookingModal from './components/BookingModal';
import { travelApi } from './services/api';
import { Sparkles, MapPin, Compass, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'hybrid-builder', 'analytics', 'bookings'
  const [currency, setCurrency] = useState('INR');
  const [bookingsCount, setBookingsCount] = useState(1);

  const [searchParams, setSearchParams] = useState({
    source: 'Pune, Maharashtra (PNQ)',
    destination: 'New Delhi, Delhi (DEL)',
    travelDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    passengers: 1,
    mode: 'ALL',
    sortBy: 'RECOMMENDED'
  });

  const [journeyResults, setJourneyResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECOMMENDED');

  const [selectedJourneyForMap, setSelectedJourneyForMap] = useState(null);
  const [selectedJourneyForBooking, setSelectedJourneyForBooking] = useState(null);

  // Perform search against Spring Boot REST API
  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await travelApi.searchLive({
        ...searchParams,
        sortBy
      });
      const items = res?.journeys || (Array.isArray(res) ? res : []);
      setJourneyResults(items);
      setSearchStatus(res?.status || null);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (items.length > 0) {
        setSelectedJourneyForMap(items[0]);
      }
    } catch (err) {
      console.error('Failed to search journeys:', err);
      // Fallback to legacy endpoint if live endpoint encounters network issue
      try {
        const fallbackData = await travelApi.searchJourneys({ ...searchParams, sortBy });
        setJourneyResults(fallbackData || []);
        setSearchStatus({
          statusCode: 'SHOWING_DEMO_RESULTS',
          statusMessage: 'Live search gateway returned error. Displaying local verified timetables.'
        });
      } catch (e2) {
        setSearchStatus({
          statusCode: 'UNABLE_TO_FETCH_LIVE_DATA',
          statusMessage: 'Unable to connect to travel providers. Please check your internet or retry.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial results and bookings count on load
  useEffect(() => {
    handleSearch();
    travelApi.getBookings()
      .then(b => setBookingsCount(b?.length || 0))
      .catch(() => {});
  }, []);

  // Trigger search when sort or mode changes
  useEffect(() => {
    handleSearch();
  }, [searchParams.mode, sortBy]);

  // Filter journeys by quick filter pills
  const filteredJourneys = journeyResults.filter(j => {
    if (activeFilter === 'ALL') return true;
    return j.recommendationTag === activeFilter;
  });

  const handleResetFilters = () => {
    setActiveFilter('ALL');
    setSortBy('RECOMMENDED');
    setSearchParams(prev => ({ ...prev, mode: 'ALL' }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FF] font-sans antialiased text-[#10224D]">
      
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingsCount={bookingsCount}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* VIEW 1: SEARCH & BOOK JOURNEYS */}
        {activeTab === 'search' && (
          <div>
            <HeroSearch
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              onSearch={handleSearch}
              loading={loading}
              onOpenCustomBuilder={() => setActiveTab('hybrid-builder')}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Search Metadata & Refresh Status Banner */}
              {searchStatus && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-2xs text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Info className="w-4 h-4 text-[#1677FF] shrink-0" />
                    <span className="font-semibold">{searchStatus.statusMessage}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {lastUpdated && (
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
                        Last updated at {lastUpdated}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-[#1677FF] hover:bg-blue-100 font-bold text-xs transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      Refresh Results
                    </button>
                  </div>
                </div>
              )}

              <QuickFilterBar
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                resultsCount={filteredJourneys.length}
                onReset={handleResetFilters}
              />

              {loading ? (
                <div className="bg-white rounded-3xl p-16 text-center text-slate-400 font-bold border border-slate-100 shadow-card">
                  <div className="w-8 h-8 border-3 border-[#1677FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Searching real-time flights, trains, and hybrid journeys via Spring Boot & external providers...
                </div>
              ) : filteredJourneys.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-card">
                  <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  
                  {activeFilter !== 'ALL' ? (
                    <>
                      <h3 className="text-lg font-bold text-[#10224D]">No Journeys Matched "{activeFilter}" Filter</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                        Other transportation options are available for this route. Reset the filter to view all {journeyResults.length} options.
                      </p>
                      <button
                        onClick={() => setActiveFilter('ALL')}
                        className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Reset Filter ({journeyResults.length} Options Available)
                      </button>
                    </>
                  ) : searchStatus?.statusCode === 'NO_SERVICES_AVAILABLE' ? (
                    <>
                      <h3 className="text-lg font-bold text-[#10224D]">No Services Available</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                        The transport providers returned no matching scheduled services for this corridor on the selected date.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Reset All Filters & Search
                      </button>
                    </>
                  ) : searchStatus?.statusCode === 'UNABLE_TO_FETCH_LIVE_DATA' ? (
                    <>
                      <h3 className="text-lg font-bold text-[#10224D]">Unable to Fetch Live Data</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                        External transport providers encountered an unexpected connection delay. Click refresh below to retry.
                      </p>
                      <button
                        onClick={handleSearch}
                        className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Retry Search
                      </button>
                    </>
                  ) : searchStatus?.statusCode === 'PROVIDER_NOT_CONNECTED' ? (
                    <>
                      <h3 className="text-lg font-bold text-[#10224D]">Provider Not Connected</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                        External API credentials are not yet configured in environment variables.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Reset Filters
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-[#10224D]">No Services Available</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                        No transit options matched your current query. Try resetting your search filters or try our Custom Hybrid route builder!
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Reset Filters
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Journey Cards List */}
                  <div className="lg:col-span-7 space-y-4">
                    {filteredJourneys.map((journey) => (
                      <JourneyCard
                        key={journey.id}
                        journey={journey}
                        currency={currency}
                        onSelect={(j) => setSelectedJourneyForBooking(j)}
                        onViewMap={(j) => setSelectedJourneyForMap(j)}
                        isSelectedForMap={selectedJourneyForMap?.id === journey.id}
                      />
                    ))}
                  </div>

                  {/* Right Column: Sticky Live Route Map */}
                  <div className="lg:col-span-5 sticky top-28 space-y-4">
                    <RouteMap
                      selectedJourney={selectedJourneyForMap || filteredJourneys[0]}
                      customLegs={null}
                    />

                    {/* Banner to Switch to Custom Hybrid */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-amber-300">
                          <Sparkles className="w-3.5 h-3.5" /> Unique Feature
                        </div>
                        <div className="text-sm font-black mt-0.5">Want complete route control?</div>
                        <div className="text-[11px] text-blue-100">Pick transit modes and intermediate cities manually.</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('hybrid-builder')}
                        className="px-3.5 py-2 bg-white text-[#1677FF] hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-xs shrink-0"
                      >
                        Try Builder &rarr;
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 2: FLAGSHIP CHOOSE YOUR OWN HYBRID JOURNEY */}
        {activeTab === 'hybrid-builder' && (
          <HybridJourneyBuilder
            currency={currency}
            onSelectForBooking={(j) => setSelectedJourneyForBooking(j)}
          />
        )}

        {/* VIEW 3: MODE COMPARISON ANALYTICS */}
        {activeTab === 'analytics' && (
          <ModeComparisonCharts />
        )}

        {/* VIEW 4: MY BOOKINGS */}
        {activeTab === 'bookings' && (
          <MyBookings
            onNewSearch={() => setActiveTab('search')}
          />
        )}

      </main>

      {/* Booking Checkout Modal */}
      {selectedJourneyForBooking && (
        <BookingModal
          journey={selectedJourneyForBooking}
          onClose={() => setSelectedJourneyForBooking(null)}
          onBookingComplete={(newBooking) => {
            setBookingsCount(prev => prev + 1);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#10224D] text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div>
            <div className="text-base font-black text-white flex items-center gap-2">
              <span className="text-[#1677FF]">TravelSmart</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700">
                Java 21 &middot; Spring Boot &middot; MySQL &middot; React
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Integrated Multimodal Transportation Management System &middot; Prototype Demo
            </p>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <button onClick={() => setActiveTab('search')} className="hover:text-white transition-colors">
              Search Routes
            </button>
            <button onClick={() => setActiveTab('hybrid-builder')} className="hover:text-white transition-colors">
              Custom Hybrid Builder
            </button>
            <button onClick={() => setActiveTab('analytics')} className="hover:text-white transition-colors">
              Mode Comparison
            </button>
            <button onClick={() => setActiveTab('bookings')} className="hover:text-white transition-colors">
              My Bookings
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            &copy; 2026 TravelSmart Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
