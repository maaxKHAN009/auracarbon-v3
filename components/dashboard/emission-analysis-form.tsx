'use client';

import React, { useState } from 'react';

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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-aura-accent hover:bg-aura-accent/80 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? 'Analyzing...' : 'Generate Recommendations'}
        </button>
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