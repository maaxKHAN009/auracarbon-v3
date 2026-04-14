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
      materialTotals.set(key, (materialTotals.get(key) || 0) + emissions);
    });

    const slices = Array.from(materialTotals.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return slices;
  }, [rows, factors, country]);

  const totalEmissions = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const chartData = data.length > 0 ? data : [{ name: 'No emissions data', value: 1, color: '#4A4A4A' }];

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
    </GlassCard>
  );
}
