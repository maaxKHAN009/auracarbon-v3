'use client';

import React, { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { calculateTotalEmissions } from '@/lib/carbon-engine';
import { TrendingDown, TrendingUp } from 'lucide-react';

const EU_BENCHMARK = 0.5; // tCO2e per ton of product
const INDUSTRY_AVERAGE = 0.65;

export function CarbonIntensityGauge() {
  const { rows, factors, country, totalProductOutput } = useCarbonStore();

  const intensityData = useMemo(() => {
    if (!factors || rows.length === 0 || totalProductOutput === 0) {
      return { intensity: 0, status: 'idle', recommendation: '' };
    }

    const { total } = calculateTotalEmissions(rows, factors, country);
    const totalTons = total / 1000; // Convert kg to tons
    const intensity = totalTons / totalProductOutput;

    let status: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    let recommendation = '';

    if (intensity < EU_BENCHMARK * 0.8) {
      status = 'excellent';
      recommendation = 'Excellent! Your facility exceeds EU standards. Consider certifying as carbon-neutral.';
    } else if (intensity < EU_BENCHMARK) {
      status = 'good';
      recommendation = 'Good! You meet EU CBAM standards. Continue optimizing.';
    } else if (intensity < INDUSTRY_AVERAGE) {
      status = 'warning';
      recommendation = 'Moderate impact. Consider interventions to reach EU benchmark.';
    } else {
      status = 'critical';
      recommendation = 'High emissions. Immediate action needed to comply with regulations.';
    }

    return { intensity, status, recommendation };
  }, [rows, factors, country, totalProductOutput]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return { bg: 'bg-[#00FF88]/10', border: 'border-[#00FF88]', text: 'text-[#00FF88]', label: '✓ Excellent' };
      case 'good':
        return { bg: 'bg-[#FFCC00]/10', border: 'border-[#FFCC00]', text: 'text-[#FFCC00]', label: '↗ Good' };
      case 'warning':
        return { bg: 'bg-[#FF6600]/10', border: 'border-[#FF6600]', text: 'text-[#FF6600]', label: '⚠ Warning' };
      case 'critical':
        return { bg: 'bg-[#FF3366]/10', border: 'border-[#FF3366]', text: 'text-[#FF3366]', label: '✕ Critical' };
      default:
        return { bg: 'bg-white/10', border: 'border-white/20', text: 'text-white/60', label: 'Idle' };
    }
  };

  const colors = getStatusColor(intensityData.status);
  const reduction = Math.max(0, ((INDUSTRY_AVERAGE - intensityData.intensity) / INDUSTRY_AVERAGE) * 100);

  return (
    <GlassCard className="w-full h-[620px]" delay={0.3}>
      <div className="mb-6">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Carbon Intensity Analysis</h3>
          <p className="text-xs text-white/40 mt-1">Emissions per unit of product output</p>
        </div>
      </div>

      {intensityData.status === 'idle' ? (
        <div className="text-center py-8 text-white/40 text-sm">
          Enter materials and products to see intensity analysis
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Gauge */}
          <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-3xl font-display font-bold text-white">
                  {intensityData.intensity.toFixed(2)}
                </div>
                <div className="text-xs text-white/60 mt-1">tCO₂e per ton product</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${colors.text} bg-white/5`}>
                {colors.label}
              </div>
            </div>

            {/* Comparison Bars */}
            <div className="space-y-3">
              {/* Your Intensity */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-white">Your Facility</span>
                  <span className="text-xs text-white/60">{intensityData.intensity.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00FF88] to-[#00CCFF] rounded-full"
                    style={{ width: `${Math.min(100, (intensityData.intensity / INDUSTRY_AVERAGE) * 100)}%` }}
                  />
                </div>
              </div>

              {/* EU Benchmark */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-white">EU Benchmark</span>
                  <span className="text-xs text-white/60">{EU_BENCHMARK.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00FF88] rounded-full"
                    style={{ width: `${(EU_BENCHMARK / INDUSTRY_AVERAGE) * 100}%` }}
                  />
                </div>
              </div>

              {/* Industry Average */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-white">Industry Average</span>
                  <span className="text-xs text-white/60">{INDUSTRY_AVERAGE.toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFCC00] rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          {intensityData.intensity <= INDUSTRY_AVERAGE && (
            <div className="flex gap-2 p-3 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30">
              <TrendingDown className="w-4 h-4 text-[#00FF88] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-[#00FF88]">
                  +{reduction.toFixed(1)}% better than industry average
                </div>
                <p className="text-xs text-white/60 mt-1">
                  You're outperforming the industry. Great job on sustainability!
                </p>
              </div>
            </div>
          )}

          {intensityData.intensity > INDUSTRY_AVERAGE && (
            <div className="flex gap-2 p-3 rounded-lg bg-[#FF6600]/10 border border-[#FF6600]/30">
              <TrendingUp className="w-4 h-4 text-[#FF6600] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-[#FF6600]">
                  {((intensityData.intensity / INDUSTRY_AVERAGE - 1) * 100).toFixed(1)}% above industry average
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {intensityData.recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Recommendation Box */}
          {intensityData.status !== 'excellent' && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/70">💡 {intensityData.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
