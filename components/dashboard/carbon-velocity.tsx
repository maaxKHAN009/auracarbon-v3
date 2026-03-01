'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCarbonStore } from '@/lib/store';
import { calculateTotalEmissions } from '@/lib/carbon-engine';

export function CarbonVelocity() {
  const { rows, factors, country } = useCarbonStore();
  const [velocity, setVelocity] = useState(0);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    if (factors) {
      const { total } = calculateTotalEmissions(rows, factors, country);
      // Simulate velocity (emissions per minute) based on total annual emissions
      // For demo, let's just show total / 1000 as a proxy for velocity
      const baseVelocity = total / 1000;
      setVelocity(baseVelocity);
      
      // Simulate trend
      setTrend(baseVelocity > 0 ? (Math.random() * 4 - 2) : 0);
    }
  }, [rows, factors, country]);

  return (
    <GlassCard className="flex flex-col justify-between h-60" delay={0.1}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Carbon Velocity</h3>
          <p className="text-xs text-white/40 mt-1">Emissions per minute</p>
        </div>
        <div className="p-2 bg-white/10 rounded-full">
          <Activity className="w-5 h-5 text-[#00FF88]" />
        </div>
      </div>
      
      <div className="flex items-end gap-3 mt-auto">
        <div className="text-5xl font-display font-semibold tracking-tighter">
          {velocity > 0 ? velocity.toFixed(2) : '0.00'}
        </div>
        <div className="text-lg text-white/60 mb-1">kg CO₂e</div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-sm">
        {velocity > 0 ? (
          <>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${trend < 0 ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-[#FF3366]/20 text-[#FF3366]'}`}>
              {trend < 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              <span className="font-medium">{Math.abs(trend).toFixed(1)}%</span>
            </div>
            <span className="text-white/40">vs last hour</span>
          </>
        ) : (
          <span className="text-white/40">Waiting for Data</span>
        )}
      </div>
    </GlassCard>
  );
}
