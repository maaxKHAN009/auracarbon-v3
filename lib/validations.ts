/**
 * Validation utilities for AuraCarbon data and inputs
 */

import { RecipeRow, FactorsData } from './store';

/**
 * Validate if a value is a non-negative number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validate if quantity is valid (positive number)
 */
export function isValidQuantity(quantity: number): boolean {
  return isValidNumber(quantity) && quantity > 0;
}

/**
 * Validate if product output is valid (minimum 1 ton)
 */
export function isValidProductOutput(output: number): boolean {
  return isValidNumber(output) && output >= 1;
}

/**
 * Validate recipe row - check if all required fields are filled
 */
export function isValidRecipeRow(row: RecipeRow): boolean {
  return (
    row.materialOrFuel.trim().length > 0 &&
    isValidQuantity(row.quantity) &&
    row.unit.length > 0 &&
    row.process.length > 0
  );
}

/**
 * Validate emission factors data structure
 */
export function isValidFactorsData(data: unknown): data is FactorsData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  
  const isValidFactorGroup = (group: unknown): group is Record<string, number> => {
    if (!group || typeof group !== 'object') return false;
    return Object.entries(group).every(
      ([key, value]) => typeof key === 'string' && typeof value === 'number' && value >= 0
    );
  };

  return (
    isValidFactorGroup(obj.materials) &&
    isValidFactorGroup(obj.fuels) &&
    isValidFactorGroup(obj.grids)
  );
}

/**
 * Sanitize and validate user input string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 100) // Max 100 characters
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Format number for display (2 decimal places)
 */
export function formatEmissions(value: number): string {
  return Math.max(0, value).toFixed(2);
}

/**
 * Calculate percentage with validation
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0 || !isValidNumber(value) || !isValidNumber(total)) {
    return 0;
  }
  return (value / total) * 100;
}
