'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useCarbonStore } from '@/lib/store';
import { calculateTotalEmissions } from '@/lib/carbon-engine';

export function EmissionsPieChart() {
  const { rows, factors, country } = useCarbonStore();
  const [data, setData] = useState([
    { name: 'Material (Scope 3)', value: 0, color: '#00CCFF' },
    { name: 'Energy (Scope 2)', value: 0, color: '#00FF88' },
    { name: 'Direct (Scope 1)', value: 0, color: '#FF3366' },
  ]);
  const [totalEmissions, setTotalEmissions] = useState(0);

  useEffect(() => {
    if (factors) {
      const { total, scope1, scope2, scope3 } = calculateTotalEmissions(rows, factors, country);
      setTotalEmissions(total);
      
      if (total > 0) {
        setData([
          { name: 'Material (Scope 3)', value: scope3, color: '#00CCFF' },
          { name: 'Energy (Scope 2)', value: scope2, color: '#00FF88' },
          { name: 'Direct (Scope 1)', value: scope1, color: '#FF3366' },
        ]);
      } else {
        setData([
          { name: 'Material (Scope 3)', value: 0, color: '#00CCFF' },
          { name: 'Energy (Scope 2)', value: 0, color: '#00FF88' },
          { name: 'Direct (Scope 1)', value: 0, color: '#FF3366' },
        ]);
      }
    }
  }, [rows, factors, country]);
  return (
    <GlassCard className="h-full flex flex-col" delay={0.3}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Emissions Breakdown</h3>
        <p className="text-xs text-white/40 mt-1">Scope 1, 2, and 3 Distribution</p>
      </div>
      
      <div className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
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
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center">
            <span className="text-xs text-white/40 uppercase tracking-widest">Total</span>
            <span className="text-xl font-display font-bold">{totalEmissions > 0 ? (totalEmissions / 1000).toFixed(1) + 'k' : '0'}</span>
            <span className="text-[10px] text-white/40">kg CO₂e</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
