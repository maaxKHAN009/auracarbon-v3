'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { Save, Plus, Trash2, X } from 'lucide-react';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const { factors, updateFactors } = useCarbonStore();
  const [localFactors, setLocalFactors] = useState(factors);
  const [isSaving, setIsSaving] = useState(false);

  if (!localFactors) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await updateFactors(localFactors);
    setIsSaving(false);
    onClose();
  };

  const updateFactor = (category: 'materials' | 'fuels' | 'grids', key: string, value: number) => {
    setLocalFactors(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
    });
  };

  const addFactor = (category: 'materials' | 'fuels' | 'grids') => {
    const name = prompt(`Enter new ${category.slice(0, -1)} name:`);
    if (!name) return;
    const value = parseFloat(prompt(`Enter emission factor for ${name}:`) || '0');
    
    setLocalFactors(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [name]: value
        }
      };
    });
  };

  const removeFactor = (category: 'materials' | 'fuels' | 'grids', key: string) => {
    if (!confirm(`Are you sure you want to remove ${key}?`)) return;
    
    setLocalFactors(prev => {
      if (!prev) return prev;
      const newCategory = { ...prev[category] };
      delete newCategory[key];
      return {
        ...prev,
        [category]: newCategory
      };
    });
  };

  const renderCategory = (title: string, category: 'materials' | 'fuels' | 'grids', unit: string) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">{title}</h4>
        <button 
          onClick={() => addFactor(category)}
          className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
        >
          <Plus className="w-3 h-3" /> Add New
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(localFactors[category]).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
            <span className="text-sm text-white/80 truncate pr-2" title={key}>{key}</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={value}
                onChange={(e) => updateFactor(category, key, parseFloat(e.target.value) || 0)}
                className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-[#00CCFF]"
                step="0.01"
              />
              <span className="text-xs text-white/40 w-8">{unit}</span>
              <button 
                onClick={() => removeFactor(category, key)}
                className="text-[#FF3366]/60 hover:text-[#FF3366] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <GlassCard className="w-full" delay={0.1}>
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-display font-semibold text-white tracking-wider uppercase">Persistence Engine</h3>
          <p className="text-xs text-white/40 mt-1">Manage Emission Factors Database</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#00CCFF]/20 text-[#00CCFF] px-4 py-2 rounded-md hover:bg-[#00CCFF]/30 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {renderCategory('Materials (Scope 3)', 'materials', 'kg/kg')}
        {renderCategory('Fuels (Scope 1)', 'fuels', 'kg/unit')}
        {renderCategory('Grid Factors (Scope 2)', 'grids', 'kg/kWh')}
      </div>
    </GlassCard>
  );
}
