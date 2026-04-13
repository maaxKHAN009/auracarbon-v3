'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Activity, Radio } from 'lucide-react';

export function CarbonVelocity() {
  return (
    <GlassCard className="flex flex-col justify-between min-h-[240px]" delay={0.1}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Carbon Velocity</h3>
          <p className="text-xs text-white/40 mt-1">Real-time emissions monitoring</p>
        </div>
        <div className="p-2 bg-white/10 rounded-full">
          <Activity className="w-5 h-5 text-[#00FF88]" />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-4 mt-auto mb-auto">
        <div className="p-4 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 flex items-center justify-center">
          <Radio className="w-8 h-8 text-[#00FF88] animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-white/80 text-sm font-medium mb-2">Sensor Required</p>
          <p className="text-white/40 text-xs leading-relaxed max-w-xs">
            Real-time carbon velocity measurement requires an IoT sensor connected to your production facility. Contact support to set up real-time monitoring.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 text-center">
        <p className="text-xs text-white/40 uppercase tracking-wider">
          Status: <span className="text-[#FFCC00]">Awaiting IoT Connection</span>
        </p>
      </div>
    </GlassCard>
  );
}
