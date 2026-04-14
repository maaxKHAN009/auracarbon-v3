'use client';

import React, { useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { useCarbonStore } from '@/lib/store';
import { PROCESSES, UNITS } from '@/lib/constants';
import { Plus, Trash2, Globe, Box, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RecipeBuilder() {
  const { 
    rows, 
    addRow, 
    updateRow, 
    removeRow, 
    country, 
    setCountry, 
    totalProductOutput, 
    setTotalProductOutput, 
    factors, 
    fetchFactors,
    isLoading,
    error,
    clearError
  } = useCarbonStore();

  useEffect(() => {
    fetchFactors();
  }, [fetchFactors]);

  // Loading state
  if (isLoading && !factors) {
    return (
      <GlassCard className="w-full flex flex-col gap-6" delay={0.1}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-12 bg-white/10 rounded"></div>
          <div className="h-12 bg-white/10 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!factors) return null;

  return (
    <GlassCard className="w-full flex flex-col gap-6" delay={0.1}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-display font-semibold text-white tracking-wider uppercase">Project Configuration</h3>
          <p className="text-xs text-white/40 mt-1">Industrial Recipe Builder</p>
        </div>
        <button 
          onClick={addRow}
          aria-label="Add new material or fuel row"
          className="flex items-center gap-2 bg-[#00FF88]/20 text-[#00FF88] px-3 py-1.5 rounded-md hover:bg-[#00FF88]/30 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      {/* Error notification */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-start gap-3 p-3 rounded-lg bg-[#FF3366]/10 border border-[#FF3366]/30"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-[#FF3366]">{error}</p>
          </div>
          <button
            onClick={clearError}
            aria-label="Close error notification"
            className="text-[#FF3366]/60 hover:text-[#FF3366] text-xs font-medium"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black p-4 rounded-lg border border-white/10">
        <div>
          <label 
            htmlFor="country-select"
            className="block text-xs text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2"
          >
            <Globe className="w-4 h-4" /> Country Grid
          </label>
          <select 
            id="country-select"
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Select country for grid emission factor"
            className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-[#00CCFF]"
          >
            {Object.keys(factors.grids).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label 
            htmlFor="output-input"
            className="block text-xs text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2"
          >
            <Box className="w-4 h-4" /> Total Product Output (Tons)
          </label>
          <input 
            id="output-input"
            type="number" 
            value={totalProductOutput}
            onChange={(e) => setTotalProductOutput(Number(e.target.value))}
            aria-label="Total product output in tons"
            aria-describedby="output-help"
            className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-[#00CCFF]"
            min="1"
          />
          <p id="output-help" className="text-xs text-white/40 mt-1">Minimum 1 ton</p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {rows.map((row) => (
            <motion.div 
              key={row.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-12 gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/10"
            >
              <div className="col-span-12 md:col-span-3">
                <select 
                  value={row.materialOrFuel} 
                  onChange={(e) => updateRow(row.id, 'materialOrFuel', e.target.value)}
                  aria-label="Select material or fuel"
                  className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00FF88]"
                >
                  <option value="" disabled>Select Item...</option>
                  <optgroup label="Materials">
                    {Object.keys(factors.materials).map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                  <optgroup label="Fuels">
                    {Object.keys(factors.fuels).map(f => <option key={f} value={f}>{f}</option>)}
                  </optgroup>
                </select>
              </div>
              
              <div className="col-span-12 md:col-span-3">
                <select 
                  value={row.process} 
                  onChange={(e) => updateRow(row.id, 'process', e.target.value)}
                  aria-label="Select process type"
                  className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00FF88]"
                >
                  {PROCESSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="col-span-6 md:col-span-2">
                <input 
                  type="number" 
                  value={row.quantity || ''}
                  onChange={(e) => updateRow(row.id, 'quantity', Number(e.target.value))}
                  aria-label="Quantity"
                  placeholder="Qty"
                  min="0"
                  step="0.01"
                  className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00FF88]"
                />
              </div>

              <div className="col-span-4 md:col-span-2">
                <select 
                  value={row.unit} 
                  onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                  aria-label="Select unit"
                  className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00FF88]"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="col-span-2 md:col-span-2 flex justify-end">
                <button 
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove ${row.materialOrFuel || 'item'} row`}
                  className="p-1.5 text-[#FF3366]/60 hover:text-[#FF3366] hover:bg-[#FF3366]/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {rows.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm border border-dashed border-white/10 rounded-lg">
            No materials or processes added yet. Click "Add Row" to begin.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
