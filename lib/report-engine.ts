import alternativesData from '@/data/alternatives.json';
import { calculateCBAMScore, calculateTotalEmissions } from '@/lib/carbon-engine';
import { FactorsData, RecipeRow } from '@/lib/store';

export interface ReportEngineInput {
  country: string;
  totalProductOutput: number;
  rows: RecipeRow[];
  factors: FactorsData;
}

export interface GeneratedContextReport {
  markdown: string;
  plainText: string;
  timestampIso: string;
  metadata: {
    appVersion: string;
    generatedAtIso: string;
    decisionTag: string;
    disclaimer: string;
    country: string;
    totalProductOutput: number;
  };
  rows: Array<{
    index: number;
    materialOrFuel: string;
    process: string;
    quantityWithUnit: string;
    estimatedEmissionsKg: number;
  }>;
  metrics: {
    totalKg: number;
    totalTonnes: number;
    scope1Kg: number;
    scope2Kg: number;
    scope3Kg: number;
    carbonIntensity: number;
    cbamRisk: 'Low' | 'Medium' | 'High';
  };
  recommendations: Array<{
    category: string;
    title: string;
    alternative: string;
    reductionPercent: number;
    implementation: string;
    limitations: string;
    sourceTitle: string;
    sourceUrl: string;
  }>;
  citations: Array<{
    sourceTitle: string;
    sourceUrl: string;
  }>;
}

interface AlternativeRecord {
  category: string;
  title: string;
  alternative: string;
  reductionPercent: number;
  sourceUrl: string;
  sourceTitle: string;
  implementation: string;
  limitations: string;
}

const APP_VERSION = 'AuraCarbon v3';
const DECISION_TAG = 'Decision-Support Artifact';
const RESPONSIBLE_AI_DISCLAIMER =
  'Advisory only. Requires human verification by a professional engineer. Calculated using 2026 EU CBAM default values and E4C Solutions Library data.';

function toTonnes(kg: number): number {
  return kg / 1000;
}

function calculateRowEmissions(row: RecipeRow, factors: FactorsData, country: string): number {
  if (!row.materialOrFuel || row.quantity <= 0) return 0;

  let emissionFactor = 0;

  if (row.process === 'Direct Burning' || row.process === 'Chemical Calcination') {
    emissionFactor = factors.fuels[row.materialOrFuel] || factors.materials[row.materialOrFuel] || 0;
  } else if (row.process === 'Electrical Grinding') {
    emissionFactor = factors.grids[country] || 0;
  } else {
    emissionFactor = factors.materials[row.materialOrFuel] || 0;
  }

  const quantityInBase = row.unit === 'Tons' ? row.quantity * 1000 : row.quantity;
  return Math.max(0, quantityInBase * emissionFactor);
}

function selectRelevantAlternatives(rows: RecipeRow[]): AlternativeRecord[] {
  const records = Object.values(alternativesData) as AlternativeRecord[];
  const keywords = rows
    .map((row) => row.materialOrFuel.trim().toLowerCase())
    .filter(Boolean);

  if (keywords.length === 0) {
    return records;
  }

  const matched = records.filter((record) => {
    const haystack = `${record.title} ${record.alternative} ${record.category}`.toLowerCase();
    return keywords.some((kw) => haystack.includes(kw));
  });

  return matched.length > 0 ? matched : records;
}

