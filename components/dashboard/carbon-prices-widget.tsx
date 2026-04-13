'use client';

import React, { useEffect, useRef } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    carbonCreditsLoaded?: boolean;
    CarbonCredits?: any;
  }
}

export function CarbonPricesWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Wait a bit for the DOM to be ready, then load the script
    const timer = setTimeout(() => {
      if (scriptLoadedRef.current) return;
      
      try {
        // Check if script is already in the document
        const existingScript = document.querySelector(
          'script[src="https://carboncredits.com/live-carbon-prices/index.js.php"]'
        );
        
        if (existingScript) {
          scriptLoadedRef.current = true;
          console.log('Carbon prices script already loaded');
          return;
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = 'https://carboncredits.com/live-carbon-prices/index.js.php';
        script.async = true;
        script.type = 'text/javascript';
        
        script.onload = () => {
          scriptLoadedRef.current = true;
          console.log('Carbon prices widget script loaded successfully');
          // Try to trigger any initialization if available
          if (window.CarbonCredits && typeof window.CarbonCredits.init === 'function') {
            window.CarbonCredits.init();
          }
        };

        script.onerror = () => {
          console.warn('Failed to load carbon prices widget script');
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading carbon prices widget:', error);
      }
    }, 500); // Delay to ensure DOM is ready

    return () => clearTimeout(timer);
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
        ref={containerRef}
        id="carbon-prices" 
        className="carbon-prices-container min-h-[350px] w-full"
        style={{
          background: 'rgba(20, 20, 20, 0.4)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-white/60 text-sm font-medium">Loading live carbon prices...</p>
          <div className="w-8 h-8 border-2 border-[#00FF88]/30 border-t-[#00FF88] rounded-full animate-spin"></div>
        </div>
        <p className="text-xs text-white/40 text-center max-w-sm">
          If the widget doesn't load, it may be due to browser security settings or network restrictions. 
          You can still reference market prices manually from carboncredits.com
        </p>
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
