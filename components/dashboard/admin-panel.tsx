'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { Save, Plus, Trash2, X } from 'lucide-react';
import { COUNTRY_CURRENCY_MAP } from '@/lib/constants';

const SUPPORTED_CURRENCIES: Record<string, string> = COUNTRY_CURRENCY_MAP;

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const { factors, updateFactors, vcmValue, vcmCurrency, setVcmValue, setVcmCurrency } = useCarbonStore();
  const [localFactors, setLocalFactors] = useState(factors);
  const [localVcmValue, setLocalVcmValue] = useState(vcmValue.toString());
  const [isSaving, setIsSaving] = useState(false);

  if (!localFactors) return null;

  const getDefaultUnitForCategory = (category: 'materials' | 'fuels' | 'grids', factorName: string): string => {
    if (category === 'materials') return 'kg';
    if (category === 'grids') return 'kWh';
    if (factorName === 'CNG') return 'm3';
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
    return energyFuels.has(factorName) ? 'kWh' : 'liter';
  };

  const getFactorUnit = (category: 'materials' | 'fuels' | 'grids', factorName: string): string => {
    return (
      localFactors.factorUnits?.[category]?.[factorName] ||
      getDefaultUnitForCategory(category, factorName)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateFactors(localFactors);
    setVcmValue(parseFloat(localVcmValue) || 5.00);
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
        },
        factorUnits: {
          ...(prev.factorUnits || {}),
          [category]: {
            ...(prev.factorUnits?.[category] || {}),
            [name]: getDefaultUnitForCategory(category, name)
          }
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
      const newFactorUnitsCategory = { ...(prev.factorUnits?.[category] || {}) };
      delete newFactorUnitsCategory[key];
      return {
        ...prev,
        [category]: newCategory,
        factorUnits: {
          ...(prev.factorUnits || {}),
          [category]: newFactorUnitsCategory
        }
      };
    });
  };

  const getSourceForFactor = (category: 'materials' | 'fuels' | 'grids', name: string): string => {
    if (!localFactors?.standardFactors) return 'Internal default';

    if (category === 'grids') {
      const row = (localFactors.standardFactors.electricityGrid || []).find((item) =>
        String(item.region || '').toLowerCase() === name.toLowerCase()
      );
      return row ? String(row.source || 'Standard source') : 'Country table default';
    }

    const pools = [
      ...(localFactors.standardFactors.stationaryCombustion || []),
      ...(localFactors.standardFactors.solidFuels || []),
      ...(localFactors.standardFactors.industrialMaterials || []),
    ];

    const row = pools.find((item) =>
      String(item.name || item.material || '').toLowerCase() === name.toLowerCase()
    );

    return row ? String(row.source || 'Standard source') : 'User/admin custom';
  };

  const renderCategory = (title: string, category: 'materials' | 'fuels' | 'grids') => (
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
      <div className="overflow-x-auto border border-white/10 rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-3 py-2 text-white/60 uppercase tracking-wider">Factor</th>
              <th className="text-right px-3 py-2 text-white/60 uppercase tracking-wider">Value</th>
              <th className="text-left px-3 py-2 text-white/60 uppercase tracking-wider">Unit</th>
              <th className="text-left px-3 py-2 text-white/60 uppercase tracking-wider">Source</th>
              <th className="text-right px-3 py-2 text-white/60 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(localFactors[category]).map(([key, value]) => (
              <tr key={key} className="border-t border-white/5">
                <td className="px-3 py-2 text-white/80">{key}</td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateFactor(category, key, parseFloat(e.target.value) || 0)}
                    className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-right text-white focus:outline-none focus:border-[#00CCFF]"
                    step="0.00001"
                  />
                </td>
                <td className="px-3 py-2 text-white/50">{getFactorUnit(category, key)}</td>
                <td className="px-3 py-2 text-white/50">{getSourceForFactor(category, key)}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => removeFactor(category, key)}
                    className="text-[#FF3366]/60 hover:text-[#FF3366] transition-colors"
                    title="Remove factor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        {/* VCM Configuration Section */}
        <div className="mb-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider mb-4">VCM Pricing Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Default VCM Price (per ton)</label>
              <input
                type="number"
                value={localVcmValue}
                onChange={(e) => setLocalVcmValue(e.target.value)}
                min="0"
                step="0.01"
                className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-[#00CCFF]"
                placeholder="e.g., 5.00"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">Default Currency</label>
              <select
                value={vcmCurrency}
                onChange={(e) => setVcmCurrency(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-[#00CCFF]"
              >
                {Object.values(SUPPORTED_CURRENCIES)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-2">These default values will be used when users open their credit wallet. They can modify them as needed.</p>
        </div>

        {renderCategory('Materials (Scope 3)', 'materials')}
        {renderCategory('Fuels (Scope 1)', 'fuels')}
        {renderCategory('Grid Factors (Scope 2)', 'grids')}
      </div>
    </GlassCard>
  );
}
