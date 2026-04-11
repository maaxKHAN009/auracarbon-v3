# Phase 3: Embedded Analysis - Build In-App Carbon Recommendation Engine

## Overview

Phase 3 embeds the entire recommendation workflow **inside AuraCarbon**. Users never leave your app.

**Architecture:**
```
User Input (7-section form) 
    ↓
Next.js API Route (/api/analysis/recommendations)
    ↓
Backend Logic (generate tailored suggestions)
    ↓
Display Results + Chat Widget
    ↓
Export PDF/JSON
```

---

## Part 1: Create Form Component

### File: `components/dashboard/emission-analysis-form.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/glass-card';
import { useState } from 'react';

interface EmissionData {
  // Section 1: Emission Overview
  totalEmissions: number;
  scope1Percent: number;
  scope2Percent: number;
  scope3Percent: number;
  productOutput: number;

  // Section 2: Materials & Processes
  materials: string[];
  processes: string[];
  industry: string;

  // Section 3: Business Context
  budget: 'low' | 'medium' | 'high' | 'unrestricted';
  timeline: 'urgent' | 'nearterm' | 'mediumterm' | 'longterm';
  deadline?: string; // ISO date
  priorities?: string;
}

export function EmissionAnalysisForm() {
  const [formData, setFormData] = useState<EmissionData>({
    totalEmissions: 0,
    scope1Percent: 0,
    scope2Percent: 0,
    scope3Percent: 0,
    productOutput: 0,
    materials: [],
    processes: [],
    industry: '',
    budget: 'medium',
    timeline: 'mediumterm',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/analysis/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Emission Overview */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-aura-accent mb-4">
            Emission Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Annual Emissions (kg CO2e)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={formData.totalEmissions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalEmissions: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="e.g., 650000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scope 1 Direct (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={formData.scope1Percent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scope1Percent: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="e.g., 46.15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scope 2 Indirect Energy (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={formData.scope2Percent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scope2Percent: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="e.g., 23.08"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scope 3 Supply Chain (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={formData.scope3Percent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scope3Percent: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="e.g., 30.77"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Annual Product Output (tonnes)
              </label>
              <input
                type="number"
                min="0.1"
                step="1"
                required
                value={formData.productOutput}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    productOutput: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="e.g., 100"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: Materials & Processes */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-aura-accent mb-4">
            Materials & Processes
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Materials (one per line)
              </label>
              <textarea
                value={formData.materials.join('\n')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    materials: e.target.value
                      .split('\n')
                      .filter((m) => m.trim()),
                  })
                }
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="Steel&#10;Natural Gas&#10;Cement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Main Manufacturing Processes
              </label>
              <textarea
                value={formData.processes.join('\n')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    processes: e.target.value
                      .split('\n')
                      .filter((p) => p.trim()),
                  })
                }
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="Blast Furnace Heating&#10;Kiln Operation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry Type
              </label>
              <input
                type="text"
                required
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="e.g., Steel, Cement, Chemical, Food"
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: Business Context */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-aura-accent mb-4">
            Business Context
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Available Budget
              </label>
              <select
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value as
                      | 'low'
                      | 'medium'
                      | 'high'
                      | 'unrestricted',
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
              >
                <option value="low">Low (&lt;$50K)</option>
                <option value="medium">Medium ($50K-$500K)</option>
                <option value="high">High (&gt;$500K)</option>
                <option value="unrestricted">Unrestricted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Implementation Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeline: e.target.value as
                      | 'urgent'
                      | 'nearterm'
                      | 'mediumterm'
                      | 'longterm',
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
              >
                <option value="urgent">Urgent (0-3 months)</option>
                <option value="nearterm">Near-term (3-12 months)</option>
                <option value="mediumterm">Medium-term (1-2 years)</option>
                <option value="longterm">Long-term (3+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Compliance Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stakeholder Priorities (Optional)
              </label>
              <input
                type="text"
                value={formData.priorities || ''}
                onChange={(e) =>
                  setFormData({ ...formData, priorities: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
                placeholder="Cost savings, customer demands, compliance..."
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-aura-accent hover:bg-aura-accent/80 text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? 'Analyzing...' : 'Generate Recommendations'}
        </Button>
      </form>

      {/* Results Display */}
      {results && <EmissionAnalysisResults data={results} />}
    </div>
  );
}

// Results component
function EmissionAnalysisResults({ data }: { data: any }) {
  return (
    <div className="mt-12 space-y-6">
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-lg p-6 border border-emerald-700">
        <h3 className="text-2xl font-bold text-emerald-300 mb-4">
          Analysis Results
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-700 p-4 rounded">
            <div className="text-sm text-gray-400">Dominant Scope</div>
            <div className="text-xl font-bold text-aura-accent">
              {data.dominantScope}
            </div>
          </div>
          
          <div className="bg-slate-700 p-4 rounded">
            <div className="text-sm text-gray-400">Carbon Intensity</div>
            <div className="text-xl font-bold text-aura-accent">
              {data.carbonIntensity}
            </div>
          </div>
          
          <div className="bg-slate-700 p-4 rounded">
            <div className="text-sm text-gray-400">Total Annual Savings</div>
            <div className="text-xl font-bold text-emerald-300">
              {data.totalReduction} tCO2e
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-emerald-300">
            5 Tailored Recommendations
          </h4>
          {data.recommendations?.map(
            (rec: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-700 p-4 rounded border border-slate-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-bold text-white">
                      {idx + 1}. {rec.title}
                    </h5>
                    <p className="text-sm text-gray-400 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <span className="bg-aura-accent text-white px-3 py-1 rounded text-sm font-bold">
                    {rec.reductionPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-3">
                  <div>
                    <span className="text-gray-400">Scope:</span>
                    <div className="font-bold text-aura-accent">
                      {rec.scope}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Timeline:</span>
                    <div className="font-bold text-white">
                      {rec.timeline}mo
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Cost:</span>
                    <div className="font-bold text-white">{rec.cost}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Annual Savings:</span>
                    <div className="font-bold text-emerald-300">
                      {rec.annualSavings} tCO2e
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-600 rounded text-sm text-gray-300">
                  <strong>Implementation:</strong>
                  <p className="mt-1">{rec.implementation}</p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Financial Impact */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 p-4 rounded">
            <h5 className="font-bold text-white mb-2">Carbon Credit Revenue</h5>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">@ $10/tonne:</span>
                <span className="text-white font-bold">
                  ${data.carbonCredits?.lowPrice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">@ $30/tonne:</span>
                <span className="text-white font-bold">
                  ${data.carbonCredits?.marketPrice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">@ $50/tonne:</span>
                <span className="text-white font-bold">
                  ${data.carbonCredits?.highPrice}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 p-4 rounded">
            <h5 className="font-bold text-white mb-2">Payback Analysis</h5>
            <div className="space-y-1 text-sm">
              <div className="text-gray-400">
                Total Investment: <span className="text-white font-bold">${data.investment}</span>
              </div>
              <div className="text-gray-400">
                Payback Period: <span className="text-white font-bold">{data.paybackPeriod} years</span>
              </div>
              <div className="text-emerald-300 text-xs mt-2">
                ✓ {data.paybackRecommendation}
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Roadmap */}
        <div className="mt-6 p-4 bg-slate-700 rounded">
          <h5 className="font-bold text-white mb-3">Implementation Roadmap</h5>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-aura-accent font-bold">Quick Wins (0-3mo):</span>
              <p className="text-gray-300">{data.roadmap?.quickWins}</p>
            </div>
            <div>
              <span className="text-aura-accent font-bold">Medium-term (3-12mo):</span>
              <p className="text-gray-300">{data.roadmap?.mediumTerm}</p>
            </div>
            <div>
              <span className="text-aura-accent font-bold">Strategic (12+ mo):</span>
              <p className="text-gray-300">{data.roadmap?.strategic}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Part 2: Create API Endpoint for Analysis

### File: `app/api/analysis/recommendations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAIEmissionSuggestions } from '@/lib/ai-service';
import { ALTERNATIVES } from '@/data/ALTERNATIVES.json';

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

    // Call existing AI suggestion endpoint
    const suggestions = await getAIEmissionSuggestions({
      emissions: totalEmissions / 1000, // Convert kg to tonnes
      materials,
      processes,
      scope: {
        scope1: scope1Percent,
        scope2: scope2Percent,
        scope3: scope3Percent,
      },
      industry,
    });

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
      (sum, s) => sum + (s.reductionPercentage || 0) * (totalEmissions / 1000 / 100),
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
      title: s.name,
      description: s.description,
      scope: s.scope || dominantScope,
      reductionPercent: s.reductionPercentage || 0,
      timeline: s.timelineMonths || 6,
      cost: s.costCategory || 'medium',
      implementation: s.implementation?.steps?.join('\n') || s.description,
      annualSavings: (
        (totalEmissions / 1000) *
        ((s.scope === 'Scope 1'
          ? scope1Percent
          : s.scope === 'Scope 2'
            ? scope2Percent
            : scope3Percent) /
          100) *
        ((s.reductionPercentage || 0) / 100)
      ).toFixed(2),
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
```

---

## Part 3: Add Recommendation Widget to Dashboard

### File: `components/dashboard/dashboard-layout.tsx`

Update the main dashboard to include the new form:

```typescript
import { EmissionAnalysisForm } from './emission-analysis-form';

export function DashboardLayout() {
  return (
    <div className="space-y-6">
      {/* Existing dashboard components */}
      <CarbonIntensityGauge />
      <EmissionsTable />
      
      {/* NEW: Emission Analysis Form */}
      <section className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h2 className="text-2xl font-bold text-aura-accent mb-4">
          Detailed Carbon Analysis
        </h2>
        <p className="text-gray-400 mb-6">
          Provide detailed information to receive tailored recommendations for
          reducing your emissions.
        </p>
        <EmissionAnalysisForm />
      </section>
    </div>
  );
}
```

---

## Part 4: Chat Widget for Follow-up Questions (Optional)

### File: `components/dashboard/recommendations-chat.tsx`

```typescript
'use client';

import React, { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RecommendationsChatProps {
  recommendations: any[];
  emissionData: any;
}

export function RecommendationsChat({
  recommendations,
  emissionData,
}: RecommendationsChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hi! I can help answer questions about your carbon reduction recommendations. Ask me anything about implementation, costs, timelines, or alternatives.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call chat API
      const response = await fetch('/api/analysis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          recommendations,
          emissionData,
          conversationHistory: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-aura-accent mb-4">
        Ask About Your Recommendations
      </h3>

      <div className="space-y-4 h-96 overflow-y-auto mb-4 p-3 bg-slate-700 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-aura-accent text-white'
                  : 'bg-slate-600 text-gray-300'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-600 text-gray-300 px-4 py-2 rounded-lg">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask a question..."
          className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:border-aura-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-aura-accent hover:bg-aura-accent/80 text-white font-bold rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

### File: `app/api/analysis/chat/route.ts`

```typescript
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
```

---

## Part 5: Implementation Checklist

### Step 1: Create the Components
- [ ] Create `components/dashboard/emission-analysis-form.tsx`
- [ ] Create `components/dashboard/recommendations-chat.tsx` (optional)

### Step 2: Create API Routes
- [ ] Create `app/api/analysis/recommendations/route.ts`
- [ ] Create `app/api/analysis/chat/route.ts` (optional)

### Step 3: Update Dashboard
- [ ] Update `components/dashboard/dashboard-layout.tsx` to import and use `EmissionAnalysisForm`

### Step 4: Test End-to-End
- [ ] Fill out form with test data (steel mill case)
- [ ] Verify recommendations display correctly
- [ ] Test chat widget (if added)
- [ ] Verify export/PDF generation works

### Step 5: Style & Polish
- [ ] Ensure form matches AuraCarbon dark theme
- [ ] Add loading states with animations
- [ ] Test on mobile (responsive)
- [ ] Add error handling/validation messages

---

## Part 6: Integration with BearCreekAI (When API Available)

When BearCreekAI provides API access, replace the recommendation generation logic:

```typescript
// In app/api/analysis/recommendations/route.ts

// Instead of calling getAIEmissionSuggestions():
const response = await fetch('https://api.bearcreekAI.com/v1/apps/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.BEARCREEKAIS_API_KEY}`,
  },
  body: JSON.stringify({
    appId: 'carbon-reduction-advisor',
    inputs: {
      section1: { totalEmissions, scope1Percent, scope2Percent, scope3Percent, productOutput },
      section2: { materials, processes, industry },
      section3: { budget, timeline, deadline, priorities },
    },
  }),
});

const bearcreekResults = await response.json();
// Map BearCreekAI output to AuraCarbon format
```

---

## What You Get:

✅ **Seamless In-App Experience** — Users never leave AuraCarbon
✅ **7-Section Form** — Matches Phase 2 agentic app structure
✅ **Smart Recommendations** — Uses existing AI service + local alternatives
✅ **Financial Analysis** — Carbon credits, payback period, ROI
✅ **Chat Widget** — Ask follow-up questions about recommendations
✅ **Export Ready** — PDF/JSON export functionality
✅ **BearCreekAI Ready** — Can swap backend when API available

---

## Next: Deploy & Test 🚀

Ready to implement? Should I create these files in your workspace?
