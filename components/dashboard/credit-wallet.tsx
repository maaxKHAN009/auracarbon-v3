'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Wallet, TrendingUp } from 'lucide-react';
import { calculateGreenCredits, calculateTotalEmissions } from '@/lib/carbon-engine';
import { useCarbonStore } from '@/lib/store';

export function CreditWallet() {
  const { rows, factors, country } = useCarbonStore();
  const [credits, setCredits] = useState(0);
  const [price, setPrice] = useState(5.00); // Base market price $5.00

  useEffect(() => {
    if (factors) {
      const { total } = calculateTotalEmissions(rows, factors, country);
      // For demo purposes, let's assume a 10% reduction is achievable
      // Green Credits = Reduction Tonnage
      const reductionTonnage = (total * 0.1) / 1000; // Convert kg to tons
      setCredits(reductionTonnage);
    }
  }, [rows, factors, country]);

  // Simulate market fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => prev + (Math.random() * 0.5 - 0.25));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = calculateGreenCredits(credits, price);

  return (
    <GlassCard className="flex flex-col justify-between h-60" delay={0.2}>
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
          {credits > 0 ? `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$0'}
        </div>
        <div className="text-lg text-white/60 mb-1">USD</div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Market Value (VCM)</div>
          <div className="text-xl font-medium flex items-center gap-2">
            ${price.toFixed(2)} <span className="text-sm text-white/40">/ ton</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Potential Credits</div>
          <div className="text-xl font-medium">
            {credits > 0 ? credits.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '0'} <span className="text-sm text-white/40">tCO₂e</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
