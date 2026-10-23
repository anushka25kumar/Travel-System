import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Trash2, ArrowRight, ShieldAlert, CheckCircle, 
  AlertTriangle, Clock, DollarSign, Leaf, Plane, Train, Bus, Save, 
  Compass, RefreshCw, BookmarkCheck
} from 'lucide-react';
import { travelApi } from '../services/api';
import RouteMap from './RouteMap';
import { formatPrice, formatINR } from '../utils/currency';

const INDIAN_CITIES = [
  'Pune',
  'Mumbai',
  'New Delhi',
  'Jaipur',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Goa',
  'Lucknow',
  'Bhopal',
  'Indore',
  'Chandigarh',
  'Varanasi',
  'Patna',
  'Kochi',
  'Nagpur',
  'Srinagar',
  'Guwahati'
];

export default function HybridJourneyBuilder({ onSelectForBooking, currency }) {
  const [journeyName, setJourneyName] = useState('Pune to Delhi Hybrid Transit (Bus + Flight + Rail)');
  const [originCity, setOriginCity] = useState('Pune');
  const [destinationCity, setDestinationCity] = useState('New Delhi');
  
  // Intermediate stops (waypoints) - e.g. Pune -> Mumbai -> Jaipur -> Delhi
  const [intermediateStops, setIntermediateStops] = useState(['Mumbai', 'Jaipur']);
  
  // Modes for each leg (Leg 1: Bus, Leg 2: Flight, Leg 3: Train)
  const [legModes, setLegModes] = useState(['BUS', 'FLIGHT', 'TRAIN']);
  
  const [passengers, setPassengers] = useState(1);
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  const [validationResult, setValidationResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync legModes array length with stops
  useEffect(() => {
    const requiredLegsCount = intermediateStops.length + 1;
    setLegModes(prev => {
      const updated = [...prev];
      while (updated.length < requiredLegsCount) {
        updated.push(updated.length % 2 === 0 ? 'TRAIN' : 'BUS');
      }
      return updated.slice(0, requiredLegsCount);
    });
  }, [intermediateStops]);

  // Construct request payload
  const buildRequestPayload = () => {
    const legs = [];
    const sequence = [originCity, ...intermediateStops, destinationCity];

    for (let i = 0; i < sequence.length - 1; i++) {
      legs.push({
        legOrder: i + 1,
        fromCity: sequence[i],
        toCity: sequence[i + 1],
        preferredMode: legModes[i] || 'TRAIN'
      });
    }

    return {
      journeyName,
      originCity,
      destinationCity,
      travelDate,
      passengers: Number(passengers),
      legs
    };
  };

  // Evaluate Route with Java Spring Boot backend
  const handleValidateAndCalculate = async () => {
    setCalculating(true);
    setSaveSuccess(false);
    try {
      const payload = buildRequestPayload();
      const res = await travelApi.calculateCustomHybrid(payload);
      setValidationResult(res);
    } catch (err) {
      console.error('Error validating hybrid route:', err);
    } finally {
      setCalculating(false);
    }
  };

  // Run initial calculation once mounted
  useEffect(() => {
    handleValidateAndCalculate();
  }, [originCity, destinationCity, intermediateStops, legModes, passengers]);

  // Save to MySQL DB
  const handleSaveToDatabase = async () => {
    setSaving(true);
    try {
      const payload = buildRequestPayload();
      await travelApi.saveCustomHybrid(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving hybrid route:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStop = () => {
    if (intermediateStops.length >= 4) return;
    const available = INDIAN_CITIES.find(c => c !== originCity && c !== destinationCity && !intermediateStops.includes(c));
    if (available) {
      setIntermediateStops([...intermediateStops, available]);
    } else {
      setIntermediateStops([...intermediateStops, 'Jaipur']);
    }
  };

  const handleRemoveStop = (index) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index, newCity) => {
    const updated = [...intermediateStops];
    updated[index] = newCity;
    setIntermediateStops(updated);
  };

  const handleLegModeChange = (index, mode) => {
    const updated = [...legModes];
    updated[index] = mode;
    setLegModes(updated);
  };

  const formatDuration = (mins) => {
    if (!mins) return '0m';
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return hours > 0 ? `${hours}h ${m}m` : `${m}m`;
  };

  // Prepare custom journey object for booking modal
  const handleProceedToBooking = () => {
    if (!validationResult || !validationResult.valid) return;

    const customJourney = {
      id: 'CUSTOM-IN-' + Date.now(),
      title: journeyName,
      journeyType: 'CUSTOM_HYBRID',
      primaryCarrier: 'Custom Indian Multimodal Itinerary',
      carrierCode: 'TS-IN-CUSTOM',
      sourceCity: originCity,
      sourceStationName: originCity + ' Hub',
      destCity: destinationCity,
      destStationName: destinationCity + ' Terminal',
      departureTime: validationResult.resolvedLegs?.[0]?.departureTime || '06:00:00',
      arrivalTime: validationResult.resolvedLegs?.[validationResult.resolvedLegs.length - 1]?.arrivalTime || '19:40:00',
      totalDurationMinutes: validationResult.totalDurationMinutes,
      totalPrice: validationResult.totalPrice,
      totalCo2Kg: validationResult.totalCo2Kg,
      transfersCount: intermediateStops.length,
      recommendationTag: 'CUSTOM_BUILT',
      riskLevel: validationResult.riskLevel,
      amenities: 'Custom Indian routing, Multi-operator coordination, Confirmed PNR',
      availableSeats: 35,
      legs: validationResult.resolvedLegs
    };

    onSelectForBooking(customJourney);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#10224D] via-[#1677FF] to-[#10224D] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-blue-100 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Flagship Innovation &middot; India Multimodal Network
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Choose Your Own Hybrid Journey
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            Design your own route across Indian cities. Combine buses, Vande Bharat trains, and domestic flights. Our Java Spring Boot backend dynamically validates connection feasibility, layover buffer times, and calculates total INR costs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Route Builder Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
            
            {/* Journey Name & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Custom Route Name
                </label>
                <input
                  type="text"
                  value={journeyName}
                  onChange={(e) => setJourneyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F8FF] border border-blue-100 rounded-xl text-sm font-bold text-[#10224D] focus:ring-2 focus:ring-[#1677FF] outline-none"
                  placeholder="e.g. Pune to Delhi via Mumbai & Jaipur"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Travel Date & Passengers
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    aria-label="Travel Date"
                    className="flex-1 px-3 py-2 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs font-semibold text-[#10224D] outline-none focus:ring-2 focus:ring-[#1677FF]"
                  />
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    aria-label="Passenger Count"
                    className="w-24 px-2 py-2 bg-[#F4F8FF] border border-blue-100 rounded-xl text-xs font-semibold text-[#10224D] outline-none focus:ring-2 focus:ring-[#1677FF]"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Pax</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive Leg Sequence Builder */}
            <div className="space-y-4">
              
              {/* Origin Node */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#10224D] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                  1
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Starting Origin (Source)
                  </label>
                  <select
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    aria-label="Starting Origin"
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-blue-100 rounded-xl text-sm font-bold text-[#10224D] focus:ring-2 focus:ring-[#1677FF] outline-none"
                  >
                    {INDIAN_CITIES.map(c => (
                      <option key={c} value={c} disabled={c === destinationCity || intermediateStops.includes(c)}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Intermediate Legs with Mode Pickers */}
              {intermediateStops.map((stopCity, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-dashed border-blue-200 ml-4 py-2 space-y-3">
                  
                  {/* Leg Mode Selector */}
                  <div className="flex items-center gap-2 bg-[#F4F8FF] p-2 rounded-xl border border-blue-50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                      Leg {idx + 1} Mode:
                    </span>
                    <div className="flex items-center gap-1">
                      {[
                        { mode: 'BUS', label: 'Bus', icon: Bus },
                        { mode: 'TRAIN', label: 'Train', icon: Train },
                        { mode: 'FLIGHT', label: 'Flight', icon: Plane }
                      ].map(m => {
                        const Icon = m.icon;
                        const isCurrent = (legModes[idx] || 'TRAIN') === m.mode;
                        return (
                          <button
                            key={m.mode}
                            type="button"
                            onClick={() => handleLegModeChange(idx, m.mode)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              isCurrent
                                ? 'bg-[#1677FF] text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Transfer Stop Node */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                      {idx + 2}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Intermediate Transfer Hub {idx + 1}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Stop
                        </button>
                      </div>
                      <select
                        value={stopCity}
                        onChange={(e) => handleStopChange(idx, e.target.value)}
                        aria-label={`Intermediate Transfer Hub ${idx + 1}`}
                        className="w-full px-3 py-2 bg-[#F4F8FF] border border-blue-100 rounded-xl text-sm font-bold text-[#10224D] focus:ring-2 focus:ring-[#1677FF] outline-none"
                      >
                        {INDIAN_CITIES.map(c => (
                          <option key={c} value={c} disabled={c === originCity || c === destinationCity}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              ))}

              {/* Final Leg Mode Selector */}
              <div className="pl-4 border-l-2 border-dashed border-blue-200 ml-4 py-2">
                <div className="flex items-center gap-2 bg-[#F4F8FF] p-2 rounded-xl border border-blue-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                    Leg {intermediateStops.length + 1} Mode:
                  </span>
                  <div className="flex items-center gap-1">
                    {[
                      { mode: 'BUS', label: 'Bus', icon: Bus },
                      { mode: 'TRAIN', label: 'Train', icon: Train },
                      { mode: 'FLIGHT', label: 'Flight', icon: Plane }
                    ].map(m => {
                      const Icon = m.icon;
                      const isCurrent = (legModes[intermediateStops.length] || 'TRAIN') === m.mode;
                      return (
                        <button
                          key={m.mode}
                          type="button"
                          onClick={() => handleLegModeChange(intermediateStops.length, m.mode)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-[#1677FF] text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Final Destination Node */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                  {intermediateStops.length + 2}
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Final Destination
                  </label>
                  <select
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    aria-label="Final Destination"
                    className="w-full px-3 py-2 bg-[#F4F8FF] border border-blue-100 rounded-xl text-sm font-bold text-[#10224D] focus:ring-2 focus:ring-[#1677FF] outline-none"
                  >
                    {INDIAN_CITIES.map(c => (
                      <option key={c} value={c} disabled={c === originCity || intermediateStops.includes(c)}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Add Intermediate Stop Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddStop}
                disabled={intermediateStops.length >= 3}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 text-[#1677FF] bg-[#E8F2FF] hover:bg-blue-100 font-bold text-xs transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                Add Intermediate Stop
              </button>

              <button
                type="button"
                onClick={handleValidateAndCalculate}
                disabled={calculating}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10224D] text-white hover:bg-slate-800 font-bold text-xs shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
                Recalculate Route
              </button>
            </div>

          </div>

          {/* Validation Feedback & Connection Alerts */}
          {validationResult && (
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#10224D] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#1677FF]" />
                  Java Routing & Transfer Analysis
                </h3>
                {validationResult.riskLevel === 'LOW' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Optimal Connections (Low Risk)
                  </span>
                )}
                {validationResult.riskLevel === 'MODERATE' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> Moderate Layover Buffer
                  </span>
                )}
                {validationResult.riskLevel === 'HIGH' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#B91C1C] border border-rose-200">
                    <ShieldAlert className="w-3.5 h-3.5" /> Tight Connection Warning
                  </span>
                )}
              </div>

              {/* Transfer Alerts List */}
              {validationResult.transferAlerts && validationResult.transferAlerts.length > 0 && (
                <div className="space-y-2">
                  {validationResult.transferAlerts.map((alert, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#F4F8FF] border border-blue-100 text-xs text-slate-700 font-medium flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#1677FF] mt-0.5 shrink-0" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Resolved Legs Breakdown with INR Prices */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Resolved Carrier Segments (Illustrative Demo)</span>
                {validationResult.resolvedLegs?.map((leg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700">
                        {leg.legOrder}
                      </span>
                      <div>
                        <div className="font-bold text-[#10224D]">
                          {leg.sourceCity} &rarr; {leg.destCity} ({leg.mode})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {leg.carrierName} ({leg.carrierCode}) &middot; {leg.durationMinutes} mins
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-black text-sm text-[#10224D]">
                      {formatINR(leg.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Dynamic Metrics, Map & Action Buttons */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time Calculation Summary Card */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-5">
            <h3 className="text-sm font-extrabold text-[#10224D] uppercase tracking-wider">
              Route Financials & Environmental Impact
            </h3>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Total Fare in INR */}
              <div className="p-4 rounded-2xl bg-[#E8F2FF] border border-blue-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1677FF] mb-1">
                  <span className="text-sm font-bold">₹</span> Total Estimated Fare
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#10224D]">
                  {formatINR(validationResult?.totalPrice || 0)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  For {passengers} Passenger{passengers > 1 ? 's' : ''}
                </div>
              </div>

              {/* Total Travel Time */}
              <div className="p-4 rounded-2xl bg-[#F4F8FF] border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
                  <Clock className="w-4 h-4 text-slate-500" /> Total Duration
                </div>
                <div className="text-2xl font-black text-[#10224D]">
                  {formatDuration(validationResult?.totalDurationMinutes)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Includes {validationResult?.totalLayoverMinutes || 0}m transfers
                </div>
              </div>

              {/* Carbon Footprint */}
              <div className="p-4 rounded-2xl bg-[#DCFCE7] border border-green-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803D] mb-1">
                  <Leaf className="w-4 h-4" /> Carbon (CO₂)
                </div>
                <div className="text-2xl font-black text-[#10224D]">
                  {validationResult?.totalCo2Kg || 0} kg
                </div>
                <div className="text-[11px] text-[#15803D] font-bold mt-0.5">
                  🌱 {validationResult?.co2SavedPercent || 80}% lower than flight
                </div>
              </div>

              {/* Transit Legs */}
              <div className="p-4 rounded-2xl bg-[#F3E8FF] border border-purple-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] mb-1">
                  <Train className="w-4 h-4" /> Transit Legs
                </div>
                <div className="text-2xl font-black text-[#10224D]">
                  {intermediateStops.length + 1} Legs
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {intermediateStops.length} Interchange Station{intermediateStops.length > 1 ? 's' : ''}
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleProceedToBooking}
                disabled={!validationResult || !validationResult.valid}
                className="w-full py-4 bg-gradient-to-r from-[#1677FF] to-[#2F54EB] hover:from-[#4096FF] hover:to-[#1677FF] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Proceed to Book Custom Journey &rarr;
              </button>

              <button
                type="button"
                onClick={handleSaveToDatabase}
                disabled={saving || !validationResult?.valid}
                className="w-full py-3 bg-[#F4F8FF] hover:bg-blue-50 border border-blue-200 text-[#1677FF] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <BookmarkCheck className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveSuccess ? 'Saved to MySQL Database!' : 'Save Custom Journey in MySQL'}
              </button>
            </div>

          </div>

          {/* Synchronized Live Leaflet Map */}
          <RouteMap 
            selectedJourney={null} 
            customLegs={validationResult?.resolvedLegs} 
          />

        </div>

      </div>

    </div>
  );
}
