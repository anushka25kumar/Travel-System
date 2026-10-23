import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { BarChart3, TrendingUp, Leaf, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../utils/currency';

const COMPARISON_DATA = [
  {
    mode: 'Direct Flight',
    price: 5980,
    durationHours: 4.2, // Pune PNQ to Delhi DEL: flight 2h 15m + security/check-in/transit 2h
    co2Kg: 142.5,
    fill: '#1677FF',
    description: 'Fastest in the air (IndiGo / Air India), but airport security, baggage check & transit add 2+ hours.'
  },
  {
    mode: 'Vande Bharat / Rajdhani',
    price: 2850,
    durationHours: 11.5, // Indian Railways Semi-High Speed
    co2Kg: 28.4,
    fill: '#7C3AED',
    description: 'City center convenience, power outlets, hot pantry meals, spacious legroom, zero security wait.'
  },
  {
    mode: 'Intercity Sleeper Bus',
    price: 1850,
    durationHours: 22.0,
    co2Kg: 19.8,
    fill: '#F59E0B',
    description: 'Lowest price point (IntrCity / Shivneri), comfortable AC sleeper berths, prone to expressway traffic.'
  },
  {
    mode: 'TravelSmart Hybrid',
    price: 4650,
    durationHours: 5.5,
    co2Kg: 42.0,
    fill: '#16A34A',
    description: 'Optimal balance: Shivneri bus to Mumbai + Akasa flight to Jaipur + Shatabdi to Delhi. Saves ₹1,330 vs flying!'
  }
];

const RADAR_DATA = [
  { metric: 'Affordability', Flight: 40, Train: 70, Bus: 98, Hybrid: 88 },
  { metric: 'Door-to-Door Speed', Flight: 85, Train: 92, Bus: 60, Hybrid: 82 },
  { metric: 'Eco-Friendliness', Flight: 30, Train: 85, Bus: 92, Hybrid: 89 },
  { metric: 'Comfort & Space', Flight: 65, Train: 90, Bus: 65, Hybrid: 82 },
  { metric: 'Convenience', Flight: 70, Train: 95, Bus: 75, Hybrid: 86 },
];

export default function ModeComparisonCharts() {
  const [activeMetric, setActiveMetric] = useState('all');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F2FF] text-[#1677FF] text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Empirical Travel Analytics &middot; Illustrative Demo Data
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#10224D] tracking-tight">
              Multimodal Transportation Mode Comparison
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Real-world comparison of cost, door-to-door transit time, and carbon footprint for the Pune &rarr; New Delhi corridor.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#F4F8FF] p-1.5 rounded-2xl border border-blue-100">
            {['all', 'price', 'duration', 'co2'].map(m => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                  activeMetric === m
                    ? 'bg-[#1677FF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#10224D]'
                }`}
              >
                {m === 'all' ? 'All Metrics' : m === 'price' ? 'Fare (₹)' : m === 'duration' ? 'Duration (h)' : 'Carbon (kg)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bar Chart Panel */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-card border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-[#10224D] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1677FF]" />
              Comparative Bar Analysis
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Pune &rarr; New Delhi Corridor</span>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPARISON_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mode" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name.includes('Cost')) return [formatINR(value), name];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #E2E8F0',
                    fontFamily: 'Inter',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                {(activeMetric === 'all' || activeMetric === 'price') && (
                  <Bar dataKey="price" name="Cost (₹ INR)" fill="#1677FF" radius={[8, 8, 0, 0]} />
                )}
                {(activeMetric === 'all' || activeMetric === 'duration') && (
                  <Bar dataKey="durationHours" name="Door-to-Door Duration (Hours)" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                )}
                {(activeMetric === 'all' || activeMetric === 'co2') && (
                  <Bar dataKey="co2Kg" name="Carbon Footprint (kg CO₂)" fill="#16A34A" radius={[8, 8, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart Panel */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#10224D] mb-1">
              Multi-Attribute Radar Performance
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Normalized score (0 - 100) across comfort, cost, time & sustainability.
            </p>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={RADAR_DATA}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Hybrid Journey" dataKey="Hybrid" stroke="#16A34A" fill="#16A34A" fillOpacity={0.35} />
                  <Radar name="Train" dataKey="Train" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} />
                  <Radar name="Flight" dataKey="Flight" stroke="#1677FF" fill="#1677FF" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Insight Callout */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Smart Multimodal Takeaway
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choosing a <strong>TravelSmart Hybrid Route</strong> cuts carbon emissions by <strong>70%</strong> compared to flying, while costing <strong>₹1,330 less</strong> with optimal door-to-door transit time!
            </p>
          </div>

        </div>

      </div>

      {/* Corridor Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COMPARISON_DATA.map(item => (
          <div key={item.mode} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-[#10224D]">{item.mode}</span>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
            </div>
            <div className="space-y-1 mb-3">
              <div className="text-2xl font-black text-[#10224D]">{formatINR(item.price)}</div>
              <div className="text-xs text-slate-500 font-semibold">{item.durationHours} hours door-to-door</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Leaf className="w-3 h-3" /> {item.co2Kg} kg CO₂
              </div>
            </div>
            <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
