import { NextRequest, NextResponse } from 'next/server';
import { getAIEmissionSuggestions } from '@/lib/ai-service';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Analysis] Received request:', { totalEmissions: body.totalEmissions, industry: body.industry });

    const {
      totalEmissions,
      scope1Percent,
      scope2Percent,
      scope3Percent,
      productOutput,
      materials,
      processes,
      industry,
      budget,
      timeline,
      deadline,
      priorities,
    } = body;

    // Validate inputs
    if (!totalEmissions || !productOutput || !industry) {
      console.error('[Analysis] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call existing AI suggestion endpoint with correct parameters
    console.log('[Analysis] Calling AI service...');
    const suggestions = await getAIEmissionSuggestions(
      materials,
      processes,
      totalEmissions / 1000, // Convert kg to tonnes
      scope1Percent,
      scope2Percent,
      scope3Percent,
      productOutput
    );

    // Determine dominant scope early
    const scopes = [
      { name: 'Scope 1 (Direct Combustion)', value: scope1Percent },
      { name: 'Scope 2 (Purchased Electricity/Steam)', value: scope2Percent },
      { name: 'Scope 3 (Supply Chain)', value: scope3Percent },
    ];
    const dominantScope = scopes.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    ).name;

    console.log('[Analysis] Received suggestions:', suggestions.length, 'items');

    if (!suggestions || suggestions.length === 0) {
      console.warn('[Analysis] No suggestions returned, generating fallbacks');
      // Generate fallback suggestions for better UX
      const fallbackSuggestions = [
        {
          recommendation: 'Switch to renewable energy sources',
          targetScope: 'Scope 2' as const,
          estimatedReduction: 50,
          timelineMonths: 12,
          costCategory: 'medium' as const,
          implementation: 'Implement solar/wind energy systems or purchase renewable energy credits',
          alternativeProduct: 'Renewable Energy',
          annualCO2Saved: (totalEmissions / 1000) * (scope2Percent / 100) * 0.5,
        },
        {
          recommendation: 'Optimize production processes',
          targetScope: 'Scope 1' as const,
          estimatedReduction: 30,
          timelineMonths: 6,
          costCategory: 'low' as const,
          implementation: 'Audit processes, upgrade equipment, implement lean manufacturing',
          alternativeProduct: 'Process Optimization',
          annualCO2Saved: (totalEmissions / 1000) * (scope1Percent / 100) * 0.3,
        },
        {
          recommendation: 'Source from low-carbon suppliers',
          targetScope: 'Scope 3' as const,
          estimatedReduction: 40,
          timelineMonths: 9,
          costCategory: 'medium' as const,
          implementation: 'Audit supply chain, engage suppliers, implement sustainability requirements',
          alternativeProduct: 'Sustainable Supply Chain',
          annualCO2Saved: (totalEmissions / 1000) * (scope3Percent / 100) * 0.4,
        },
        {
          recommendation: 'Implement energy efficiency measures',
          targetScope: 'Scope 2' as const,
          estimatedReduction: 25,
          timelineMonths: 3,
          costCategory: 'low' as const,
          implementation: 'LED lighting, insulation, HVAC optimization, equipment upgrades',
          alternativeProduct: 'Energy Efficiency',
          annualCO2Saved: (totalEmissions / 1000) * (scope2Percent / 100) * 0.25,
        },
        {
          recommendation: 'Use alternative low-carbon materials',
          targetScope: 'Scope 3' as const,
          estimatedReduction: 35,
          timelineMonths: 12,
          costCategory: 'high' as const,
          implementation: 'Research and pilot low-carbon alternatives, transition supply chain',
          alternativeProduct: 'Low-Carbon Materials',
          annualCO2Saved: (totalEmissions / 1000) * (scope3Percent / 100) * 0.35,
        },
      ];
      
      return formatAndReturnResults(fallbackSuggestions, totalEmissions, scope1Percent, scope2Percent, scope3Percent, productOutput, dominantScope);
    }

    return formatAndReturnResults(suggestions, totalEmissions, scope1Percent, scope2Percent, scope3Percent, productOutput, dominantScope);
  } catch (error) {
    console.error('[Analysis] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to format and return results
function formatAndReturnResults(
  suggestions: any[],
  totalEmissions: number,
  scope1Percent: number,
  scope2Percent: number,
  scope3Percent: number,
  productOutput: number,
  dominantScope: string
) {
  // Calculate carbon intensity
  const carbonIntensity = (
    totalEmissions / 1000 /
    productOutput
  ).toFixed(2);

  // Calculate total reduction (sum of suggestions)
  const totalReduction = suggestions.reduce(
    (sum, s) => sum + (s.annualCO2Saved || 0),
    0
  );

  // Calculate carbon credits
  const lowPrice = totalReduction * 10;
  const marketPrice = totalReduction * 30;
  const highPrice = totalReduction * 50;

  // Estimate investment (based on cost categories)
  const investmentEstimate = suggestions.reduce((sum, s) => {
    const costMap: any = {
      low: 25000,
      medium: 150000,
      high: 300000,
    };
    return sum + (costMap[s.costCategory] || 100000);
  }, 0);

  // Calculate payback period (years)
  const annualCarbonRevenue = marketPrice;
  const paybackPeriod = investmentEstimate > 0
    ? (investmentEstimate / (annualCarbonRevenue + 50000)).toFixed(1)
    : '0';

  // Format recommendations for display
  const formattedRecommendations = suggestions.map((s) => ({
    title: s.recommendation,
    description: s.implementation,
    scope: s.targetScope || dominantScope,
    reductionPercent: s.estimatedReduction || 0,
    timeline: s.timelineMonths || 6,
    cost: s.costCategory || 'medium',
    implementation: s.implementation || s.recommendation,
    annualSavings: (s.annualCO2Saved || 0).toFixed(2),
  }));

  return NextResponse.json({
    dominantScope,
    carbonIntensity: `${carbonIntensity} kg CO2e per tonne`,
    totalReduction: totalReduction.toFixed(2),
    recommendations: formattedRecommendations.slice(0, 5),
    carbonCredits: {
      lowPrice: lowPrice.toFixed(0),
      marketPrice: marketPrice.toFixed(0),
      highPrice: highPrice.toFixed(0),
    },
    investment: investmentEstimate.toFixed(0),
    paybackPeriod,
    paybackRecommendation: `Implement quick wins first (payback <1 year) to fund strategic investments.`,
    roadmap: {
      quickWins: formattedRecommendations
        .filter((r) => r.timeline <= 3 && r.cost === 'low')
        .map((r) => r.title)
        .join(', ') || 'Energy efficiency measures, process optimization',
      mediumTerm: formattedRecommendations
        .filter((r) => r.timeline > 3 && r.timeline <= 12)
        .map((r) => r.title)
        .join(', ') || 'Supplier engagement, renewable energy integration',
      strategic: formattedRecommendations
        .filter((r) => r.timeline > 12)
        .map((r) => r.title)
        .join(', ') || 'Material substitution, facility transformation',
    },
  });
}