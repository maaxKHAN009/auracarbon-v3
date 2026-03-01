'use client';

import React, { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { Lightbulb, TrendingDown } from 'lucide-react';

interface MaterialSwap {
  current: string;
  alternative: string;
  emissionReduction: number;
  costImpact: string;
  availability: boolean;
}

// Material substitution database
const MATERIAL_ALTERNATIVES: Record<string, MaterialSwap[]> = {
  Steel: [
    {
      current: 'Steel',
      alternative: 'Recycled Steel',
      emissionReduction: 65,
      costImpact: 'Same cost, better sustainability',
      availability: true,
    },
    {
      current: 'Steel',
      alternative: 'Aluminum',
      emissionReduction: -15,
      costImpact: '+30% cost but lighter',
      availability: true,
    },
  ],
  Coal: [
    {
      current: 'Coal',
      alternative: 'Biomass',
      emissionReduction: 60,
      costImpact: '+20% but renewable',
      availability: true,
    },
    {
      current: 'Coal',
      alternative: 'Natural Gas',
      emissionReduction: 45,
      costImpact: 'Similar cost',
      availability: true,
    },
  ],
  Cement: [
    {
      current: 'Cement',
      alternative: 'Recycled Concrete',
      emissionReduction: 50,
      costImpact: '-10% cost savings',
      availability: true,
    },
    {
      current: 'Cement',
      alternative: 'Geopolymer',
      emissionReduction: 70,
      costImpact: '+5% but high performance',
      availability: true,
    },
  ],
  Aluminum: [
    {
      current: 'Aluminum',
      alternative: 'Recycled Aluminum',
      emissionReduction: 90,
      costImpact: 'Similar cost, high sustainability',
      availability: true,
    },
  ],
};

export function MaterialSubstitutionSuggestions() {
  const { rows } = useCarbonStore();

  const suggestions = useMemo(() => {
    const materialSet = new Set<string>();
    rows.forEach(row => {
      if (row.materialOrFuel) {
        // Check for exact matches or partial matches
        Object.keys(MATERIAL_ALTERNATIVES).forEach(key => {
          if (row.materialOrFuel.includes(key) || key.includes(row.materialOrFuel)) {
            materialSet.add(key);
          }
        });
      }
    });

    const result: MaterialSwap[] = [];
    materialSet.forEach(material => {
      const alts = MATERIAL_ALTERNATIVES[material];
      if (alts) {
        result.push(...alts);
      }
    });

    return result.slice(0, 5); // Show top 5
  }, [rows]);

  if (suggestions.length === 0) {
    return (
      <GlassCard className="w-full" delay={0.35}>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Material Substitutions</h3>
          <p className="text-xs text-white/40 mt-1">Low-carbon alternatives for your materials</p>
        </div>
        <div className="text-center py-8 text-white/40 text-sm">
          Add recognized materials to see substitution options
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full" delay={0.35}>
      <div className="mb-6">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-[#FFCC00] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white tracking-wider uppercase">Material Swaps</h3>
            <p className="text-xs text-white/40 mt-1">Low-carbon alternatives for your current materials</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#00FF88]/50 transition-all"
          >
            {/* Material Swap Arrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-white">{suggestion.current}</span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
              <span className="text-sm font-medium text-[#00FF88]">{suggestion.alternative}</span>
            </div>

            {/* Emission Reduction */}
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-[#00FF88]" />
              <span className="text-sm font-bold text-[#00FF88]">-{suggestion.emissionReduction}% emissions</span>
            </div>

            {/* Cost Impact */}
            <p className="text-xs text-white/60 mb-3">💰 {suggestion.costImpact}</p>

            {/* Status */}
            {suggestion.availability ? (
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 w-fit">
                <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
                <span className="text-xs text-[#00FF88] font-medium">Available now</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 border border-white/20 w-fit">
                <div className="w-2 h-2 rounded-full bg-white/40" />
                <span className="text-xs text-white/60 font-medium">Coming soon</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
