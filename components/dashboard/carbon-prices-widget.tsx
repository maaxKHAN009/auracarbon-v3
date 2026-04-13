'use client';

import React, { useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp } from 'lucide-react';

declare global {
  interface Window {
    carbonCreditsLoaded?: boolean;
  }
}

export function CarbonPricesWidget() {
  useEffect(() => {
    // Load the external script if not already loaded
    if (!window.carbonCreditsLoaded) {
      const script = document.createElement('script');
      script.src = 'https://carboncredits.com/live-carbon-prices/index.js.php';
      script.async = true;
      script.onload = () => {
        window.carbonCreditsLoaded = true;
      };
      document.body.appendChild(script);
      
      return () => {
        // Cleanup is not strictly necessary but can be added if needed
      };
    }
  }, []);

  return (
    <GlassCard className="w-full" delay={0.3}>
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00FF88]" />
            Live Carbon Market Prices
          </h3>
          <p className="text-xs text-white/40 mt-1">Real-time VCM pricing reference</p>
        </div>
      </div>
      
      {/* Carbon Credits Widget Container */}
      <div 
        id="carbon-prices" 
        className="carbon-prices-container min-h-[300px] flex items-center justify-center"
        style={{
          background: 'rgba(20, 20, 20, 0.4)',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}
      >
        <p className="text-white/40 text-sm">Loading live carbon prices...</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-white/40 leading-relaxed">
          Live pricing data from <span className="text-[#00FF88]">carboncredits.com</span>. 
          Use this as a reference when setting your VCM price in the Credit Wallet. Market prices fluctuate based on supply, demand, and project type.
        </p>
      </div>
    </GlassCard>
  );
}
