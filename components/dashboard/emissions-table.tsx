'use client';

import React, { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { calculateTotalEmissions } from '@/lib/carbon-engine';

interface EmissionRow {
  materialOrFuel: string;
  process: string;
  quantity: number;
  unit: string;
  emissions: number;
  percentage: number;
  scope: string;
}

export function EmissionsTable() {
  const { rows, factors, country } = useCarbonStore();
  
  const emissionData = useMemo(() => {
    if (!factors) return { rows: [] as EmissionRow[], total: 0 };

    const { total, scope1, scope2, scope3 } = calculateTotalEmissions(rows, factors, country);
    
    const emissionRows: EmissionRow[] = rows
      .filter(row => row.materialOrFuel && row.quantity > 0)
      .map(row => {
        let ef = 0;
        let scope = 'Scope 3';

        if (row.process === 'Direct Burning' || row.process === 'Chemical Calcination') {
          ef = factors.fuels[row.materialOrFuel] || factors.materials[row.materialOrFuel] || 0;
          scope = 'Scope 1';
        } else if (row.process === 'Electrical Grinding') {
          ef = factors.grids[country] || 0;
          scope = 'Scope 2';
        } else if (row.process === 'Raw Material') {
          ef = factors.materials[row.materialOrFuel] || 0;
          scope = 'Scope 3';
        }

        let qty = row.quantity;
        if (row.unit === 'Tons') qty = row.quantity * 1000;

        const emissions = qty * ef;
        const percentage = total > 0 ? (emissions / total) * 100 : 0;

        return {
          materialOrFuel: row.materialOrFuel,
          process: row.process,
          quantity: row.quantity,
          unit: row.unit,
          emissions,
          percentage,
          scope,
        };
      })
      .sort((a, b) => b.emissions - a.emissions);

    return { rows: emissionRows, total };
  }, [rows, factors, country]);

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'Scope 1': return 'text-[#FF3366]';
      case 'Scope 2': return 'text-[#00FF88]';
      case 'Scope 3': return 'text-[#00CCFF]';
      default: return 'text-white';
    }
  };

  return (
    <GlassCard className="w-full" delay={0.2}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Detailed Breakdown</h3>
        <p className="text-xs text-white/40 mt-1">Emissions by material and process</p>
      </div>

      {emissionData.total === 0 ? (
        <div className="text-center py-8 text-white/40 text-sm">
          Add materials to see detailed breakdown
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-2 text-white/60 font-medium">Material</th>
                <th className="text-left py-2 px-2 text-white/60 font-medium">Process</th>
                <th className="text-right py-2 px-2 text-white/60 font-medium">Qty</th>
                <th className="text-right py-2 px-2 text-white/60 font-medium">Emissions (kg)</th>
                <th className="text-right py-2 px-2 text-white/60 font-medium">%</th>
                <th className="text-center py-2 px-2 text-white/60 font-medium">Scope</th>
              </tr>
            </thead>
            <tbody>
              {emissionData.rows.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 px-2 text-white">{row.materialOrFuel}</td>
                  <td className="py-2 px-2 text-white/60 text-xs">{row.process}</td>
                  <td className="py-2 px-2 text-right text-white/60">{row.quantity} {row.unit}</td>
                  <td className="py-2 px-2 text-right text-white font-medium">
                    {(row.emissions / 1000).toFixed(2)}k
                  </td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00FF88] rounded-full transition-all"
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                      <span className="text-white/60 w-8 text-right">{row.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`text-xs font-medium ${getScopeColor(row.scope)}`}>
                      {row.scope}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
