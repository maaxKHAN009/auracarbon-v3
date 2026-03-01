import { RecipeRow, FactorsData } from './store';
import { CBAM_THRESHOLDS, CALC } from './constants';

/** GHG Scope classification per GHG Protocol */
export type Scope = 'Scope 1' | 'Scope 2' | 'Scope 3';

/** Unit conversion factors to standard base units */
export const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  'mass': {
    'kg': 1,
    'Tons': 1000,
    'g': 0.001,
    'lb': 0.453592,
  },
  'volume': {
    'liter': 1,
    'm3': 1000,
    'gallon': 3.78541,
  },
  'energy': {
    'kWh': 1,
    'MWh': 1000,
    'GJ': 277.778,
  }
};

/**
 * Convert quantity from one unit to another within the same category
 * @param value - The quantity to convert
 * @param from - Source unit
 * @param to - Target unit
 * @param type - Category: 'mass' | 'volume' | 'energy'
 * @returns Converted value, or original if conversion not found
 * @throws Warning logged if units not found
 */
export function convertUnit(value: number, from: string, to: string, type: 'mass' | 'volume' | 'energy'): number {
  if (!UNIT_CONVERSIONS[type] || !UNIT_CONVERSIONS[type][from] || !UNIT_CONVERSIONS[type][to]) {
    console.warn(`Unit conversion not found: ${from} to ${to} (${type})`);
    return value;
  }
  const baseValue = value * UNIT_CONVERSIONS[type][from];
  return baseValue / UNIT_CONVERSIONS[type][to];
}

/**
 * Calculate CO2e emissions from activity data and emission factor
 * @param activityData - Quantity of activity (in standard units)
 * @param emissionFactor - Emission factor (kg CO2e per unit)
 * @param gwp - Global Warming Potential multiplier (default 1 for CO2)
 * @returns Total emissions in kg CO2e
 */
export function calculateEmissions(activityData: number, emissionFactor: number, gwp: number = 1): number {
  if (activityData < 0 || emissionFactor < 0 || gwp < 0) {
    console.warn('Negative values passed to calculateEmissions. Using absolute values.');
    return Math.abs(activityData) * Math.abs(emissionFactor) * Math.abs(gwp);
  }
  return activityData * emissionFactor * gwp;
}

/**
 * Calculate CBAM (Carbon Border Adjustment Mechanism) compliance score
 * Based on EU emission intensity thresholds
 * @param emissionsPerUnit - kg CO2e per unit of product
 * @returns 'Low' (<0.4), 'Medium' (0.4-0.6), 'High' (>0.6)
 */
export function calculateCBAMScore(emissionsPerUnit: number): 'Low' | 'Medium' | 'High' {
  const normalized = Math.max(0, emissionsPerUnit);
  if (normalized < CBAM_THRESHOLDS.LOW) return 'Low';
  if (normalized > CBAM_THRESHOLDS.HIGH) return 'High';
  return 'Medium';
}

/**
 * Calculate tradeable green credits from emission reductions
 * @param deltaEmissions - Emission reduction in tonnes CO2e
 * @param marketPrice - Market price per tonne CO2e
 * @returns Green credit value in currency units
 */
export function calculateGreenCredits(deltaEmissions: number, marketPrice: number): number {
  if (marketPrice < 0) {
    console.warn('Negative market price passed to calculateGreenCredits');
    return 0;
  }
  return Math.max(0, deltaEmissions) * marketPrice;
}

export interface Intervention {
  id: string;
  name: string;
  description: string;
  reductionPercentage: number;
  costEstimate: number;
}

export const SUGGESTED_INTERVENTIONS: Intervention[] = [
  {
    id: 'whr',
    name: 'Waste Heat Recovery',
    description: 'Capture and reuse waste heat from industrial processes.',
    reductionPercentage: 0.15,
    costEstimate: 150000,
  },
  {
    id: 'solar',
    name: 'Solar Integration',
    description: 'Install onsite solar PV to offset grid electricity.',
    reductionPercentage: 0.25,
    costEstimate: 250000,
  },
  {
    id: 'biomass',
    name: 'Biomass Boiler Conversion',
    description: 'Switch from coal/gas to sustainable biomass.',
    reductionPercentage: 0.40,
    costEstimate: 300000,
  }
];

/**
 * Predict 5-year carbon emissions trajectory with optional interventions
 * Assumes phased implementation of interventions over first 2 years,
 * followed by 1% annual efficiency improvements
 * @param currentAnnualEmissions - Baseline annual emissions in tonnes CO2e
 * @param selectedInterventions - Array of interventions to model
 * @param years - Forecast period (default 5 years)
 * @returns Array of annual emissions for each year
 */
export function predictTrajectory(
  currentAnnualEmissions: number,
  selectedInterventions: Intervention[],
  years: number = 5
): number[] {
  if (currentAnnualEmissions < 0 || years < 1) {
    console.warn('Invalid inputs to predictTrajectory. Using defaults.');
    return Array(Math.max(1, years)).fill(Math.max(0, currentAnnualEmissions));
  }

  let trajectory = [currentAnnualEmissions];
  let current = Math.max(0, currentAnnualEmissions);
  
  // Cap total reduction at 99% to prevent negative emissions
  const totalReduction = Math.min(0.99, selectedInterventions.reduce((sum, inv) => sum + inv.reductionPercentage, 0));
  
  for (let i = 1; i <= years; i++) {
    if (i <= CALC.INTERVENTION_PHASE_IN_YEARS) {
      // First 2 years: gradual implementation (50% of reduction per year)
      current = current * (1 - (totalReduction * 0.5));
    } else {
      // After implementation: natural efficiency improvement
      current = current * CALC.EFFICIENCY_IMPROVEMENT_RATE;
    }
    trajectory.push(Math.max(0, current));
  }
  
  return trajectory;
}

/**
 * Calculate total emissions and scope breakdown from recipe rows
 * @param rows - Recipe input rows with materials/fuels and quantities
 * @param factors - Emission factors data (materials, fuels, grids)
 * @param country - Country for grid emission factor selection
 * @returns Object with total and scope-wise emission breakdown in kg CO2e
 */
export function calculateTotalEmissions(
  rows: RecipeRow[],
  factors: FactorsData,
  country: string
): { total: number; scope1: number; scope2: number; scope3: number } {
  let total = 0;
  let scope1 = 0;
  let scope2 = 0;
  let scope3 = 0;

  rows.forEach(row => {
    if (!row.materialOrFuel || row.quantity <= 0) return;

    let ef = 0;
    let scope: Scope = 'Scope 3';

    // Determine emission factor and scope based on process type
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

    // Convert quantity to standard unit (kg for mass, liter for volume, kWh for energy)
    let qty = row.quantity;
    if (row.unit === 'Tons') qty = row.quantity * 1000;
    
    const emissions = Math.max(0, qty * ef);
    total += emissions;

    if (scope === 'Scope 1') scope1 += emissions;
    if (scope === 'Scope 2') scope2 += emissions;
    if (scope === 'Scope 3') scope3 += emissions;
  });

  return {
    total: Math.round(total * 100) / 100,
    scope1: Math.round(scope1 * 100) / 100,
    scope2: Math.round(scope2 * 100) / 100,
    scope3: Math.round(scope3 * 100) / 100,
  };
}
