import React from 'react';
import { Zap, DollarSign, Leaf, Award, SlidersHorizontal } from 'lucide-react';

export default function QuickFilterBar({
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  resultsCount,
  onReset
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      
      {/* Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-[#10224D] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All Options ({resultsCount})
        </button>

        <button
          onClick={() => setActiveFilter('FASTEST')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'FASTEST'
              ? 'bg-[#F59E0B] text-white shadow-xs shadow-amber-500/20'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Fastest
        </button>

        <button
          onClick={() => setActiveFilter('CHEAPEST')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'CHEAPEST'
              ? 'bg-[#16A34A] text-white shadow-xs shadow-green-500/20'
              : 'bg-white text-green-700 hover:bg-green-50 border border-green-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Cheapest
        </button>

        <button
          onClick={() => setActiveFilter('ECO_FRIENDLY')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'ECO_FRIENDLY'
              ? 'bg-[#059669] text-white shadow-xs shadow-emerald-500/20'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          Eco-Friendly
        </button>

        <button
          onClick={() => setActiveFilter('BEST_VALUE')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'BEST_VALUE'
              ? 'bg-[#1677FF] text-white shadow-xs shadow-blue-500/20'
              : 'bg-white text-[#1677FF] hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Best Value
        </button>
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort by"
          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#10224D] focus:ring-2 focus:ring-[#1677FF] outline-none cursor-pointer"
        >
          <option value="RECOMMENDED">Recommended</option>
          <option value="CHEAPEST">Price: Low to High</option>
          <option value="FASTEST">Duration: Short to Long</option>
          <option value="ECO">Lowest Carbon (CO₂)</option>
        </select>
      </div>

    </div>
  );
}
