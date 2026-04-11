/**
 * AI-powered emission reduction suggestions — Client Service
 * AuraCarbon v3 — Updated lib/ai-service.ts
 * 
 * Calls the enhanced /api/ai/suggestions endpoint and returns
 * typed suggestions + carbon credit projections.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIEmissionSuggestion {
  recommendation: string;
  targetScope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  estimatedReduction: number;
  timelineMonths: number;
  costCategory: 'low' | 'medium' | 'high';
  implementation: string;
  alternativeProduct?: string;
  annualCO2Saved?: number;
}

export interface CarbonCreditProjection {
  annualReductionTonnes: number;
  revenueAt10: number;
  revenueAt30: number;
  revenueAt50: number;
  revenueAtMarket: number;
  marketPriceUsed: number;
  currency: string;
}

export interface EmissionSummary {
  totalKgCO2e: number;
  totalTonnesCO2e: number;
  scope1: number;
  scope2: number;
  scope3: number;
  dominantScope: string;
  intensityPerTon: number;
}

export interface AISuggestionsResponse {
  success: boolean;
  suggestions: AIEmissionSuggestion[];
  carbonCredits: CarbonCreditProjection;
  emissionSummary: EmissionSummary;
  provider: 'gemini' | 'openai' | 'fallback';
  generatedAt: string;
}

// ─── Main Function ───────────────────────────────────────────────────────────

/**
 * Generate AI-powered emission reduction recommendations
 * with carbon credit revenue projections.
 * 
 * @returns Full response including suggestions, carbon credits, and summary
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data: AISuggestionsResponse = await response.json();

    if (!data.success || !data.suggestions) {
      throw new Error('Invalid response from AI suggestions API');
    }

    return data.suggestions;
  } catch (error) {
    console.error('[AuraCarbon] AI service error:', error);
    return [];
  }
}

/**
 * Get the FULL AI response including carbon credit projections.
 * Use this when you need carbon credit data in addition to suggestions.
 */
export async function getFullAISuggestionsResponse(
  materials: string[],
  processes: string[],
  currentEmissions: number,
  scope1: number,
  scope2: number,
  scope3: number,
  productOutput: number
): Promise<AISuggestionsResponse | null> {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data: AISuggestionsResponse = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('[AuraCarbon] Full AI service error:', error);
    return null;
  }
}
