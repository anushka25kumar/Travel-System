import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, Clock, MapPin, CheckCircle, XCircle, Trash2, Printer, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { travelApi } from '../services/api';
import { formatINR } from '../utils/currency';

export default function MyBookings({ onNewSearch }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingRef, setCancellingRef] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await travelApi.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (reference) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${reference}? A full refund will be initiated.`)) {
      return;
    }

    setCancellingRef(reference);
    try {
      await travelApi.cancelBooking(reference);
      await fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    } finally {
      setCancellingRef(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F2FF] text-[#1677FF] text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" />
            Ticket Management & Boarding Passes
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10224D] tracking-tight">
            My Booked Journeys
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View active boarding passes, live multimodal transit tracker, and booking history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={onNewSearch}
            className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
          >
            + Book New Journey
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 font-semibold shadow-card border border-slate-100">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#1677FF]" />
          Loading your travel bookings from Spring Boot database...
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-100">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#10224D]">No Bookings Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            You don't have any booked journeys yet. Use our multimodal search or Custom Hybrid builder to plan your trip!
          </p>
          <button
            onClick={onNewSearch}
            className="px-6 py-3 bg-[#1677FF] text-white font-bold text-xs rounded-xl shadow-md"
          >
            Search Available Journeys
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(b => (
            <div
              key={b.bookingReference}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-card hover:shadow-card-hover ${
                b.status === 'CANCELLED' ? 'border-rose-100 opacity-75' : 'border-slate-100'
              }`}
            >
              {/* Reference & Status */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reference
                  </span>
                  <span className="text-base font-extrabold text-[#10224D]">
                    {b.bookingReference}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'CONFIRMED' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#B91C1C] border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" /> Cancelled & Refunded
                    </span>
                  )}
                </div>
              </div>

              {/* Route & Times */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-[#10224D]">
                      {b.originCity} &rarr; {b.destinationCity}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.travelDate}</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {b.totalDurationMinutes} mins</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-[#10224D]">{formatINR(b.totalPrice)}</span>
                    <span className="text-[11px] text-slate-400 block">{b.passengersCount} Passenger</span>
                  </div>
                </div>

                {/* Live Timeline Tracker */}
                {b.status === 'CONFIRMED' && (
                  <div className="p-3.5 rounded-2xl bg-[#F4F8FF] border border-blue-100">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1677FF] mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
                        Live Status: Scheduled & On Time
                      </span>
                      <span className="text-[10px] text-slate-400">Boarding in 45 mins</span>
                    </div>
                    <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#1677FF] h-full w-1/3 rounded-full" />
                    </div>
                  </div>
                )}

                {/* Segments summary */}
                {b.legs && b.legs.length > 0 && (
                  <div className="text-xs text-slate-500 pt-1">
                    <span className="font-bold text-slate-600">Transit Legs: </span>
                    {b.legs.map((leg, idx) => (
                      <span key={idx} className="inline-block mr-2">
                        {leg.mode} ({leg.carrierName})
                        {idx < b.legs.length - 1 && ' \u2192 '}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(b)}
                  className="px-4 py-2 bg-[#E8F2FF] hover:bg-blue-100 text-[#1677FF] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Ticket className="w-3.5 h-3.5" /> View Boarding Pass
                </button>

                {b.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b.bookingReference)}
                    disabled={cancellingRef === b.bookingReference}
                    className="text-xs text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Cancel Ticket
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Boarding Pass Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#1677FF]" />
                <span className="text-base font-extrabold text-[#10224D]">Boarding Pass</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
              >
                &times;
              </button>
            </div>

            <div className="bg-[#F4F8FF] p-5 rounded-2xl border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Passenger</div>
                  <div className="text-sm font-bold text-[#10224D]">{selectedTicket.contactName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">PNR Reference</div>
                  <div className="text-sm font-black text-[#1677FF]">{selectedTicket.bookingReference}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-blue-100 pt-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">From</span>
                  <span className="font-extrabold text-[#10224D]">{selectedTicket.originCity}</span>
                </div>
                <div className="text-slate-300 font-black">&rarr;</div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">To</span>
                  <span className="font-extrabold text-[#10224D]">{selectedTicket.destinationCity}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                <div className="w-28 h-28 bg-[#10224D] p-2 rounded-xl flex items-center justify-center mb-2">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                    <path d="M2 2h8v8H2zm2 2v4h4V4zm10-2h8v8h-8zm2 2v4h4V4zM2 14h8v8H2zm2 2v4h4v-4zm10-2h3v3h-3zm5 0h3v3h-3zm-5 5h3v3h-3zm5 0h3v3h-3zM5 5h2v2H5zm12 0h2v2h-2zM5 17h2v2H5z"/>
                  </svg>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Scan at Platform Gate
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2.5 bg-[#1677FF] text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
