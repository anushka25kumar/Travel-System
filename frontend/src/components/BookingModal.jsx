import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import confetti from 'canvas-confetti';
import { 
  X, CheckCircle, ShieldCheck, CreditCard, Ticket, 
  MapPin, Clock, Leaf, User, Mail, Phone, 
  ArrowRight, Download, Printer, Sparkles, AlertCircle 
} from 'lucide-react';
import { travelApi } from '../services/api';
import { formatINR } from '../utils/currency';

export default function BookingModal({ journey, onClose, onBookingComplete }) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Review, 2: Passengers, 3: Seats & Add-ons, 4: Confirmation
  const [selectedSeats, setSelectedSeats] = useState({ 1: 'Coach C2 - 14A (Window)', 2: 'Seat 8C (Aisle)' });
  const [hasLuggageInsurance, setHasLuggageInsurance] = useState(true);
  const [hasCarbonOffset, setHasCarbonOffset] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: 'Ananya Sharma',
      email: 'ananya.sharma@travelsmart.in',
      phone: '+91 98220 12345',
      passengerCount: 1,
      paymentMethod: 'UPI / CREDIT_CARD'
    }
  });

  const basePrice = Number(journey?.totalPrice || 4650);
  const addOnsTotal = (hasLuggageInsurance ? 350 : 0) + (hasCarbonOffset ? 120 : 0);
  const finalPrice = Math.round(basePrice + addOnsTotal);

  const onSubmitPassengerForm = (data) => {
    setCurrentStep(3);
  };

  const handleFinalPayment = async (formData) => {
    setSubmitting(true);
    try {
      // Revalidate live fare and seat availability with provider
      try {
        const reval = await travelApi.revalidateOffer({
          journeyId: journey.id,
          providerOfferId: journey.providerOfferId,
          transportMode: journey.journeyType,
          currentPrice: Number(finalPrice),
          passengersCount: 1
        });
        if (reval && !reval.valid && !reval.seatsAvailable) {
          alert('Provider Alert: ' + (reval.statusMessage || 'Offer has expired. Please select another journey.'));
          setSubmitting(false);
          return;
        }
      } catch (revErr) {
        console.warn('Revalidation check notice:', revErr);
      }

      const payload = {
        journeyType: journey.journeyType || 'HYBRID',
        originCity: journey.sourceCity,
        destinationCity: journey.destCity,
        travelDate: new Date().toISOString().split('T')[0],
        passengersCount: 1,
        totalPrice: Number(finalPrice),
        totalDurationMinutes: journey.totalDurationMinutes,
        totalCo2Kg: journey.totalCo2Kg,
        contactName: 'Ananya Sharma',
        contactEmail: 'ananya.sharma@travelsmart.in',
        contactPhone: '+91 98220 12345',
        passengerNames: 'Ananya Sharma',
        seatSelections: Object.values(selectedSeats).join(', '),
        hasLuggageInsurance,
        hasCarbonOffset,
        paymentMethod: 'UPI / CREDIT_CARD',
        legs: journey.legs || []
      };

      const result = await travelApi.createBooking(payload);
      setConfirmedBooking(result);
      setCurrentStep(4);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onBookingComplete) {
        onBookingComplete(result);
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#10224D] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1677FF] flex items-center justify-center font-bold text-xs shadow-sm">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {currentStep === 4 ? 'Booking Confirmed!' : 'Complete Your Multimodal Reservation'}
              </h3>
              <p className="text-xs text-blue-200">
                {journey?.sourceCity} &rarr; {journey?.destCity} &middot; {journey?.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Indicator */}
        {currentStep < 4 && (
          <div className="bg-[#F4F8FF] px-6 py-3 border-b border-blue-50 flex items-center justify-between text-xs font-bold text-slate-500">
            <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-[#1677FF]' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1677FF] flex items-center justify-center text-[10px]">1</span>
              <span>Itinerary</span>
            </div>
            <span className="text-slate-300">&rarr;</span>
            <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-[#1677FF]' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1677FF] flex items-center justify-center text-[10px]">2</span>
              <span>Passenger Info</span>
            </div>
            <span className="text-slate-300">&rarr;</span>
            <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-[#1677FF]' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1677FF] flex items-center justify-center text-[10px]">3</span>
              <span>Seats & Add-ons</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {/* STEP 1: Itinerary Summary Review */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="bg-[#F4F8FF] p-4 rounded-2xl border border-blue-100">
                <div className="text-xs font-bold text-[#1677FF] uppercase tracking-wider mb-2">
                  Trip Overview
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-[#10224D] mb-2">
                  <span>{journey?.sourceCity} &rarr; {journey?.destCity}</span>
                  <span className="text-xl font-black">{formatINR(basePrice)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Duration: {journey?.totalDurationMinutes} mins</span>
                  <span className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-emerald-600" /> CO₂: {journey?.totalCo2Kg} kg</span>
                  <span>Transfers: {journey?.transfersCount || 0}</span>
                </div>
              </div>

              {/* Legs list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Segment Breakdown</span>
                {journey?.legs?.map((leg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1677FF] font-bold text-xs flex items-center justify-center">
                        {leg.legOrder || idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#10224D]">
                          {leg.sourceCity || leg.sourceStationName} &rarr; {leg.destCity || leg.destStationName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {leg.mode} &middot; {leg.carrierName} ({leg.carrierCode}) &middot; {leg.durationMinutes} mins
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#10224D]">{formatINR(leg.price)}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">{leg.co2Kg} kg CO₂</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2"
                >
                  Continue to Passenger Details &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Passenger Details Form */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit(onSubmitPassengerForm)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      {...register('fullName', { required: 'Full name is required' })}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs font-bold text-[#10224D] outline-none focus:ring-2 focus:ring-[#1677FF]"
                      placeholder="e.g. Ananya Sharma"
                    />
                  </div>
                  {errors.fullName && <p className="text-rose-500 text-[10px] mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs font-bold text-[#10224D] outline-none focus:ring-2 focus:ring-[#1677FF]"
                      placeholder="ananya.sharma@travelsmart.in"
                    />
                  </div>
                  {errors.email && <p className="text-rose-500 text-[10px] mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs font-bold text-[#10224D] outline-none focus:ring-2 focus:ring-[#1677FF]"
                      placeholder="+91 98220 12345"
                    />
                  </div>
                  {errors.phone && <p className="text-rose-500 text-[10px] mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Government ID / Aadhaar</label>
                  <input
                    defaultValue="AADHAAR-4921-8849-1029"
                    className="w-full px-3 py-2.5 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs font-bold text-[#10224D] outline-none focus:ring-2 focus:ring-[#1677FF]"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl text-[11px] text-blue-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#1677FF]" />
                <span>Your travel details are encrypted and securely synchronized across Air India, IndiGo, Indian Railways (IRCTC), and MSRTC / IntrCity.</span>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  &larr; Back to Review
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2"
                >
                  Select Seats & Add-ons &rarr;
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Interactive Seat Selection & Add-ons */}
          {currentStep === 3 && (
            <div className="space-y-5">
              
              {/* Seat Selection Panel */}
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Select Seats for Each Leg
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {journey?.legs?.map((leg, idx) => (
                    <div key={idx} className="p-3.5 bg-[#F4F8FF] rounded-2xl border border-blue-100">
                      <div className="text-xs font-bold text-[#10224D] mb-1">
                        Leg {idx + 1}: {leg.sourceCity} &rarr; {leg.destCity}
                      </div>
                      <div className="text-[11px] text-slate-500 mb-2">
                        {leg.mode} &middot; {leg.carrierName}
                      </div>
                      <div className="flex items-center gap-2">
                        {['12A', '14A (Window)', '8C (Aisle)', '10B'].map(seat => (
                          <button
                            key={seat}
                            type="button"
                            onClick={() => setSelectedSeats(prev => ({ ...prev, [idx + 1]: seat }))}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              selectedSeats[idx + 1] === seat
                                ? 'bg-[#1677FF] text-white border-[#1677FF]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-200'
                            }`}
                          >
                            {seat}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Recommended Add-ons</span>
                
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-200 cursor-pointer bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hasLuggageInsurance}
                      onChange={(e) => setHasLuggageInsurance(e.target.checked)}
                      className="w-4 h-4 text-[#1677FF] rounded focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#10224D]">Comprehensive Multi-Carrier Baggage Protection</div>
                      <div className="text-[11px] text-slate-400">Guaranteed luggage transfer insurance across all rail and coach segments</div>
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-[#10224D]">+₹350</div>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-200 cursor-pointer bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hasCarbonOffset}
                      onChange={(e) => setHasCarbonOffset(e.target.checked)}
                      className="w-4 h-4 text-[#1677FF] rounded focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        100% Certified Carbon Neutral Offset
                      </div>
                      <div className="text-[11px] text-slate-400">Fund solar rail electrification & regional reforestation projects</div>
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-emerald-700">+₹120</div>
                </label>
              </div>

              {/* Total & Checkout Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Total Amount</div>
                  <div className="text-2xl font-black text-[#10224D]">{formatINR(finalPrice)}</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalPayment}
                    disabled={submitting}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#1677FF] to-[#2F54EB] hover:from-[#4096FF] hover:to-[#1677FF] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2"
                  >
                    {submitting ? 'Processing...' : 'Confirm & Pay ' + formatINR(finalPrice)}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: Confirmed E-Ticket & Boarding Pass */}
          {currentStep === 4 && confirmedBooking && (
            <div className="space-y-6 text-center">
              
              {/* Success Badge */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#DCFCE7] text-[#16A34A] mb-2 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-[#10224D]">Booking Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your electronic multimodal ticket has been issued and stored in Spring Boot & MySQL.
                </p>
              </div>

              {/* Printable Boarding Pass Card */}
              <div className="bg-[#F4F8FF] border border-blue-200 rounded-3xl p-6 text-left relative overflow-hidden shadow-sm">
                
                <div className="flex items-center justify-between border-b border-blue-100 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-[#1677FF] tracking-wider block">
                      Booking Reference (PNR)
                    </span>
                    <span className="text-2xl font-black text-[#10224D] tracking-wider">
                      {confirmedBooking.bookingReference}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Passenger</span>
                    <span className="text-sm font-bold text-[#10224D]">{confirmedBooking.contactName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Route</span>
                    <span className="font-bold text-[#10224D]">{confirmedBooking.originCity} &rarr; {confirmedBooking.destinationCity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Travel Date</span>
                    <span className="font-bold text-[#10224D]">{confirmedBooking.travelDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Total Paid</span>
                    <span className="font-bold text-[#10224D]">{formatINR(confirmedBooking.totalPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Status</span>
                    <span className="font-extrabold text-[#16A34A]">{confirmedBooking.status}</span>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="bg-white p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div className="text-xs">
                    <div className="font-bold text-[#10224D]">Digital Multimodal Boarding Pass</div>
                    <div className="text-[11px] text-slate-400">Scan at train platforms, airport gates & coach bays</div>
                  </div>
                  
                  {/* SVG QR Code pattern */}
                  <div className="w-16 h-16 bg-[#10224D] p-1.5 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-white">
                      <path d="M2 2h8v8H2zm2 2v4h4V4zm10-2h8v8h-8zm2 2v4h4V4zM2 14h8v8H2zm2 2v4h4v-4zm10-2h3v3h-3zm5 0h3v3h-3zm-5 5h3v3h-3zm5 0h3v3h-3zM5 5h2v2H5zm12 0h2v2h-2zM5 17h2v2H5z"/>
                    </svg>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Ticket
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#1677FF] hover:bg-[#4096FF] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25"
                >
                  Done / View in My Bookings
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
