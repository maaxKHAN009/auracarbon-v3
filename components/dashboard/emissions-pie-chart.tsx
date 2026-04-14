'use client';

import React, { useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCarbonStore } from '@/lib/store';

const PIE_COLORS = ['#00CCFF', '#00FF88', '#FF3366', '#FFCC00', '#7BDFF2', '#F1C0E8', '#B9FBC0'];

interface MaterialEmissionSlice {
  name: string;
  value: number;
  color: string;
  percentage: number;
  hasFactor: boolean;
}

export function EmissionsPieChart() {
  const { rows, factors, country } = useCarbonStore();

  const data = useMemo<MaterialEmissionSlice[]>(() => {
    if (!factors || rows.length === 0) return [];

    const materialTotals = new Map<string, number>();

    rows.forEach((row) => {
      if (!row.materialOrFuel || row.quantity <= 0) return;

      let ef = 0;
      if (row.process === 'Direct Burning' || row.process === 'Chemical Calcination') {
        ef = factors.fuels[row.materialOrFuel] || factors.materials[row.materialOrFuel] || 0;
      } else if (row.process === 'Electrical Grinding') {
        ef = factors.grids[country] || 0;
      } else {
        ef = factors.materials[row.materialOrFuel] || 0;
      }

      let qty = row.quantity;
      if (row.unit === 'Tons') qty = row.quantity * 1000;

      const emissions = Math.max(0, qty * ef);
      const key = row.materialOrFuel.trim();
      const current = materialTotals.get(key) || 0;
      materialTotals.set(key, current + emissions);
    });

    const rawSlices = Array.from(materialTotals.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
        hasFactor: value > 0,
      }))
      .sort((a, b) => b.value - a.value);

    const total = rawSlices.reduce((sum, item) => sum + item.value, 0);
    const slices = rawSlices.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));

    return slices;
  }, [rows, factors, country]);

  const totalEmissions = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const positiveData = data.filter((item) => item.value > 0);
  const chartData = positiveData.length > 0
    ? positiveData
    : [{ name: 'No emissions data', value: 1, color: '#4A4A4A', percentage: 0, hasFactor: false }];

  return (
    <GlassCard className="h-full flex flex-col" delay={0.3}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Emissions Breakdown</h3>
        <p className="text-xs text-white/40 mt-1">Material/Fuel contribution to total emissions</p>
      </div>
      
      <div className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => {
                const safeValue = typeof value === 'number' ? value : Number(value || 0);
                const percent = totalEmissions > 0 ? (safeValue / totalEmissions) * 100 : 0;
                return [`${safeValue.toFixed(2)} kg CO2e (${percent.toFixed(1)}%)`, 'Contribution'];
              }}
              contentStyle={{ 
                backgroundColor: 'rgba(20, 20, 20, 0.8)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center overlay for 3D/depth effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center">
            <span className="text-xs text-white/40 uppercase tracking-widest">Total</span>
            <span className="text-xl font-display font-bold">{totalEmissions > 0 ? (totalEmissions / 1000).toFixed(1) + 'k' : '0'}</span>
            <span className="text-[10px] text-white/40">kg CO₂e</span>
          </div>
        </div>
      </div>

      {data.length === 0 && (
        <div className="mt-3 text-center text-xs text-white/40">
          Add valid material/fuel rows with quantity to populate the chart.
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3 space-y-2">
          {data.slice(0, 8).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-white/80 truncate">{item.name}</span>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <span className="text-white/70">{item.value.toFixed(2)} kg</span>
                <span className="text-white/40 ml-2">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          ))}
          {data.some((item) => !item.hasFactor) && (
            <div className="text-[11px] text-[#FFCC00] mt-2">
              Some selected items have no mapped emission factor and currently contribute 0. Add/edit factors in Admin Panel to enable those calculations.
            </div>
          )}
          {data.length > 8 && (
            <div className="text-[11px] text-white/40">+{data.length - 8} more items in chart legend</div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
