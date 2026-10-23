import React from 'react';
import { Plane, Train, Bus, Shuffle, Clock, Leaf, MapPin, ChevronRight, Zap, DollarSign, Award, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../utils/currency';

export default function JourneyCard({
  journey,
  currency,
  onSelect,
  onViewMap,
  isSelectedForMap
}) {
  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return hours > 0 ? `${hours}h ${m}m` : `${m}m`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  const getModeBadge = (type) => {
    switch (type) {
      case 'FLIGHT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#E8F2FF] text-[#1677FF] border border-blue-200">
            <Plane className="w-3.5 h-3.5" /> Domestic Flight
          </span>
        );
      case 'TRAIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F3E8FF] text-[#7C3AED] border border-purple-200">
            <Train className="w-3.5 h-3.5" /> Vande Bharat / Rail
          </span>
        );
      case 'BUS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200">
            <Bus className="w-3.5 h-3.5" /> Express AC Coach
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 text-[#1677FF] border border-blue-200">
            <Shuffle className="w-3.5 h-3.5 text-[#1677FF]" /> Hybrid Multimodal
          </span>
        );
    }
  };

  const getDataSourceBadge = (dataSource) => {
    switch (dataSource) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            LIVE
          </span>
        );
      case 'CACHED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            CACHED
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            UNAVAILABLE
          </span>
        );
      case 'DEMO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            DEMO
          </span>
        );
    }
  };

  const getRecommendationBadge = (tag) => {
    switch (tag) {
      case 'FASTEST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#FEF3C7] text-[#D97706] border border-amber-200 uppercase tracking-wide">
            <Zap className="w-3 h-3 fill-amber-500" /> Fastest Route
          </span>
        );
      case 'CHEAPEST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#DCFCE7] text-[#15803D] border border-green-200 uppercase tracking-wide">
            <DollarSign className="w-3 h-3" /> Cheapest Option
          </span>
        );
      case 'ECO_FRIENDLY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#D1FAE5] text-[#047857] border border-emerald-200 uppercase tracking-wide">
            <Leaf className="w-3 h-3 fill-emerald-500" /> Eco Champion
          </span>
        );
      case 'BEST_VALUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#E8F2FF] text-[#1677FF] border border-blue-200 uppercase tracking-wide">
            <Award className="w-3 h-3 fill-blue-500" /> Best Value
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-card hover:shadow-card-hover ${
      isSelectedForMap ? 'border-[#1677FF] ring-2 ring-blue-500/20' : 'border-slate-100 hover:border-blue-100'
    }`}>
      
      {/* Top Header: Mode, Recommendation & Data Source Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {getModeBadge(journey.journeyType)}
          {getRecommendationBadge(journey.recommendationTag)}
          {getDataSourceBadge(journey.dataSource)}
        </div>
        <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
          <div>
            Operator: <span className="text-[#10224D] font-bold">{journey.primaryCarrier}</span>
            <span className="text-[10px] text-slate-400 ml-1">({journey.carrierCode})</span>
          </div>
          {journey.providerName && (
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 hidden sm:inline-block">
              {journey.providerName}
            </span>
          )}
        </div>
      </div>

      {/* Main Timeline & Route Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Departure & Arrival Visual Timeline */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Departure Node */}
            <div className="text-left min-w-[90px]">
              <div className="text-2xl font-black text-[#10224D] tracking-tight">
                {formatTime(journey.departureTime)}
              </div>
              <div className="text-xs font-bold text-slate-600">{journey.sourceCity}</div>
              <div className="text-[11px] text-slate-400 truncate max-w-[130px]" title={journey.sourceStationName}>
                {journey.sourceStationName}
              </div>
            </div>

            {/* Travel Segment Timeline Visual */}
            <div className="flex-1 px-2 flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDuration(journey.totalDurationMinutes)}</span>
                {journey.transfersCount > 0 ? (
                  <span className="text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full text-[10px] border border-amber-200">
                    {journey.transfersCount} Transfer
                  </span>
                ) : (
                  <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                    Direct
                  </span>
                )}
              </div>

              {/* Progress Line */}
              <div className="w-full relative flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1677FF] ring-4 ring-blue-100" />
                
                {/* Connecting Line with Segments */}
                <div className="flex-1 h-0.5 mx-1 flex items-center justify-center bg-gradient-to-r from-[#1677FF] via-[#7C3AED] to-[#1677FF] relative">
                  {journey.legs && journey.legs.length > 1 && (
                    <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                      {journey.legs.map((leg, idx) => (
                        <React.Fragment key={idx}>
                          {leg.mode === 'FLIGHT' && <Plane className="w-3 h-3 text-[#1677FF]" />}
                          {leg.mode === 'TRAIN' && <Train className="w-3 h-3 text-[#7C3AED]" />}
                          {leg.mode === 'BUS' && <Bus className="w-3 h-3 text-[#F59E0B]" />}
                          {idx < journey.legs.length - 1 && <ChevronRight className="w-2.5 h-2.5 text-slate-300" />}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-2.5 h-2.5 rounded-full bg-[#10224D] ring-4 ring-slate-100" />
              </div>

              {/* Transfer Hub Note */}
              {journey.legs && journey.legs.length > 1 && (
                <div className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                  <span>Transfer via <strong>{journey.legs[0].destCity}</strong> ({journey.legs[0].layoverMinutesToNext}m layover)</span>
                </div>
              )}
            </div>

            {/* Arrival Node */}
            <div className="text-right min-w-[90px]">
              <div className="text-2xl font-black text-[#10224D] tracking-tight">
                {formatTime(journey.arrivalTime)}
              </div>
              <div className="text-xs font-bold text-slate-600">{journey.destCity}</div>
              <div className="text-[11px] text-slate-400 truncate max-w-[130px]" title={journey.destStationName}>
                {journey.destStationName}
              </div>
            </div>

          </div>

          {/* Environmental CO2 & Amenities Tag */}
          <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>{journey.totalCo2Kg} kg CO₂</span>
              <span className="text-[10px] text-emerald-600 font-medium">(Low Emission)</span>
            </div>

            <div className="text-slate-400 text-xs truncate max-w-sm hidden sm:block">
              {journey.amenities}
            </div>
          </div>
        </div>

        {/* Pricing in INR & Booking CTA */}
        <div className="lg:col-span-4 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between h-full">
          <div className="text-left lg:text-right mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Fare</span>
            <div className="flex items-baseline lg:justify-end gap-1">
              <span className="text-3xl font-black text-[#10224D] tracking-tight">
                {formatPrice(journey.totalPrice, currency)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ person</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center lg:justify-end gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 inline" /> {journey.cancellationPolicy || "Free cancellation up to 24h"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewMap(journey)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                isSelectedForMap
                  ? 'bg-blue-50 text-[#1677FF] border-[#1677FF]'
                  : 'bg-[#F4F8FF] text-slate-700 border-blue-100 hover:bg-blue-50 hover:text-[#1677FF]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {isSelectedForMap ? 'Viewing Map' : 'Route Map'}
            </button>

            <button
              type="button"
              onClick={() => onSelect(journey)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#1677FF] hover:bg-[#4096FF] text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1"
            >
              Select & Book
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
