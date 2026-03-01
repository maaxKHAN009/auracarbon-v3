/**
 * API endpoint for AI-powered emission reduction suggestions
 * Uses Google Generative AI (Gemini) for analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const {
      materials,
      processes,
      currentEmissions,
      scope1,
      scope2,
      scope3,
      productOutput,
    } = await request.json();

    // Validate inputs
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return Response.json(
        { error: 'Materials list is required' },
        { status: 400 }
      );
    }

    if (typeof currentEmissions !== 'number' || currentEmissions < 0) {
      return Response.json(
        { error: 'Valid current emissions value is required' },
        { status: 400 }
      );
    }

    // Build AI prompt
    const prompt = `You are an environmental engineering expert specializing in carbon emissions reduction. 
    
A facility has the following emission profile:
- Current Total Emissions: ${currentEmissions.toFixed(2)} tCO2e/year
- Scope 1 (Direct): ${scope1.toFixed(2)} tCO2e/year
- Scope 2 (Electricity): ${scope2.toFixed(2)} tCO2e/year  
- Scope 3 (Supply Chain): ${scope3.toFixed(2)} tCO2e/year
- Production Output: ${productOutput} tons/year
- Materials Used: ${materials.join(', ')}
- Processes: ${processes.join(', ')}

Provide exactly 3-5 specific, actionable emission reduction recommendations. For each recommendation, format as JSON with this exact structure:
{
  "recommendation": "Brief title of the recommendation",
  "targetScope": "Scope 1" or "Scope 2" or "Scope 3",
  "estimatedReduction": percentage reduction (0-100),
  "timelineMonths": months to implement (6-36),
  "costCategory": "low" or "medium" or "high",
  "implementation": "Specific implementation details and steps"
}

Return ONLY a valid JSON array with no additional text, markdown, or code blocks.`;

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse AI response - try to extract JSON
    let suggestions;
    try {
      // Try direct JSON parse first
      suggestions = JSON.parse(responseText);
    } catch {
      // If that fails, extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Return fallback suggestions
        console.warn('Could not parse AI response');
        suggestions = getFallbackSuggestions(scope1, scope2, scope3);
      }
    }

    // Validate suggestions format
    if (!Array.isArray(suggestions)) {
      suggestions = [suggestions];
    }

    // Ensure all suggestions have required fields
    suggestions = suggestions.map((s: any) => ({
      recommendation: s.recommendation || 'Recommendation',
      targetScope: s.targetScope || 'Scope 1',
      estimatedReduction: Math.min(99, Math.max(0, s.estimatedReduction || 20)),
      timelineMonths: s.timelineMonths || 12,
      costCategory: s.costCategory || 'medium',
      implementation: s.implementation || 'Implement this recommendation',
    }));

    return Response.json({
      suggestions,
      generated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI suggestion error:', error);

    // Return fallback response with error
    return Response.json(
      {
        suggestions: getFallbackSuggestions(0, 0, 0),
        error: 'Using fallback suggestions',
        generatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

/**
 * Fallback suggestions when Gemini API fails
 */
function getFallbackSuggestions(
  scope1: number,
  scope2: number,
  scope3: number
) {
  const suggestions = [];

  if (scope1 > 0) {
    suggestions.push({
      recommendation: 'Transition to renewable fuel sources',
      targetScope: 'Scope 1',
      estimatedReduction: 55,
      timelineMonths: 12,
      costCategory: 'high',
      implementation:
        'Replace fossil fuels with biomass, biogas, or electric heating systems.',
    });
  }

  if (scope2 > 0) {
    suggestions.push({
      recommendation: 'Install on-site renewable energy generation',
      targetScope: 'Scope 2',
      estimatedReduction: 80,
      timelineMonths: 18,
      costCategory: 'high',
      implementation:
        'Deploy solar panels, wind turbines, or enter renewable power purchase agreements (PPAs).',
    });
  }

  if (scope3 > 0) {
    suggestions.push({
      recommendation: 'Implement sustainable sourcing practices',
      targetScope: 'Scope 3',
      estimatedReduction: 40,
      timelineMonths: 6,
      costCategory: 'low',
      implementation:
        'Audit suppliers, enforce carbon reduction targets, prioritize local sourcing.',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      recommendation: 'Conduct comprehensive carbon audit',
      targetScope: 'Scope 1',
      estimatedReduction: 15,
      timelineMonths: 3,
      costCategory: 'low',
      implementation:
        'Identify emission hotspots and prioritize reduction opportunities across all scopes.',
    });
  }

  return suggestions.slice(0, 4);
}
