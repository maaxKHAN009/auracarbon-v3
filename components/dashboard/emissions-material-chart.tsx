'use client';

import React, { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCarbonStore, RecipeRow, FactorsData } from '@/lib/store';
import { calculateEmissions, convertUnit } from '@/lib/carbon-engine';

const PIE_COLORS = [
  '#00CCFF',
  '#00FF88',
  '#FF3366',
  '#FFCC00',
  '#7BDFF2',
  '#F1C0E8',
  '#B9FBC0',
  '#A0C4FF',
  '#FFD6A5',
  '#CAFFBF',
];

type UnitCategory = 'mass' | 'volume' | 'energy';

interface MaterialSlice {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface FactorInfo {
  factor: number;
  factorUnit: string;
}

const MASS_UNITS = new Set(['Tons', 'kg']);
const VOLUME_UNITS = new Set(['m3', 'liter']);
const ENERGY_UNITS = new Set(['kWh']);

function getUnitCategory(unit: string): UnitCategory | null {
  if (MASS_UNITS.has(unit)) return 'mass';
  if (VOLUME_UNITS.has(unit)) return 'volume';
  if (ENERGY_UNITS.has(unit)) return 'energy';
  return null;
}

function defaultFuelUnit(name: string): string {
  if (name === 'CNG') return 'm3';

  const energyFuels = new Set([
    'Natural Gas',
    'Bituminous Coal',
    'Sub-bituminous Coal',
    'Lignite',
    'Anthracite Coal',
    'Coal (Average Power)',
    'Petroleum Coke (Solid)',
    'Municipal Solid Waste',
    'Tires',
    'Plastics',
    'Wood & Wood Residuals',
  ]);

  return energyFuels.has(name) ? 'kWh' : 'liter';
}

function resolveFactorInfo(row: RecipeRow, factors: FactorsData, country: string): FactorInfo | null {
  if (row.process === 'Electrical Grinding') {
    const factor = factors.grids[country];
    if (typeof factor !== 'number') return null;
    return {
      factor,
      factorUnit: factors.factorUnits?.grids?.[country] || 'kWh',
    };
  }

  if (row.process === 'Raw Material') {
    const factor = factors.materials[row.materialOrFuel];
    if (typeof factor !== 'number') return null;
    return {
      factor,
      factorUnit: factors.factorUnits?.materials?.[row.materialOrFuel] || 'kg',
    };
  }

  if (row.process === 'Direct Burning' || row.process === 'Chemical Calcination') {
    if (Object.prototype.hasOwnProperty.call(factors.fuels, row.materialOrFuel)) {
      return {
        factor: factors.fuels[row.materialOrFuel],
        factorUnit: factors.factorUnits?.fuels?.[row.materialOrFuel] || defaultFuelUnit(row.materialOrFuel),
      };
    }

    const factor = factors.materials[row.materialOrFuel];
    if (typeof factor !== 'number') return null;
    return {
      factor,
      factorUnit: factors.factorUnits?.materials?.[row.materialOrFuel] || 'kg',
    };
  }

  return null;
}

function normalizeQuantity(quantity: number, fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return quantity;

  const fromCategory = getUnitCategory(fromUnit);
  const toCategory = getUnitCategory(toUnit);

  if (!fromCategory || !toCategory || fromCategory !== toCategory) {
    return null;
  }

  return convertUnit(quantity, fromUnit, toUnit, fromCategory);
}

export function EmissionsPieChart() {
  const { rows, factors, country } = useCarbonStore();

  const slices = useMemo<MaterialSlice[]>(() => {
    if (!factors || rows.length === 0) return [];

    const totals = new Map<string, number>();

    rows.forEach((row) => {
      if (!row.materialOrFuel || row.quantity <= 0) return;

      const factorInfo = resolveFactorInfo(row, factors, country);
      if (!factorInfo) return;

      const normalizedQuantity = normalizeQuantity(row.quantity, row.unit, factorInfo.factorUnit);
      if (normalizedQuantity === null) return;

      const rowEmissions = calculateEmissions(normalizedQuantity, factorInfo.factor, 1);
      if (rowEmissions <= 0) return;

      const name = row.materialOrFuel.trim();
      const current = totals.get(name) || 0;
      totals.set(name, current + rowEmissions);
    });

    const raw = Array.from(totals.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    const total = raw.reduce((sum, item) => sum + item.value, 0);

    return raw.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [rows, factors, country]);

  const totalEmissions = useMemo(() => slices.reduce((sum, item) => sum + item.value, 0), [slices]);

  if (!factors) {
    return null;
  }

  return (
    <GlassCard className="h-full flex flex-col" delay={0.3}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Material Contributions</h3>
        <p className="text-xs text-white/40 mt-1">Contribution of each selected material/fuel to total carbon emissions</p>
      </div>

      {slices.length === 0 ? (
        <div className="min-h-[260px] flex items-center justify-center border border-dashed border-white/10 rounded-lg text-xs text-white/40 px-4 text-center">
          No contribution data yet. Add rows with compatible units and valid factors to render the chart.
        </div>
      ) : (
        <>
          <div className="min-h-[260px] relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="none"
                >
                  {slices.map((slice, index) => (
                    <Cell key={`${slice.name}-${index}`} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, entry) => {
                    const numeric = typeof value === 'number' ? value : Number(value || 0);
                    const pct = (entry?.payload?.percentage || 0) as number;
                    return [`${numeric.toFixed(2)} kg CO2e (${pct.toFixed(1)}%)`, 'Contribution'];
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 20, 0.9)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-36 h-36 rounded-full bg-black/35 border border-white/10 flex flex-col items-center justify-center">
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Total</span>
                <span className="text-lg font-display font-semibold text-white">{totalEmissions.toFixed(1)}</span>
                <span className="text-[10px] text-white/50">kg CO2e</span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-white/10 pt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {slices.map((slice) => (
              <div key={slice.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                  <span className="text-white/80 truncate">{slice.name}</span>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <span className="text-white/70">{slice.value.toFixed(2)} kg</span>
                  <span className="text-white/40 ml-2">({slice.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </GlassCard>
  );
}
