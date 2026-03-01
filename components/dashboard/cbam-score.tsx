'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { useCarbonStore } from '@/lib/store';
import { calculateTotalEmissions, calculateCBAMScore } from '@/lib/carbon-engine';

export function CbamScore() {
  const { rows, factors, country, totalProductOutput } = useCarbonStore();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const benchmark = 0.5; // Example benchmark: 0.5 tCO2e/t

  // Memoize emissions calculation
  const emissionsData = useMemo(() => {
    if (!factors || rows.length === 0) {
      return { total: 0 };
    }
    try {
      return calculateTotalEmissions(rows, factors, country);
    } catch (error) {
      console.error('Error calculating CBAM emissions:', error);
      return { total: 0 };
    }
  }, [rows, factors, country]);

  useEffect(() => {
    if (factors && totalProductOutput > 0 && emissionsData.total > 0) {
      try {
        // Convert total kg to tons
        const totalTons = emissionsData.total / 1000;
        const emissionsPerUnit = Math.max(0, totalTons / totalProductOutput);
        
        setCurrent(emissionsPerUnit);
        setScore(calculateCBAMScore(emissionsPerUnit));
      } catch (error) {
        console.error('Error calculating CBAM score:', error);
        setCurrent(0);
      }
    } else {
      setCurrent(0);
    }
  }, [factors, totalProductOutput, emissionsData]);

  const getScoreDetails = () => {
    switch (score) {
      case 'Low':
        return { color: '#00FF88', icon: ShieldCheck, text: 'Low Risk', bg: 'bg-[#00FF88]/10' };
      case 'Medium':
        return { color: '#FFCC00', icon: ShieldAlert, text: 'Medium Risk', bg: 'bg-[#FFCC00]/10' };
      case 'High':
        return { color: '#FF3366', icon: ShieldX, text: 'High Risk', bg: 'bg-[#FF3366]/10' };
      default:
        return { color: '#00CCFF', icon: ShieldCheck, text: 'Unknown', bg: 'bg-[#00CCFF]/10' };
    }
  };

  const details = getScoreDetails();
  const Icon = details.icon;
  const isAboveBenchmark = current > benchmark;

  return (
    <GlassCard className="flex flex-col justify-between h-60" delay={0.4}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">EU CBAM Compliance</h3>
          <p className="text-xs text-white/40 mt-1">Export Readiness Score</p>
        </div>
        <div 
          className={`p-2 ${details.bg} rounded-full`}
          role="img"
          aria-label={`CBAM compliance status: ${details.text}`}
        >
          <Icon className="w-5 h-5" style={{ color: details.color }} />
        </div>
      </div>
      
      <div className="flex items-end gap-3 mt-auto">
        <div 
          className="text-4xl font-display font-semibold tracking-tighter" 
          style={{ color: current > 0 ? details.color : '#666' }}
          aria-label={`Score: ${details.text}`}
        >
          {current > 0 ? details.text : 'Waiting for Data'}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">EU Benchmark</div>
          <div className="text-lg font-medium">
            {benchmark.toFixed(2)} <span className="text-xs text-white/40">tCO₂e/t</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Your Product</div>
          <div 
            className="text-lg font-medium" 
            style={{ color: current > 0 ? (isAboveBenchmark ? '#FF3366' : '#00FF88') : '#666' }}
            aria-label={`Your emissions: ${current > 0 ? current.toFixed(2) : '0.00'} tCO2e per ton`}
          >
            {current > 0 ? current.toFixed(2) : '0.00'} <span className="text-xs text-white/40">tCO₂e/t</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
