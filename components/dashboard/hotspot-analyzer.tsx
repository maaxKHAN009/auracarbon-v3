'use client';

import React, { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { calculateTotalEmissions } from '@/lib/carbon-engine';
import { TrendingUp, AlertCircle, Zap } from 'lucide-react';

export function HotspotAnalyzer() {
  const { rows, factors, country } = useCarbonStore();

  const hotspots = useMemo(() => {
    if (!factors || rows.length === 0) {
      return [
        {
          name: 'Scope 1 (Direct Combustion)',
          value: 0,
          percentage: 0,
          color: '#FF3366',
          icon: '🔥',
          description: 'Direct burning of fuels',
        },
        {
          name: 'Scope 2 (Grid Electricity)',
          value: 0,
          percentage: 0,
          color: '#00FF88',
          icon: '⚡',
          description: 'Purchased electricity',
        },
        {
          name: 'Scope 3 (Supply Chain)',
          value: 0,
          percentage: 0,
          color: '#00CCFF',
          icon: '📦',
          description: 'Raw materials & upstream',
        },
      ];
    }

    const { total, scope1, scope2, scope3 } = calculateTotalEmissions(rows, factors, country);

    const scopeData = [
      {
        name: 'Scope 1 (Direct Combustion)',
        value: scope1,
        percentage: total > 0 ? (scope1 / total) * 100 : 0,
        color: '#FF3366',
        icon: '🔥',
        description: 'Direct burning of fuels',
      },
      {
        name: 'Scope 2 (Grid Electricity)',
        value: scope2,
        percentage: total > 0 ? (scope2 / total) * 100 : 0,
        color: '#00FF88',
        icon: '⚡',
        description: 'Purchased electricity',
      },
      {
        name: 'Scope 3 (Supply Chain)',
        value: scope3,
        percentage: total > 0 ? (scope3 / total) * 100 : 0,
        color: '#00CCFF',
        icon: '📦',
        description: 'Raw materials & upstream',
      },
    ];

    return scopeData;
  }, [rows, factors, country]);

  const getRecommendation = (scopeName: string): string => {
    if (scopeName.includes('Scope 1')) {
      return 'Switch to renewable fuels or biomass to reduce direct emissions by up to 60%';
    } else if (scopeName.includes('Scope 2')) {
      return 'Install solar panels or offshore wind to offset grid electricity dependency';
    } else {
      return 'Optimize supply chain by sourcing materials locally or with lower carbon footprint';
    }
  };

  return (
    <GlassCard className="w-full h-[620px]" delay={0.25}>
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Emission Hotspots</h3>
        <p className="text-xs text-white/40 mt-1">Scope-wise hotspot view (always visible)</p>
      </div>

      {rows.length === 0 && (
        <div className="mb-4 text-xs text-white/40">Add materials to populate non-zero hotspot values.</div>
      )}

      <div className="space-y-4">
        {hotspots.map((hotspot, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            {/* Header with Icon and Name */}
            <div className="flex items-start gap-3 mb-3">
              <div className="text-2xl">{hotspot.icon}</div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">{hotspot.name}</h4>
                <p className="text-xs text-white/40">{hotspot.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold" style={{ color: hotspot.color }}>
                  {(hotspot.value / 1000).toFixed(2)}k kg
                </div>
                <div className="text-xs text-white/60">{hotspot.percentage.toFixed(1)}% of total</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${hotspot.percentage}%`, backgroundColor: hotspot.color }}
                />
              </div>
            </div>

            {/* Recommendation */}
            <div className="flex gap-2 items-start p-3 rounded-lg bg-white/5 border border-white/5">
              <Zap className="w-4 h-4 text-[#FFCC00] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/70">{getRecommendation(hotspot.name)}</p>
            </div>

            {/* Impact Indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              {hotspot.value === 0 && (
                <span className="text-white/50">No measurable contribution in current input set</span>
              )}
              {hotspot.value > 0 && idx === 0 && (
                <>
                  <AlertCircle className="w-4 h-4 text-[#FF3366]" />
                  <span className="text-[#FF3366] font-medium">Highest impact - Focus here first</span>
                </>
              )}
              {hotspot.value > 0 && idx === 1 && (
                <>
                  <TrendingUp className="w-4 h-4 text-[#FFCC00]" />
                  <span className="text-white/60">Secondary target - Address after priority</span>
                </>
              )}
              {hotspot.value > 0 && idx > 1 && (
                <span className="text-white/60">Lower priority - Optimize after main sources</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
