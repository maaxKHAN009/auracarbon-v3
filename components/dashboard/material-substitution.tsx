'use client';

import React, { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { Lightbulb, TrendingDown, ExternalLink } from 'lucide-react';

interface MaterialSwap {
  current: string;
  alternative: string;
  emissionReduction: number;
  costImpact: string;
  availability: boolean;
  sourceUrl?: string;
  sourceTitle?: string;
}

// E4C Knowledge Base Material Alternatives with source links
const E4C_MATERIAL_ALTERNATIVES: Record<string, MaterialSwap[]> = {
  'steel': [
    {
      current: 'Steel',
      alternative: 'Recycled Steel / Electric Arc Furnace (EAF)',
      emissionReduction: 58,
      costImpact: 'Similar cost, verify supplier certifications',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/e-crete/',
      sourceTitle: 'E4C: Low-Carbon Steel Solutions',
    },
  ],
  'cement': [
    {
      current: 'Portland Cement (OPC)',
      alternative: 'E-Crete (Geopolymer)',
      emissionReduction: 80,
      costImpact: '+5-10% but long-term savings',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/e-crete/',
      sourceTitle: 'E4C: E-Crete',
    },
    {
      current: 'Portland Cement (OPC)',
      alternative: 'Oxacrete',
      emissionReduction: 90,
      costImpact: '+15% but carbon-negative',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/oxacrete/',
      sourceTitle: 'E4C: Oxacrete',
    },
  ],
  'concrete': [
    {
      current: 'Conventional Concrete',
      alternative: 'ISSB (Interlocking Stabilized Soil Blocks)',
      emissionReduction: 85,
      costImpact: '-10% cost savings vs fired bricks',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/interlocking-stabilized-soil-blocks-issb/',
      sourceTitle: 'E4C: ISSB',
    },
    {
      current: 'Conventional Concrete',
      alternative: 'AECT CEB Machine (Compressed Earth Blocks)',
      emissionReduction: 80,
      costImpact: 'Equipment cost $50-100K, low material cost',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/aect-impact-2001a-compressed-earth-block-machine/',
      sourceTitle: 'E4C: AECT CEB Machine',
    },
  ],
  'coal': [
    {
      current: 'Coal',
      alternative: 'Lean Briqs (Biomass Briquettes)',
      emissionReduction: 100,
      costImpact: 'Similar cost, renewable alternative',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/lean-briqs-and-pellets/',
      sourceTitle: 'E4C: Lean Briqs',
    },
    {
      current: 'Coal',
      alternative: 'G2E Biomass Gasification',
      emissionReduction: 95,
      costImpact: 'High CAPEX ($200K+), long-term ROI',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/g2e-biomass-gasification-plant/',
      sourceTitle: 'E4C: G2E Biomass Gasification',
    },
  ],
  'aluminum': [
    {
      current: 'Primary Aluminum',
      alternative: 'Recycled Aluminum',
      emissionReduction: 92,
      costImpact: 'Long-term cost savings',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/',
      sourceTitle: 'E4C: Recycled Aluminum',
    },
  ],
  'glass': [
    {
      current: 'Virgin Glass',
      alternative: 'Recycled Glass Cullet',
      emissionReduction: 30,
      costImpact: '-5% cost, high sustainability',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/',
      sourceTitle: 'E4C: Recycled Glass Solutions',
    },
  ],
  'waste': [
    {
      current: 'Landfill Disposal',
      alternative: 'BioChar Maroc (Soil Sequestration)',
      emissionReduction: 50,
      costImpact: '+10% but regenerative agriculture benefits',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/biochar/',
      sourceTitle: 'E4C: BioChar',
    },
    {
      current: 'Landfill Disposal',
      alternative: 'Reppie Waste-to-Energy',
      emissionReduction: 70,
      costImpact: 'High CAPEX, grid export revenue',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/reppie-waste-energy/',
      sourceTitle: 'E4C: Reppie Waste-to-Energy',
    },
    {
      current: 'Plastic Waste',
      alternative: 'Styro-plastic Densifiers',
      emissionReduction: 45,
      costImpact: '$30-80K equipment, market-dependent',
      availability: true,
      sourceUrl: 'https://www.engineeringforchange.org/solutions/product/styro-plastic-densifiers/',
      sourceTitle: 'E4C: Styro-plastic Densifiers',
    },
  ],
};

export function MaterialSubstitutionSuggestions() {
  const { rows } = useCarbonStore();

  const suggestions = useMemo(() => {
    const materialSet = new Set<string>();
    rows.forEach(row => {
      if (row.materialOrFuel) {
        const material = row.materialOrFuel.toLowerCase();
        // Check for matches in E4C database
        Object.keys(E4C_MATERIAL_ALTERNATIVES).forEach(key => {
          if (material.includes(key) || key.includes(material)) {
            materialSet.add(key);
          }
        });
      }
    });

    const result: MaterialSwap[] = [];
    materialSet.forEach(material => {
      const alts = E4C_MATERIAL_ALTERNATIVES[material];
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

            {/* Status & E4C Evidence Button */}
            <div className="flex items-center gap-2 flex-wrap">
              {suggestion.availability ? (
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30">
                  <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
                  <span className="text-xs text-[#00FF88] font-medium">Available now</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <span className="text-xs text-white/60 font-medium">Coming soon</span>
                </div>
              )}
              {suggestion.sourceUrl && (
                <button
                  onClick={() => window.open(suggestion.sourceUrl, '_blank')}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#00CCFF]/10 border border-[#00CCFF]/30 hover:bg-[#00CCFF]/20 transition-colors"
                  aria-label={`View E4C evidence: ${suggestion.sourceTitle}`}
                  title={suggestion.sourceTitle}
                >
                  <ExternalLink className="w-3 h-3 text-[#00CCFF]" />
                  <span className="text-xs text-[#00CCFF] font-medium">E4C Info</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
