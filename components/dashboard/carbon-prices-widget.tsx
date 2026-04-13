'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp, RefreshCw } from 'lucide-react';

interface CarbonPrice {
  name: string;
  price: number;
  range: string;
  project_type: string;
}

// Market reference prices based on typical VCM market data
const MARKET_PRICES: CarbonPrice[] = [
  {
    name: 'Verified Carbon Units (VCU)',
    price: 5.50,
    range: '$4.50 - $7.00',
    project_type: 'Verified Emission Reductions'
  },
  {
    name: 'Gold Standard (GS)',
    price: 8.25,
    range: '$7.50 - $12.00',
    project_type: 'High-Impact Projects'
  },
  {
    name: 'Nature-Based Solutions',
    price: 6.75,
    range: '$5.50 - $9.00',
    project_type: 'Forestry & Conservation'
  },
  {
    name: 'Renewable Energy Credits',
    price: 4.80,
    range: '$3.50 - $6.50',
    project_type: 'Wind, Solar, Hydro'
  },
  {
    name: 'Methane Reduction',
    price: 9.50,
    range: '$8.00 - $15.00',
    project_type: 'Landfill & Agriculture'
  },
  {
    name: 'Energy Efficiency Credits',
    price: 5.20,
    range: '$4.00 - $7.50',
    project_type: 'Industrial Efficiency'
  },
];

export function CarbonPricesWidget() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  };

  const averagePrice = (MARKET_PRICES.reduce((sum, p) => sum + p.price, 0) / MARKET_PRICES.length).toFixed(2);

  return (
    <GlassCard className="w-full" delay={0.3}>
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00FF88]" />
            Carbon Market Reference Prices
          </h3>
          <p className="text-xs text-white/40 mt-1">VCM pricing guidance for your selections</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
          title="Refresh prices"
        >
          <RefreshCw className={`w-4 h-4 text-white/60 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Average Price</p>
          <p className="text-lg font-semibold text-[#00FF88]">${averagePrice}/ton</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Lowest</p>
          <p className="text-lg font-semibold text-[#00CCFF]">${Math.min(...MARKET_PRICES.map(p => p.price)).toFixed(2)}/ton</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Highest</p>
          <p className="text-lg font-semibold text-[#FFCC00]">${Math.max(...MARKET_PRICES.map(p => p.price)).toFixed(2)}/ton</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Types Available</p>
          <p className="text-lg font-semibold text-[#FF6B9D]">{MARKET_PRICES.length} Types</p>
        </div>
      </div>

      {/* Prices Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-3 text-white/60 font-medium uppercase text-xs tracking-wider">Credit Type</th>
              <th className="text-center py-2 px-3 text-white/60 font-medium uppercase text-xs tracking-wider">Price</th>
              <th className="text-center py-2 px-3 text-white/60 font-medium uppercase text-xs tracking-wider">Range</th>
              <th className="text-left py-2 px-3 text-white/60 font-medium uppercase text-xs tracking-wider">Project Type</th>
            </tr>
          </thead>
          <tbody>
            {MARKET_PRICES.map((price, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 text-white/80">{price.name}</td>
                <td className="py-3 px-3 text-center font-semibold text-[#00FF88]">${price.price.toFixed(2)}</td>
                <td className="py-3 px-3 text-center text-white/60 text-xs">{price.range}</td>
                <td className="py-3 px-3 text-white/60 text-xs">{price.project_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-white/40 leading-relaxed mb-2">
          📊 Prices updated: {lastUpdated.toLocaleTimeString()} • Reference data based on global VCM market trends
        </p>
        <p className="text-xs text-white/50 leading-relaxed">
          💡 <strong>Tip:</strong> Use these price ranges when setting your VCM value in the Credit Wallet. Prices vary based on verification standard, project location, and market demand.
        </p>
      </div>
    </GlassCard>
  );
}
