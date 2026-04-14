'use client';

import React, { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { calculateGreenCredits, calculateTotalEmissions } from '@/lib/carbon-engine';
import { Zap } from 'lucide-react';

export function ScenarioPlanner() {
  const { rows, factors, country, vcmValue, vcmCurrency } = useCarbonStore();
  const [reductionPercentages, setReductionPercentages] = useState<Record<string, number>>({});

  const currentEmissions = useMemo(() => {
    if (!factors) return 0;
    const { total } = calculateTotalEmissions(rows, factors, country);
    return total / 1000; // Convert to tons
  }, [rows, factors, country]);

  const projectedEmissions = useMemo(() => {
    if (!factors) return 0;
    const { total, scope1, scope2, scope3 } = calculateTotalEmissions(rows, factors, country);

    // Get unique materials
    const materials = [...new Set(rows.map(r => r.materialOrFuel))];
    let totalReduction = 0;

    materials.forEach(material => {
      const reduction = reductionPercentages[material] || 0;
      // Calculate portion of emissions from this material (simplified)
      const materialRows = rows.filter(r => r.materialOrFuel === material);
      const materialEmissions = materialRows.reduce((sum, row) => {
        let ef = 0;
        if (row.process === 'Direct Burning' || row.process === 'Chemical Calcination') {
          ef = factors.fuels[row.materialOrFuel] || factors.materials[row.materialOrFuel] || 0;
        } else if (row.process === 'Electrical Grinding') {
          ef = factors.grids[country] || 0;
        } else if (row.process === 'Raw Material') {
          ef = factors.materials[row.materialOrFuel] || 0;
        }
        let qty = row.quantity;
        if (row.unit === 'Tons') qty = row.quantity * 1000;
        return sum + (qty * ef);
      }, 0);

      totalReduction += materialEmissions * (reduction / 100);
    });

    return Math.max(0, total / 1000 - totalReduction / 1000);
  }, [rows, factors, country, reductionPercentages]);

  const savings = Math.max(0, currentEmissions - projectedEmissions);
  const savingsPercent = currentEmissions > 0 ? (savings / currentEmissions) * 100 : 0;
  const potentialCredits = savings;
  const potentialCreditValue = calculateGreenCredits(potentialCredits, vcmValue);

  const getUniqueMaterials = () => {
    return [...new Set(rows.map(r => r.materialOrFuel).filter(Boolean))];
  };

  const materials = getUniqueMaterials();

  if (materials.length === 0 || currentEmissions === 0) {
    return (
      <GlassCard className="w-full" delay={0.4}>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">What-If Scenario Planner</h3>
          <p className="text-xs text-white/40 mt-1">Simulate reduction strategies</p>
        </div>
        <div className="text-center py-8 text-white/40 text-sm">
          Add materials to create reduction scenarios
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full" delay={0.4}>
      <div className="mb-6">
        <div className="flex items-start gap-2">
          <Zap className="w-5 h-5 text-[#FFCC00] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white tracking-wider uppercase">What-If Scenario Planner</h3>
            <p className="text-xs text-white/40 mt-1">Adjust material usage to see emission impacts</p>
          </div>
        </div>
      </div>

      {/* Current vs Projected */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Current Emissions</div>
          <div className="text-2xl font-display font-bold text-white">{currentEmissions.toFixed(2)}</div>
          <div className="text-xs text-white/40">tons CO₂e</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center">
          <div className="text-xs text-white/60 mb-2">Projected</div>
          <div className="text-xl font-bold text-[#00FF88]">→</div>
        </div>
        <div className="p-3 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30">
          <div className="text-xs text-white/60 mb-1">New Projection</div>
          <div className="text-2xl font-display font-bold text-[#00FF88]">{projectedEmissions.toFixed(2)}</div>
          <div className="text-xs text-white/40">tons CO₂e</div>
        </div>
      </div>

      {/* Savings */}
      {savings > 0 && (
        <div className="mb-6 p-3 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60">Total Reduction</div>
              <div className="text-lg font-bold text-[#00FF88]">-{savings.toFixed(2)} tons ({savingsPercent.toFixed(1)}%)</div>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
      )}

      {/* Carbon Credits Outcome */}
      <div className="mb-6 p-4 rounded-lg bg-[#00CCFF]/10 border border-[#00CCFF]/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Potential Credits</div>
            <div className="text-xl font-bold text-[#00CCFF]">{potentialCredits.toFixed(2)} tCO2e</div>
          </div>
          <div>
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">VCM Price Used</div>
            <div className="text-xl font-bold text-white">{vcmCurrency} {vcmValue.toFixed(2)} / ton</div>
          </div>
          <div>
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Potential Credit Value</div>
            <div className="text-xl font-bold text-[#00FF88]">{vcmCurrency} {potentialCreditValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-3">
          Credits are estimated from the delta between current and scenario emissions. Final issuance depends on methodology, verification, and registry approval.
        </p>
        <p className="text-xs text-[#FFCC00]/90 mt-2">
          Advisory: Actual credits and value may differ by location, grid mix, technology performance, feedstock quality, project boundary definitions, local policy/regulation, registry methodology, and market price volatility.
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {materials.map(material => (
          <div key={material} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">{material}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reductionPercentages[material] || 0}
                  onChange={(e) =>
                    setReductionPercentages({
                      ...reductionPercentages,
                      [material]: Math.min(100, Math.max(0, Number(e.target.value))),
                    })
                  }
                  className="w-12 bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-[#00FF88]"
                />
                <span className="text-xs text-white/60 w-6">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={reductionPercentages[material] || 0}
              onChange={(e) =>
                setReductionPercentages({
                  ...reductionPercentages,
                  [material]: Number(e.target.value),
                })
              }
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00FF88]"
            />
            <div className="text-xs text-white/40">
              {reductionPercentages[material] > 0
                ? `Reduce usage by ${reductionPercentages[material]}%`
                : 'Drag to reduce usage'}
            </div>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => setReductionPercentages({})}
        className="mt-6 w-full px-4 py-2 text-sm font-medium text-white/60 hover:text-white bg-white/5 border border-white/10 rounded-lg hover:border-white/30 transition-colors"
      >
        Reset All Sliders
      </button>
    </GlassCard>
  );
}
