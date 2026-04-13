'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Wallet } from 'lucide-react';
import { calculateGreenCredits, calculateTotalEmissions } from '@/lib/carbon-engine';
import { useCarbonStore } from '@/lib/store';

// Supported currencies (matching countries)
const SUPPORTED_CURRENCIES: Record<string, string> = {
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Luxembourg': 'EUR',
  'Austria': 'EUR',
  'Poland': 'EUR',
  'Czech Republic': 'CZK',
  'Hungary': 'HUF',
  'Romania': 'RON',
  'Bulgaria': 'BGN',
  'Croatia': 'HRK',
  'Slovenia': 'EUR',
  'Slovakia': 'EUR',
  'United Kingdom': 'GBP',
  'Ireland': 'EUR',
  'United States': 'USD',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Japan': 'JPY',
  'China': 'CNY',
  'India': 'INR',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
};

export function CreditWallet() {
  const { rows, factors, country, vcmValue, vcmCurrency, setVcmValue, setVcmCurrency } = useCarbonStore();
  const [credits, setCredits] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(vcmValue.toString());

  useEffect(() => {
    if (factors) {
      const { total } = calculateTotalEmissions(rows, factors, country);
      // For demo purposes, let's assume a 10% reduction is achievable
      // Green Credits = Reduction Tonnage
      const reductionTonnage = (total * 0.1) / 1000; // Convert kg to tons
      setCredits(reductionTonnage);
    }
  }, [rows, factors, country]);

  const defaultCurrency = SUPPORTED_CURRENCIES[country] || 'USD';
  const totalValue = calculateGreenCredits(credits, vcmValue);

  const handleSaveVcm = () => {
    const newValue = Math.max(0, parseFloat(tempValue) || 0);
    setVcmValue(newValue);
    setIsEditing(false);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVcmCurrency(e.target.value);
  };

  return (
    <GlassCard className="flex flex-col justify-between min-h-[240px]" delay={0.2}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Credit Wallet</h3>
          <p className="text-xs text-white/40 mt-1">Total Asset Value</p>
        </div>
        <div className="p-2 bg-white/10 rounded-full">
          <Wallet className="w-5 h-5 text-[#00CCFF]" />
        </div>
      </div>
      
      <div className="flex items-end gap-3 mt-auto">
        <div className="text-5xl font-display font-semibold tracking-tighter text-[#00CCFF]">
          {credits > 0 ? `${vcmCurrency}${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `${vcmCurrency}0`}
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">VCM Price / Ton</label>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1 bg-black/20 border border-[#00CCFF] rounded-md py-1.5 px-2 text-white text-sm focus:outline-none"
                />
                <button
                  onClick={handleSaveVcm}
                  className="px-2 py-1.5 bg-[#00FF88]/20 text-[#00FF88] rounded-md hover:bg-[#00FF88]/30 text-xs font-medium"
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempValue(vcmValue.toString());
                  setIsEditing(true);
                }}
                className="bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm cursor-pointer hover:border-[#00CCFF] transition-colors"
              >
                {vcmCurrency} {vcmValue.toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Currency</label>
            <select
              value={vcmCurrency}
              onChange={handleCurrencyChange}
              className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00CCFF]"
            >
              {Object.values(SUPPORTED_CURRENCIES)
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Potential Credits</div>
          <div className="text-sm font-medium">
            {credits > 0 ? credits.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '0'} <span className="text-white/40">tCO₂e</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
