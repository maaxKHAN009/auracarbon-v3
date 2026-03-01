'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { SUGGESTED_INTERVENTIONS, predictTrajectory, calculateTotalEmissions } from '@/lib/carbon-engine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';
import { useCarbonStore } from '@/lib/store';
import { getAIEmissionSuggestions } from '@/lib/ai-service';

interface TrajectoryPoint {
  year: string;
  current: number;
  optimized: number;
}

interface AISuggestion {
  recommendation: string;
  targetScope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  estimatedReduction: number;
  timelineMonths: number;
  costCategory: 'low' | 'medium' | 'high';
  implementation: string;
}

export function PredictiveOptimization() {
  const { rows, factors, country, isLoading } = useCarbonStore();
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryPoint[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Memoize calculations to prevent unnecessary recalculations
  const emissionsData = useMemo(() => {
    if (!factors || rows.length === 0) {
      return { total: 0 };
    }
    try {
      return calculateTotalEmissions(rows, factors, country);
    } catch (error) {
      console.error('Error calculating emissions:', error);
      return { total: 0 };
    }
  }, [rows, factors, country]);

  useEffect(() => {
    if (factors && emissionsData.total > 0) {
      try {
        const totalTons = emissionsData.total / 1000;
        
        const bauTrajectory = predictTrajectory(totalTons, [], 5);
        const optimizedTrajectory = predictTrajectory(totalTons, SUGGESTED_INTERVENTIONS, 5);
        
        const currentYear = new Date().getFullYear();
        const newData = bauTrajectory.map((bau, index) => ({
          year: (currentYear + index).toString(),
          current: Math.round(bau),
          optimized: Math.round(optimizedTrajectory[index])
        }));
        
        setTrajectoryData(newData);
      } catch (error) {
        console.error('Error generating trajectory:', error);
        setTrajectoryData([]);
      }
    }
  }, [factors, emissionsData]);

  const handleGetAISuggestions = async () => {
    if (!emissionsData.total || !emissionsData.scope1 || rows.length === 0) {
      console.log('Insufficient data for AI suggestions');
      return;
    }

    setAiLoading(true);
    try {
      const materials = [...new Set(rows.map((r) => r.material))];
      const processes = [...new Set(rows.map((r) => r.process))];

      const suggestions = await getAIEmissionSuggestions(
        materials,
        processes,
        emissionsData.total,
        emissionsData.scope1 || 0,
        emissionsData.scope2 || 0,
        emissionsData.scope3 || 0,
        rows[0]?.productOutput || 1
      );

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setAiSuggestions([]);
    } finally {
      setAiLoading(false);
    }
  };

  const hasData = trajectoryData.length > 0;

  return (
    <GlassCard className="h-full flex flex-col" delay={0.5}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-medium text-white/60 tracking-wider uppercase">Predictive Optimization</h3>
          <p className="text-xs text-white/40 mt-1">5-Year Carbon Trajectory Forecast</p>
        </div>
        <div className="p-2 bg-[#FFCC00]/10 rounded-full">
          <Zap className="w-5 h-5 text-[#FFCC00]" />
        </div>
      </div>
      
      {!hasData ? (
        <div className="flex-1 min-h-[200px] mb-6 flex items-center justify-center text-center">
          <div className="text-white/40 text-sm">
            <p>Add materials and fuels to see emission trajectory forecast</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="year" 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                aria-label="Year"
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                aria-label="Emissions (tCO2e)"
              />
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
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#FF3366" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#FF3366' }} 
                name="BAU (Business As Usual)"
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="optimized" 
                stroke="#00FF88" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#00FF88' }} 
                name="Optimized (With Interventions)"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="space-y-3">
        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">Suggested Interventions</h4>
        {SUGGESTED_INTERVENTIONS.map((intervention) => (
          <div 
            key={intervention.id} 
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            role="article"
            aria-label={`${intervention.name}: ${(intervention.reductionPercentage * 100).toFixed(0)}% reduction`}
          >
            <div>
              <div className="text-sm font-medium">{intervention.name}</div>
              <div className="text-xs text-white/40 mt-1">Est. Cost: ${(intervention.costEstimate / 1000).toFixed(0)}k</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-[#00FF88]">-{(intervention.reductionPercentage * 100).toFixed(0)}%</div>
                <div className="text-xs text-white/40 mt-1">Emissions</div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* AI-Powered Suggestions Section */}
      <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs text-white/40 uppercase tracking-wider">AI-Powered Insights</h4>
          <button
            onClick={handleGetAISuggestions}
            disabled={aiLoading || emissionsData.total === 0}
            className="px-3 py-1 bg-[#00CCFF]/20 text-[#00CCFF] text-xs rounded-lg hover:bg-[#00CCFF]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            aria-label="Get AI-powered emission reduction suggestions"
          >
            <Sparkles className="w-4 h-4" />
            {aiLoading ? 'Analyzing...' : 'Get Suggestions'}
          </button>
        </div>

        {aiSuggestions.length > 0 && (
          <div className="space-y-2 mt-2">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                role="article"
                aria-label={`${suggestion.recommendation}: ${suggestion.estimatedReduction}% reduction in ${suggestion.timelineMonths} months`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{suggestion.recommendation}</div>
                    <div className="text-xs text-white/40 mt-1">
                      {suggestion.targetScope} • {suggestion.timelineMonths} months •{' '}
                      <span className={suggestion.costCategory === 'low' ? 'text-[#00FF88]' : suggestion.costCategory === 'medium' ? 'text-[#FFCC00]' : 'text-[#FF3366]'}>
                        {suggestion.costCategory.toUpperCase()} cost
                      </span>
                    </div>
                    <div className="text-xs text-white/60 mt-2">{suggestion.implementation}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium text-[#00FF88]">-{suggestion.estimatedReduction}%</div>
                    <div className="text-xs text-white/40">Reduction</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
