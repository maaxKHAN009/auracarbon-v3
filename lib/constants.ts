/**
 * Global constants for AuraCarbon application
 */

import { ProcessType, UnitType } from './store';

// Process types
export const PROCESSES: ProcessType[] = [
  'Direct Burning',
  'Electrical Grinding',
  'Chemical Calcination',
  'Raw Material'
];

// Unit types
export const UNITS: UnitType[] = ['Tons', 'kg', 'm3', 'liter', 'kWh'];

// CBAM score thresholds (kg CO2e per unit)
export const CBAM_THRESHOLDS = {
  LOW: 0.4,
  HIGH: 0.6,
} as const;

// Default values
export const DEFAULTS = {
  COUNTRY: 'Germany',
  PRODUCT_OUTPUT: 1000, // Tons
  QUANTITY: 0,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  CARBON_STORE: 'auracarbon_store',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  FACTORS_GET: '/api/factors',
  FACTORS_UPDATE: '/api/factors',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_QUANTITY: 'Quantity must be a positive number',
  INVALID_OUTPUT: 'Product output must be at least 1 ton',
  FETCH_FACTORS_FAILED: 'Failed to fetch emission factors. Please try again.',
  UPDATE_FACTORS_FAILED: 'Failed to update emission factors. Please try again.',
  UNAUTHORIZED: 'You do not have permission to perform this action',
  INVALID_DATA: 'Invalid data structure received',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ROW_ADDED: 'Row added successfully',
  ROW_REMOVED: 'Row removed successfully',
  FACTORS_UPDATED: 'Emission factors updated successfully',
} as const;

// Calculations
export const CALC = {
  EFFICIENCY_IMPROVEMENT_RATE: 0.99, // 1% annual improvement
  INTERVENTION_PHASE_IN_YEARS: 2,
} as const;

export interface CarbonMarketPrice {
  name: string;
  price: number; // USD per ton
  range: string;
  project_type: string;
}

// Market reference prices based on typical VCM market data
export const MARKET_PRICES: CarbonMarketPrice[] = [
  {
    name: 'Verified Carbon Units (VCU)',
    price: 5.50,
    range: '$4.50 - $7.00',
    project_type: 'Verified Emission Reductions'
  },
  {
    name: 'Gold Standard (GS)',
    price: 8.25,
    range: '$7.50 - $12.00',
    project_type: 'High-Impact Projects'
  },
  {
    name: 'Nature-Based Solutions',
    price: 6.75,
    range: '$5.50 - $9.00',
    project_type: 'Forestry & Conservation'
  },
  {
    name: 'Renewable Energy Credits',
    price: 4.80,
    range: '$3.50 - $6.50',
    project_type: 'Wind, Solar, Hydro'
  },
  {
    name: 'Methane Reduction',
    price: 9.50,
    range: '$8.00 - $15.00',
    project_type: 'Landfill & Agriculture'
  },
  {
    name: 'Energy Efficiency Credits',
    price: 5.20,
    range: '$4.00 - $7.50',
    project_type: 'Industrial Efficiency'
  },
];

// Approximate FX rates: 1 unit of currency = X USD
export const CURRENCY_TO_USD_RATE: Record<string, number> = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
  PLN: 0.26,
  CZK: 0.043,
  HUF: 0.0027,
  RON: 0.22,
  BGN: 0.56,
  CAD: 0.74,
  AUD: 0.66,
  JPY: 0.0067,
  CNY: 0.14,
  INR: 0.012,
  BRL: 0.20,
  MXN: 0.059,
  PKR: 0.0036,
};

// Country and region currency mapping for all countries in the grid selector.
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'United Kingdom': 'GBP',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
  'Belgium': 'EUR',
  'Luxembourg': 'EUR',
  'Austria': 'EUR',
  'Poland': 'PLN',
  'Czech Republic': 'CZK',
  'Hungary': 'HUF',
  'Romania': 'RON',
  'Bulgaria': 'BGN',
  'Croatia': 'EUR',
  'Slovenia': 'EUR',
  'Slovakia': 'EUR',
  'Ireland': 'EUR',
  'United States': 'USD',
  'USA - WECC California (CAMX)': 'USD',
  'USA - ERCOT Texas (ERCT)': 'USD',
  'USA - WECC Southwest (AZNM)': 'USD',
  'USA - FRCC Florida (FRCC)': 'USD',
  'USA - ASCC Alaska Grid (AKGD)': 'USD',
  'USA - HICC Miscellaneous (HIMS)': 'USD',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Japan': 'JPY',
  'China': 'CNY',
  'India': 'INR',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
  'Pakistan': 'PKR',
  'Global Average': 'USD',
};

export function calculateAverageVcmPrice(): number {
  if (MARKET_PRICES.length === 0) return 0;
  return MARKET_PRICES.reduce((sum, p) => sum + p.price, 0) / MARKET_PRICES.length;
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromRate = CURRENCY_TO_USD_RATE[fromCurrency];
  const toRate = CURRENCY_TO_USD_RATE[toCurrency];
  if (!fromRate || !toRate) return amount;

  const usdAmount = amount * fromRate;
  return usdAmount / toRate;
}
