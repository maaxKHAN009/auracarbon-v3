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
