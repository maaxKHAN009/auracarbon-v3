import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, recommendations, emissionData } = body;

    // Build context from recommendations
    const context = `
You are an expert environmental engineer helping analyze carbon reduction recommendations.

Current Recommendations:
${recommendations.map((r: any, i: number) => `${i + 1}. ${r.title} - ${r.reductionPercent}% reduction in ${r.scope}`).join('\n')}

User Question: ${message}

Provide a helpful, specific answer based on the recommendations. Keep it under 2 sentences.
    `;

    // Call Gemini API (existing logic from ai-service)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: context }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      // Fallback response
      return NextResponse.json({
        response: `That's a great question! Based on your recommendations, I'd suggest reviewing the implementation timeline and cost estimates to determine the best approach for your facility.`,
      });
    }

    const data = await response.json();
    const assistantResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I can help with that. Could you ask more specifically?';

    return NextResponse.json({ response: assistantResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { response: 'Sorry, I encountered an error. Please try again.' },
      { status: 500 }
    );
  }
}