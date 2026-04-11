import { NextRequest, NextResponse } from 'next/server';
import { getAIEmissionSuggestions } from '@/lib/ai-service';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call existing AI suggestion endpoint with correct parameters
    const suggestions = await getAIEmissionSuggestions(
      materials,
      processes,
      totalEmissions / 1000, // Convert kg to tonnes
      scope1Percent,
      scope2Percent,
      scope3Percent,
      productOutput
    );

    // Determine dominant scope
    const scopes = [
      { name: 'Scope 1 (Direct Combustion)', value: scope1Percent },
      { name: 'Scope 2 (Purchased Electricity/Steam)', value: scope2Percent },
      { name: 'Scope 3 (Supply Chain)', value: scope3Percent },
    ];
    const dominantScope = scopes.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    ).name;

    // Calculate carbon intensity
    const carbonIntensity = (
      totalEmissions / 1000 /
      productOutput
    ).toFixed(2);

    // Calculate total reduction (sum of suggestions)
    const totalReduction = suggestions.reduce(
      (sum, s) => sum + (s.estimatedReduction || 0) * (totalEmissions / 1000 / 100),
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
    const paybackPeriod = (
      investmentEstimate /
      (annualCarbonRevenue + 50000)
    ).toFixed(1); // Assume $50K/year operational savings

    // Format recommendations for display
    const formattedRecommendations = suggestions.map((s, idx) => ({
      title: s.recommendation,
      description: s.implementation,
      scope: s.targetScope || dominantScope,
      reductionPercent: s.estimatedReduction || 0,
      timeline: s.timelineMonths || 6,
      cost: s.costCategory || 'medium',
      implementation: s.implementation || s.recommendation,
      annualSavings: (s.annualCO2Saved || (
        (totalEmissions / 1000) *
        ((s.targetScope === 'Scope 1'
          ? scope1Percent
          : s.targetScope === 'Scope 2'
            ? scope2Percent
            : scope3Percent) /
          100) *
        ((s.estimatedReduction || 0) / 100)
      )).toFixed(2),
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
          .join(', '),
        mediumTerm: formattedRecommendations
          .filter((r) => r.timeline > 3 && r.timeline <= 12)
          .map((r) => r.title)
          .join(', '),
        strategic: formattedRecommendations
          .filter((r) => r.timeline > 12)
          .map((r) => r.title)
          .join(', '),
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}