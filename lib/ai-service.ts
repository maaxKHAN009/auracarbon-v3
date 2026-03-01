/**
 * AI-powered emission reduction suggestions using Google Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIEmissionSuggestion {
  recommendation: string;
  targetScope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  estimatedReduction: number;
  timelineMonths: number;
  costCategory: 'low' | 'medium' | 'high';
  implementation: string;
}

/**
 * Generate AI-powered emission reduction recommendations
 * Uses Google Gemini API for analysis
 */
export async function getAIEmissionSuggestions(
  materials: string[],
  processes: string[],
  currentEmissions: number,
  scope1: number,
  scope2: number,
  scope3: number,
  productOutput: number
): Promise<AIEmissionSuggestion[]> {
  try {
    const response = await fetch('/api/ai/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        materials,
        processes,
        currentEmissions,
        scope1,
        scope2,
        scope3,
        productOutput,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // If Gemini returns raw text, parse it
    if (data.suggestions && typeof data.suggestions === 'string') {
      try {
        // Try to extract JSON from the response
        const jsonMatch = data.suggestions.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse AI suggestions as JSON, using fallback');
        return getFallbackSuggestions(scope1, scope2, scope3);
      }
    }

    return data.suggestions || getFallbackSuggestions(scope1, scope2, scope3);
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    return getFallbackSuggestions(scope1, scope2, scope3);
  }
}

/**
 * Fallback suggestions when AI is unavailable
 */
function getFallbackSuggestions(
  scope1: number,
  scope2: number,
  scope3: number
): AIEmissionSuggestion[] {
  const suggestions: AIEmissionSuggestion[] = [];

  // Scope 1 - Direct Combustion
  if (scope1 > 0) {
    suggestions.push({
      recommendation: 'Switch to renewable fuels or biomass for direct burning processes',
      targetScope: 'Scope 1',
      estimatedReduction: 55,
      timelineMonths: 12,
      costCategory: 'high',
      implementation:
        'Replace coal/gas boilers with biomass-fired or hybrid systems. Requires infrastructure investment.',
    });
  }

  // Scope 2 - Grid Electricity
  if (scope2 > 0) {
    suggestions.push({
      recommendation: 'Install renewable energy capacity (solar/wind) on-site',
      targetScope: 'Scope 2',
      estimatedReduction: 80,
      timelineMonths: 18,
      costCategory: 'high',
      implementation:
        'Deploy solar PV or wind turbines. Consider power purchase agreements (PPAs) for lower upfront costs.',
    });
  }

  // Scope 3 - Supply Chain
  if (scope3 > 0) {
    suggestions.push({
      recommendation: 'Source materials from low-carbon suppliers',
      targetScope: 'Scope 3',
      estimatedReduction: 40,
      timelineMonths: 6,
      costCategory: 'low',
      implementation:
        'Audit suppliers, prioritize local sourcing, and establish carbon reduction targets in contracts.',
    });
  }

  // General optimization
  suggestions.push({
    recommendation: 'Implement energy efficiency improvements and process optimization',
    targetScope: 'Scope 2',
    estimatedReduction: 20,
    timelineMonths: 3,
    costCategory: 'medium',
    implementation:
      'LED lighting, insulation, heat recovery systems, and process optimization can reduce baseline energy needs.',
  });

  return suggestions;
}
