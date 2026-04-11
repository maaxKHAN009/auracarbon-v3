/**
 * Enhanced API endpoint for AI-powered emission reduction suggestions
 * AuraCarbon v3 — Drop-in replacement for app/api/ai/suggestions/route.ts
 * 
 * Features:
 * - Multi-provider LLM support (Google Gemini primary, OpenAI GPT-4 fallback)
 * - Carbon credit revenue projections at multiple price points
 * - Local alternatives database for instant fallback suggestions
 * - Rate limiting per IP
 * - Structured JSON response matching AIEmissionSuggestion interface
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MaterialInput {
  name: string;
  quantity: number;
  unit: string;
  process: string;
}

interface AIEmissionSuggestion {
  recommendation: string;
  targetScope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  estimatedReduction: number;       // percentage (0-100)
  timelineMonths: number;
  costCategory: 'low' | 'medium' | 'high';
  implementation: string;
  alternativeProduct?: string;
  annualCO2Saved?: number;          // tonnes CO2e/year
}

interface CarbonCreditProjection {
  annualReductionTonnes: number;
  revenueAt10: number;
  revenueAt30: number;
  revenueAt50: number;
  revenueAtMarket: number;
  marketPriceUsed: number;
  currency: string;
}

interface SuggestionsResponse {
  success: boolean;
  suggestions: AIEmissionSuggestion[];
  carbonCredits: CarbonCreditProjection;
  emissionSummary: {
    totalKgCO2e: number;
    totalTonnesCO2e: number;
    scope1: number;
    scope2: number;
    scope3: number;
    dominantScope: string;
    intensityPerTon: number;
  };
  provider: 'gemini' | 'openai' | 'fallback';
  generatedAt: string;
}

// ─── Rate Limiter (simple in-memory) ─────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;          // requests per window
const RATE_WINDOW_MS = 60_000;  // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── Alternatives Database Loader ────────────────────────────────────────────

async function loadAlternatives(): Promise<Record<string, any>> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'alternatives.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// ─── Carbon Credit Price Fetcher ─────────────────────────────────────────────

async function getMarketCarbonPrice(): Promise<number> {
  // Try fetching live price from a public API
  // Fallback to conservative estimate if API is unavailable
  try {
    // You can replace this with CBL Xpansiv, Verra, or Carbon Pulse API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      'https://api.carbonpricingdashboard.worldbank.org/latest',
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      // Extract average voluntary market price
      return data?.averagePrice ?? 12.50;
    }
  } catch {
    // Silently fall back
  }

  // Fallback: average voluntary carbon credit price (2024-2025 range)
  return 12.50; // USD per tonne CO2e
}

// ─── Build the AI Prompt ─────────────────────────────────────────────────────

function buildPrompt(
  materials: MaterialInput[],
  currentEmissions: number,
  scope1: number,
  scope2: number,
  scope3: number,
  productOutput: number,
  alternatives: Record<string, any>
): string {
  const materialsList = materials
    .map(m => `- ${m.name}: ${m.quantity} ${m.unit} (Process: ${m.process})`)
    .join('\n');

  const dominantScope = scope1 >= scope2 && scope1 >= scope3
    ? 'Scope 1 (Direct Emissions)'
    : scope2 >= scope1 && scope2 >= scope3
      ? 'Scope 2 (Energy/Grid)'
      : 'Scope 3 (Raw Materials)';

  const intensity = productOutput > 0
    ? (currentEmissions / 1000 / productOutput).toFixed(4)
    : 'N/A';

  // Include known alternatives as context
  const altContext = Object.keys(alternatives).length > 0
    ? `\n\nKNOWN ALTERNATIVES DATABASE:\n${JSON.stringify(alternatives, null, 2)}`
    : '';

  return `You are an environmental engineering expert specializing in industrial carbon emissions reduction, carbon credit markets, and sustainable manufacturing.

EMISSION REPORT:
================
Total Emissions: ${currentEmissions.toFixed(2)} kg CO2e (${(currentEmissions / 1000).toFixed(4)} tonnes)
Scope 1 (Direct): ${scope1.toFixed(2)} kg CO2e
Scope 2 (Energy): ${scope2.toFixed(2)} kg CO2e
Scope 3 (Materials): ${scope3.toFixed(2)} kg CO2e
Dominant Source: ${dominantScope}
Product Output: ${productOutput} tonnes
Carbon Intensity: ${intensity} tonnes CO2e per tonne of product

MATERIALS & PROCESSES:
${materialsList}
${altContext}

TASK:
Provide exactly 5 actionable emission reduction recommendations. For each, specify:
1. recommendation: Clear, specific action (max 100 chars)
2. targetScope: Which scope it addresses ("Scope 1", "Scope 2", or "Scope 3")
3. estimatedReduction: Realistic percentage reduction (0-100) for that scope
4. timelineMonths: Implementation timeline in months
5. costCategory: "low" (<$10k), "medium" ($10k-$100k), or "high" (>$100k)
6. implementation: Step-by-step implementation guide (2-3 sentences)
7. alternativeProduct: Specific alternative material/process/technology name
8. annualCO2Saved: Estimated annual CO2 saved in tonnes

Focus on:
- The dominant emission scope first
- Practical alternatives for the specific materials listed
- Industry-proven technologies and methods
- Quick wins (low cost, high impact) first

RESPOND WITH VALID JSON ONLY — no markdown, no code fences, no explanation outside the JSON.
Use this exact structure:
{
  "suggestions": [
    {
      "recommendation": "string",
      "targetScope": "Scope 1" | "Scope 2" | "Scope 3",
      "estimatedReduction": number,
      "timelineMonths": number,
      "costCategory": "low" | "medium" | "high",
      "implementation": "string",
      "alternativeProduct": "string",
      "annualCO2Saved": number
    }
  ]
}`;
}

// ─── Gemini Provider ─────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<AIEmissionSuggestion[] | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('[Gemini] No API key found - set GOOGLE_API_KEY environment variable');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return parsed.suggestions || parsed;
  } catch (error) {
    console.error('[AuraCarbon] Gemini call failed:', error);
    return null;
  }
}

// ─── OpenAI Fallback Provider ────────────────────────────────────────────────

async function callOpenAI(prompt: string): Promise<AIEmissionSuggestion[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an environmental engineering AI. Respond with valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    const parsed = JSON.parse(text);
    return parsed.suggestions || parsed;
  } catch (error) {
    console.error('[AuraCarbon] OpenAI call failed:', error);
    return null;
  }
}

// ─── Local Fallback Suggestions ──────────────────────────────────────────────

function generateFallbackSuggestions(
  materials: MaterialInput[],
  scope1: number,
  scope2: number,
  scope3: number,
  currentEmissions: number,
  alternatives: Record<string, any>
): AIEmissionSuggestion[] {
  const suggestions: AIEmissionSuggestion[] = [];
  const materialNames = materials.map(m => m.name.toLowerCase());

  // Material-specific suggestions from alternatives database
  for (const mat of materials) {
    const altKey = mat.name.toLowerCase();
    if (alternatives[altKey]) {
      const alt = alternatives[altKey];
      suggestions.push({
        recommendation: `Replace ${mat.name} with ${alt.alternative}`,
        targetScope: alt.scope || 'Scope 3',
        estimatedReduction: alt.reductionPercent || 20,
        timelineMonths: alt.timelineMonths || 6,
        costCategory: alt.costCategory || 'medium',
        implementation: alt.implementation || `Switch from ${mat.name} to ${alt.alternative}. Conduct pilot testing, then scale.`,
        alternativeProduct: alt.alternative,
        annualCO2Saved: (currentEmissions * (alt.reductionPercent || 20) / 100) / 1000,
      });
    }
  }

  // Generic scope-based suggestions if we need more
  if (scope1 > 0 && suggestions.length < 5) {
    suggestions.push({
      recommendation: 'Switch direct combustion fuels to natural gas or biomass',
      targetScope: 'Scope 1',
      estimatedReduction: 25,
      timelineMonths: 12,
      costCategory: 'medium',
      implementation: 'Audit current fuel usage. Replace coal/diesel burners with natural gas or biomass alternatives. Monitor emissions quarterly.',
      alternativeProduct: 'Biomass fuel / Natural gas',
      annualCO2Saved: (scope1 * 0.25) / 1000,
    });
  }

  if (scope2 > 0 && suggestions.length < 5) {
    suggestions.push({
      recommendation: 'Procure renewable energy or install on-site solar',
      targetScope: 'Scope 2',
      estimatedReduction: 40,
      timelineMonths: 18,
      costCategory: 'high',
      implementation: 'Sign a Power Purchase Agreement (PPA) for renewable energy. Alternatively, install rooftop solar panels to offset grid electricity consumption.',
      alternativeProduct: 'Solar PV / Wind PPA',
      annualCO2Saved: (scope2 * 0.40) / 1000,
    });
  }

  if (scope3 > 0 && suggestions.length < 5) {
    suggestions.push({
      recommendation: 'Source low-carbon raw materials from certified suppliers',
      targetScope: 'Scope 3',
      estimatedReduction: 15,
      timelineMonths: 6,
      costCategory: 'low',
      implementation: 'Identify suppliers with verified Environmental Product Declarations (EPDs). Prioritize recycled or low-carbon alternatives for top 3 materials by emission volume.',
      alternativeProduct: 'Recycled / EPD-certified materials',
      annualCO2Saved: (scope3 * 0.15) / 1000,
    });
  }

  // Always add energy efficiency
  if (suggestions.length < 5) {
    suggestions.push({
      recommendation: 'Implement energy efficiency audit and optimization program',
      targetScope: 'Scope 2',
      estimatedReduction: 15,
      timelineMonths: 3,
      costCategory: 'low',
      implementation: 'Conduct a comprehensive energy audit. Install VFDs on motors, upgrade to LED lighting, optimize HVAC schedules. Expected payback: 12-18 months.',
      alternativeProduct: 'VFDs, LED lighting, smart HVAC controls',
      annualCO2Saved: (currentEmissions * 0.05) / 1000,
    });
  }

  // Process optimization
  if (suggestions.length < 5) {
    suggestions.push({
      recommendation: 'Optimize production scheduling to reduce idle energy waste',
      targetScope: 'Scope 1',
      estimatedReduction: 10,
      timelineMonths: 2,
      costCategory: 'low',
      implementation: 'Analyze production schedules for idle time. Consolidate batch runs to minimize furnace/kiln restarts. Implement real-time energy monitoring dashboards.',
      alternativeProduct: 'Production scheduling software',
      annualCO2Saved: (currentEmissions * 0.03) / 1000,
    });
  }

  return suggestions.slice(0, 5);
}

// ─── Main POST Handler ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait 60 seconds.' },
      { status: 429 }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const {
      materials = [],
      processes = [],
      currentEmissions,
      scope1 = 0,
      scope2 = 0,
      scope3 = 0,
      productOutput = 1,
    } = body;

    // ── Validation ──────────────────────────────────────────────────────

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return NextResponse.json(
        { error: 'Materials list is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (typeof currentEmissions !== 'number' || currentEmissions < 0) {
      return NextResponse.json(
        { error: 'Valid current emissions value is required (number >= 0)' },
        { status: 400 }
      );
    }

    // Normalize materials input
    // Support both string[] and MaterialInput[] formats
    const normalizedMaterials: MaterialInput[] = materials.map(
      (m: string | MaterialInput, i: number) => {
        if (typeof m === 'string') {
          return {
            name: m,
            quantity: 0,
            unit: 'kg',
            process: processes[i] || 'Unknown',
          };
        }
        return m;
      }
    );

    // ── Load alternatives database ──────────────────────────────────────

    const alternatives = await loadAlternatives();

    // ── Build prompt ────────────────────────────────────────────────────

    const prompt = buildPrompt(
      normalizedMaterials,
      currentEmissions,
      scope1,
      scope2,
      scope3,
      productOutput,
      alternatives
    );

    // ── Call LLM providers (cascade: Gemini → OpenAI → Fallback) ────────

    let suggestions: AIEmissionSuggestion[] | null = null;
    let provider: 'gemini' | 'openai' | 'fallback' = 'fallback';

    // Try Gemini first (your existing provider)
    suggestions = await callGemini(prompt);
    if (suggestions && suggestions.length > 0) {
      provider = 'gemini';
    }

    // Fallback to OpenAI if Gemini fails
    if (!suggestions || suggestions.length === 0) {
      suggestions = await callOpenAI(prompt);
      if (suggestions && suggestions.length > 0) {
        provider = 'openai';
      }
    }

    // Final fallback: local alternatives database
    if (!suggestions || suggestions.length === 0) {
      suggestions = generateFallbackSuggestions(
        normalizedMaterials,
        scope1,
        scope2,
        scope3,
        currentEmissions,
        alternatives
      );
      provider = 'fallback';
    }

    // ── Validate and sanitize suggestions ───────────────────────────────

    const validatedSuggestions = suggestions.slice(0, 5).map(s => ({
      recommendation: String(s.recommendation || '').slice(0, 200),
      targetScope: (['Scope 1', 'Scope 2', 'Scope 3'].includes(s.targetScope)
        ? s.targetScope
        : 'Scope 1') as 'Scope 1' | 'Scope 2' | 'Scope 3',
      estimatedReduction: Math.min(100, Math.max(0, Number(s.estimatedReduction) || 0)),
      timelineMonths: Math.max(1, Math.min(60, Number(s.timelineMonths) || 6)),
      costCategory: (['low', 'medium', 'high'].includes(s.costCategory)
        ? s.costCategory
        : 'medium') as 'low' | 'medium' | 'high',
      implementation: String(s.implementation || '').slice(0, 500),
      alternativeProduct: String(s.alternativeProduct || 'N/A').slice(0, 100),
      annualCO2Saved: Math.max(0, Number(s.annualCO2Saved) || 0),
    }));

    // ── Calculate carbon credit projections ─────────────────────────────

    const totalAnnualReduction = validatedSuggestions.reduce(
      (sum, s) => sum + (s.annualCO2Saved || 0),
      0
    );

    const marketPrice = await getMarketCarbonPrice();

    const carbonCredits: CarbonCreditProjection = {
      annualReductionTonnes: Math.round(totalAnnualReduction * 100) / 100,
      revenueAt10: Math.round(totalAnnualReduction * 10 * 100) / 100,
      revenueAt30: Math.round(totalAnnualReduction * 30 * 100) / 100,
      revenueAt50: Math.round(totalAnnualReduction * 50 * 100) / 100,
      revenueAtMarket: Math.round(totalAnnualReduction * marketPrice * 100) / 100,
      marketPriceUsed: marketPrice,
      currency: 'USD',
    };

    // ── Build emission summary ──────────────────────────────────────────

    const dominantScope = scope1 >= scope2 && scope1 >= scope3
      ? 'Scope 1'
      : scope2 >= scope1 && scope2 >= scope3
        ? 'Scope 2'
        : 'Scope 3';

    const emissionSummary = {
      totalKgCO2e: Math.round(currentEmissions * 100) / 100,
      totalTonnesCO2e: Math.round((currentEmissions / 1000) * 10000) / 10000,
      scope1: Math.round(scope1 * 100) / 100,
      scope2: Math.round(scope2 * 100) / 100,
      scope3: Math.round(scope3 * 100) / 100,
      dominantScope,
      intensityPerTon: productOutput > 0
        ? Math.round((currentEmissions / 1000 / productOutput) * 10000) / 10000
        : 0,
    };

    // ── Return response ─────────────────────────────────────────────────

    const response: SuggestionsResponse = {
      success: true,
      suggestions: validatedSuggestions,
      carbonCredits,
      emissionSummary,
      provider,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[AuraCarbon] AI suggestions error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to generate suggestions';

    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}
