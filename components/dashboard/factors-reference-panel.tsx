'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, Globe, Table } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';

type TabKey = 'values' | 'sources';

export function FactorsReferencePanel() {
  const { factors, country } = useCarbonStore();
  const [tab, setTab] = useState<TabKey>('values');

  const currentGrid = useMemo(() => {
    if (!factors) return null;
    const value = factors.grids[country];
    if (typeof value !== 'number') return null;
    return { country, value };
  }, [factors, country]);

  if (!factors) return null;

  const sourceRefs = factors.standardFactors?.sourceReferences || [];
  const gridRows = Object.entries(factors.grids).map(([name, value]) => ({ name, value }));

  return (
    <GlassCard className="w-full" delay={0.2}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-medium text-white tracking-wider uppercase">Emission Factors & Sources</h3>
          <p className="text-xs text-white/40 mt-1">Country-specific grid values and standards references</p>
        </div>
        {currentGrid && (
          <div className="px-3 py-1 rounded-full bg-[#00CCFF]/10 border border-[#00CCFF]/30 text-xs text-[#00CCFF]">
            Active grid: {currentGrid.country} ({currentGrid.value.toFixed(5)} kg CO2e/kWh)
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setTab('values')}
          className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
            tab === 'values' ? 'bg-[#00FF88]/20 text-[#00FF88]' : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <Table className="w-3.5 h-3.5 inline mr-1" />
          Country Values
        </button>
        <button
          onClick={() => setTab('sources')}
          className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
            tab === 'sources' ? 'bg-[#00CCFF]/20 text-[#00CCFF]' : 'bg-white/5 text-white/60 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 inline mr-1" />
          Sources
        </button>
      </div>

      {tab === 'values' ? (
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-3 py-2 text-white/60 uppercase tracking-wider">Country / Region</th>
                <th className="text-right px-3 py-2 text-white/60 uppercase tracking-wider">Grid Factor (kg CO2e/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {gridRows.map((row) => {
                const active = row.name === country;
                return (
                  <tr key={row.name} className={`${active ? 'bg-[#00CCFF]/10' : 'bg-transparent'} border-t border-white/5`}>
                    <td className="px-3 py-2 text-white/85">
                      {active && <Globe className="w-3 h-3 inline mr-1 text-[#00CCFF]" />}
                      {row.name}
                    </td>
                    <td className="px-3 py-2 text-right text-white/70">{row.value.toFixed(5)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[#00CCFF]/10 border border-[#00CCFF]/30 text-xs text-white/80">
            <div className="font-medium text-[#00CCFF] mb-1">Calculation Formula (Standards-Aligned)</div>
            <div>CO2e = Activity Data × Emission Factor × GWP</div>
            <div className="text-white/60 mt-1">The app first converts the entered activity data into each factor's basis unit (for example, Tons → kg, m3 → liter, MWh → kWh), then multiplies using the formula above.</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
            Factors are compiled from standardized references (EPA 2024, DEFRA 2024, eGRID 2024, IEA 2024, IPCC AR6, and industry bodies). Use country/region-aligned values for reporting consistency.
          </div>
          <div className="space-y-2">
            {sourceRefs.length > 0 ? (
              sourceRefs.map((src) => (
                <div key={src} className="px-3 py-2 rounded-md bg-black/20 border border-white/5 text-xs text-white/70">
                  {src}
                </div>
              ))
            ) : (
              <div className="text-xs text-white/50">No source references available.</div>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