export function buildIndustrialCarbonContextReport(input: ReportEngineInput): GeneratedContextReport {
  const timestampIso = new Date().toISOString();
  const { total, scope1, scope2, scope3 } = calculateTotalEmissions(input.rows, input.factors, input.country);
  const totalTonnes = toTonnes(total);
  const intensity = input.totalProductOutput > 0 ? totalTonnes / input.totalProductOutput : 0;
  const cbamRisk = calculateCBAMScore(intensity);
  const alternatives = selectRelevantAlternatives(input.rows);

  const rowDetails = input.rows.map((row, idx) => {
    const estimatedEmissionsKg = calculateRowEmissions(row, input.factors, input.country);
    return {
      index: idx + 1,
      materialOrFuel: row.materialOrFuel || 'N/A',
      process: row.process,
      quantityWithUnit: `${row.quantity} ${row.unit}`,
      estimatedEmissionsKg,
    };
  });

  const recommendations = alternatives.map((alt) => ({
    category: alt.category,
    title: alt.title,
    alternative: alt.alternative,
    reductionPercent: alt.reductionPercent,
    implementation: alt.implementation,
    limitations: alt.limitations,
    sourceTitle: alt.sourceTitle,
    sourceUrl: alt.sourceUrl,
  }));

  const citationMap = new Map<string, { sourceTitle: string; sourceUrl: string }>();
  recommendations.forEach((item) => {
    const key = `${item.sourceTitle}|${item.sourceUrl}`;
    citationMap.set(key, { sourceTitle: item.sourceTitle, sourceUrl: item.sourceUrl });
  });
  const citations = Array.from(citationMap.values());

  const rowLines = rowDetails.length
    ? rowDetails
        .map((row) => {
          return `| ${row.index} | ${row.materialOrFuel} | ${row.process} | ${row.quantityWithUnit} | ${row.estimatedEmissionsKg.toFixed(2)} kg CO2e |`;
        })
        .join('\n')
    : '| - | No input rows provided | - | - | - |';

  const recommendationsLines = recommendations
    .map((alt, idx) => {
      return [
        `### ${idx + 1}. ${alt.title}`,
        `- Category: ${alt.category}`,
        `- Alternative: ${alt.alternative}`,
        `- Reduction Potential: ${alt.reductionPercent}%`,
        `- Implementation Notes: ${alt.implementation}`,
        `- Limitations: ${alt.limitations}`,
        `- E4C Source: ${alt.sourceTitle}`,
        `- URL: ${alt.sourceUrl}`,
      ].join('\n');
    })
    .join('\n\n');

  const markdown = [
    '# Industrial Carbon Context Report',
    '',
    `**Label:** ${DECISION_TAG}`,
    `**Application:** ${APP_VERSION}`,
    `**Generated At (UTC):** ${timestampIso}`,
    `**Responsible AI Disclaimer:** ${RESPONSIBLE_AI_DISCLAIMER}`,
    '',
    '## 1) Raw Input Data (RecipeBuilder)',
    `- Country Grid: ${input.country}`,
    `- Total Product Output: ${input.totalProductOutput} tons`,
    '',
    '| # | Material/Fuel | Process | Quantity | Estimated Emissions |',
    '|---|---|---|---|---|',
    rowLines,
    '',
    '## 2) Technical Metrics',
    `- Total Emissions: ${total.toFixed(2)} kg CO2e (${totalTonnes.toFixed(4)} tCO2e)`,
    `- Scope 1: ${scope1.toFixed(2)} kg CO2e`,
    `- Scope 2: ${scope2.toFixed(2)} kg CO2e`,
    `- Scope 3: ${scope3.toFixed(2)} kg CO2e`,
    `- Carbon Intensity: ${intensity.toFixed(4)} tCO2e/t`,
    `- EU CBAM Risk Score: ${cbamRisk}`,
    '',
    '## 3) Local Base Recommendations (E4C-Validated)',
    recommendationsLines,
    '',
    '## 4) Agentic Handoff Note',
    'Take this context block to the E4C KnowledgeXpert Agentic App for deep technical chat, source verification, and engineering guidance.',
    '',
    '---',
    RESPONSIBLE_AI_DISCLAIMER,
  ].join('\n');

  return {
    markdown,
    plainText: markdown,
    timestampIso,
    metadata: {
      appVersion: APP_VERSION,
      generatedAtIso: timestampIso,
      decisionTag: DECISION_TAG,
      disclaimer: RESPONSIBLE_AI_DISCLAIMER,
      country: input.country,
      totalProductOutput: input.totalProductOutput,
    },
    rows: rowDetails,
    metrics: {
      totalKg: total,
      totalTonnes,
      scope1Kg: scope1,
      scope2Kg: scope2,
      scope3Kg: scope3,
      carbonIntensity: intensity,
      cbamRisk,
    },
    recommendations,
    citations,
  };
}
