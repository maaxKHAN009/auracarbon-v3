# Phase 2: BearCreekAI Agentic App Configuration

## Building the "Carbon Reduction Advisor" Agentic App

### Overview
This document provides step-by-step instructions for creating the Agentic App in BearCreekAI that will analyze industrial emission reports and generate tailored carbon reduction recommendations with financial projections.

---

## Part 1: App Setup & Basic Configuration

### Step 1.1: Create New App in BearCreekAI

**Navigation:**
1. Open BearCreekAI platform
2. Left sidebar → **Apps** section
3. Top-right → **New App** button

**Fill in App Details:**
- **App Name:** `Carbon Reduction Advisor`
- **App ID:** `carbon-advisor-v1` (auto-generated)
- **Description:** 
  ```
  Analyzes industrial carbon emissions and generates tailored reduction 
  recommendations with implementation timelines, cost estimates, and financial 
  projections. Uses industry knowledge base with case studies and compliance 
  guidelines.
  ```
- **Category:** Industrial / Sustainability (if available)
- **Icon:** Green leaf or carbon cycle icon
- **Access Level:** Public (allow anyone to use)

**Click: Create App**

---

## Part 2: App Structure - Sections & Fields

### Overview
The app has 6 sections:
- **INPUT SECTIONS (Sections 1-3):** User fills these with submission data
- **OUTPUT SECTIONS (Sections 4-6):** AI auto-generates from KB knowledge

---

## SECTION 1: EMISSION OVERVIEW
**Purpose:** User provides baseline emissions data  
**LLM Generated:** No (user input only)

### Fields in Section 1:

#### Field 1.1: Total Current Emissions (kg CO2e/year)
| Property | Value |
|----------|-------|
| **Field Name** | Total Current Emissions |
| **Field Type** | Decimal Number |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Total annual emissions across all scopes (kg CO2e) |
| **Example Value** | 650000 |
| **Helper Text** | Enter total emissions in kg. Convert tonnes: 1 tonne = 1,000 kg |
| **Min Value** | 0 |
| **Max Value** | 1000000000 |
| **Decimal Places** | 2 |

#### Field 1.2: Scope 1 Breakdown (%)
| Property | Value |
|----------|-------|
| **Field Name** | Scope 1 Direct Emissions (%) |
| **Field Type** | Decimal Number |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Percentage of total emissions from direct combustion/processes |
| **Example Value** | 46.15 |
| **Helper Text** | Direct emissions from owned equipment (furnaces, vehicles, etc.) |
| **Min Value** | 0 |
| **Max Value** | 100 |
| **Decimal Places** | 2 |

#### Field 1.3: Scope 2 Breakdown (%)
| Property | Value |
|----------|-------|
| **Field Name** | Scope 2 Indirect Energy (%) |
| **Field Type** | Decimal Number |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Percentage from purchased electricity, steam, heating, cooling |
| **Example Value** | 23.08 |
| **Helper Text** | Indirect emissions from grid electricity and purchased steam |
| **Min Value** | 0 |
| **Max Value** | 100 |
| **Decimal Places** | 2 |

#### Field 1.4: Scope 3 Breakdown (%)
| Property | Value |
|----------|-------|
| **Field Name** | Scope 3 Supply Chain (%) |
| **Field Type** | Decimal Number |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Percentage from raw materials, transportation, waste |
| **Example Value** | 30.77 |
| **Helper Text** | Indirect emissions from supply chain (must total ≤100% with Scopes 1&2) |
| **Min Value** | 0 |
| **Max Value** | 100 |
| **Decimal Places** | 2 |

#### Field 1.5: Annual Product Output (tonnes/year)
| Property | Value |
|----------|-------|
| **Field Name** | Annual Product Output |
| **Field Type** | Decimal Number |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Total annual production volume |
| **Example Value** | 100 |
| **Helper Text** | Production volume in tonnes/year (for calculating carbon intensity) |
| **Min Value** | 0.1 |
| **Max Value** | 10000000 |
| **Decimal Places** | 2 |

---

## SECTION 2: MATERIALS & PROCESSES
**Purpose:** User describes what materials & processes they use  
**LLM Generated:** No (user input only)

### Fields in Section 2:

#### Field 2.1: Primary Materials Used
| Property | Value |
|----------|-------|
| **Field Name** | List of Primary Materials |
| **Field Type** | Text (multi-line) |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Materials used in production (comma-separated or line-by-line) |
| **Example Value** | ```Steel (virgin), Cement (OPC), Natural Gas, Lime``` |
| **Helper Text** | Enter materials one per line. Example: Steel, Aluminum, Cement, etc. |
| **Character Limit** | 1000 |

#### Field 2.2: Key Manufacturing Processes
| Property | Value |
|----------|-------|
| **Field Name** | Manufacturing Processes |
| **Field Type** | Text (multi-line) |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Main processes used (heating, chemical reaction, physical transformation, etc.) |
| **Example Value** | ```Blast Furnace Steel Melting, Cement Kiln Heating, Lime Calcination``` |
| **Helper Text** | Describe main processes. Example: Furnace heating, Chemical synthesis, Kiln operation |
| **Character Limit** | 1000 |

#### Field 2.3: Industry Classification
| Property | Value |
|----------|-------|
| **Field Name** | Industry Type |
| **Field Type** | Text (short answer) |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Which industry sector (Steel, Cement, Chemical, Food, etc.) |
| **Example Value** | `Steel Manufacturing` |
| **Helper Text** | e.g., Steel, Cement, Chemicals, Food, Automotive, Textiles |
| **Character Limit** | 200 |

---

## SECTION 3: BUSINESS CONTEXT
**Purpose:** Understand budget, timeline, regulatory constraints  
**LLM Generated:** No (user input only)

### Fields in Section 3:

#### Field 3.1: Available Budget for Improvements
| Property | Value |
|----------|-------|
| **Field Name** | Implementation Budget Category |
| **Field Type** | Text (dropdown selection) |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | Capital availability for carbon reduction investments |
| **Options** | • Low (< $50K annual capex)<br>• Medium ($50K-$500K annual)<br>• High (> $500K annual)<br>• Unrestricted (no limit) |
| **Default** | Medium |
| **Helper Text** | Select budget range available for sustainability projects this year |

#### Field 3.2: Implementation Timeline Preference
| Property | Value |
|----------|-------|
| **Field Name** | Preferred Implementation Speed |
| **Field Type** | Text (dropdown selection) |
| **Required** | Yes |
| **Filled By** | User |
| **Description** | How quickly do you want to implement changes? |
| **Options** | • Urgent: ASAP (0-3 months)<br>• Near-term: This year (3-12 months)<br>• Medium-term: Next 1-2 years<br>• Long-term: 3+ year roadmap |
| **Default** | Medium-term |
| **Helper Text** | Shorter timelines prioritize quick wins; longer allows larger transformations |

#### Field 3.3: Regulatory Compliance Deadline
| Property | Value |
|----------|-------|
| **Field Name** | Compliance Deadline (Optional) |
| **Field Type** | Date |
| **Required** | No |
| **Filled By** | User |
| **Description** | Regulatory target date for emissions reduction (e.g., EU CBAM 2026) |
| **Example Value** | 2026-01-01 |
| **Helper Text** | If facing regulatory deadline (CBAM, ETS, carbon tax), enter target date |

#### Field 3.4: Stakeholder Priorities
| Property | Value |
|----------|-------|
| **Field Name** | Key Decision Drivers |
| **Field Type** | Text (multi-line) |
| **Required** | No |
| **Filled By** | User |
| **Description** | What matters most: Cost reduction, customer requirements, brand, compliance? |
| **Example Value** | ```Customer pressure for low-carbon products. Cost savings important. Not regulatory deadline.``` |
| **Helper Text** | Help AI prioritize recommendations. E.g., "Must reduce cost, customers require carbon transparency" |
| **Character Limit** | 500 |

---

## SECTION 4: DOMINANT EMISSION SOURCE (AI-GENERATED)
**Purpose:** AI analyzes scope breakdown and identifies primary emission driver  
**LLM Generated:** Yes ✅

### Fields in Section 4:

#### Field 4.1: Dominant Emission Scope
| Property | Value |
|----------|-------|
| **Field Name** | Dominant Emission Source |
| **Field Type** | Text (short answer) |
| **Required** | No |
| **Filled By** | **AI** (not user) |
| **Description** | Which scope dominates total emissions (Scope 1, 2, or 3) |
| **AI Instruction** | See below 👇 |

#### Field 4.2: Carbon Intensity
| Property | Value |
|----------|-------|
| **Field Name** | Carbon Intensity Ratio |
| **Field Type** | Text (decimal, read-only) |
| **Required** | No |
| **Filled By** | **AI** (not user) |
| **Description** | kg CO2e per tonne of product output (efficiency metric) |
| **AI Instruction** | Calculate as: (Total Emissions / 1000) / Annual Product Output |

#### Field 4.3: Top High-Impact Materials
| Property | Value |
|----------|-------|
| **Field Name** | Materials by Emission Contribution |
| **Field Type** | Text (short answer) |
| **Required** | No |
| **Filled By** | **AI** (not user) |
| **Description** | Rank materials by likely carbon impact (identify top 2-3 to prioritize) |
| **AI Instruction** | See below 👇 |

---

### AI INSTRUCTIONS for Section 4

**Instruction for Field 4.1: Dominant Emission Source**

```
Analyze the Scope 1, 2, and 3 percentages provided by the user.

Rules:
- If Scope 1 >= Scope 2 AND Scope 1 >= Scope 3, return "Scope 1 (Direct Combustion)"
- If Scope 2 >= Scope 1 AND Scope 2 >= Scope 3, return "Scope 2 (Purchased Electricity/Steam)"  
- If Scope 3 >= Scope 1 AND Scope 3 >= Scope 2, return "Scope 3 (Supply Chain Materials)"

Also provide 1-2 sentence explanation. Example:
"Scope 1 (Direct Combustion) at 46% - dominated by natural gas furnace heating and coal 
usage. Fuel switching and burner efficiency upgrades will have highest impact."

Use the knowledge base (Material Substitutions, Scope Best Practices) to inform recommendations 
by category.
```

**Instruction for Field 4.3: Top High-Impact Materials**

```
Based on the materials list provided (Field 2.1) and dominant scope (Field 4.1):

1. Match materials against knowledge base Material Substitutions document
2. Identify which materials have highest reduction potential
3. Rank top 2-3 materials by emission impact (assume Pareto rule: 80% of emissions from 20% of materials)
4. For each material, reference the alternative from knowledge base

Example output:
"1. Steel (46% likely): Switch to EAF recycled steel = 78% reduction potential
 2. Cement (30% likely): Use geopolymer cement = 91% reduction potential
 3. Natural Gas (18% likely): Biogas blending = 70% reduction potential"

Format as numbered list with specific alternatives from knowledge base + reduction %.
```

---

## SECTION 5: FIVE TAILORED RECOMMENDATIONS (AI-GENERATED)
**Purpose:** AI generates exactly 5 implementation-ready recommendations ranked by impact  
**LLM Generated:** Yes ✅

### Structure: 5 identical sub-sections, each with 7 fields

#### Field 5.1 through 5.5: RECOMMENDATION #1 through #5

For each recommendation (repeat structure 5 times):

| Sub-Field | Type | AI-Generated | Notes |
|-----------|------|--------------|-------|
| **5.X.a: Recommendation Title** | Text | ✅ | Short action (max 100 char). E.g., "Switch to recycled EAF steel" |
| **5.X.b: Target Scope** | Text | ✅ | "Scope 1", "Scope 2", or "Scope 3" |
| **5.X.c: Estimated CO2 Reduction %** | Decimal | ✅ | 0-100. % reduction in that scope only |
| **5.X.d: Implementation Timeline (months)** | Whole Number | ✅ | 1-60 months typical |
| **5.X.e: Cost Category** | Text | ✅ | "Low" (<$50K), "Medium" ($50K-$500K), "High" (>$500K) |
| **5.X.f: Implementation Roadmap** | Text (multi-line) | ✅ | 3-5 step guide on how to execute |
| **5.X.g: Alternative Product/Process** | Text | ✅ | Specific name of alternative (e.g., "EAF Steel", "Geopolymer Cement") |
| **5.X.h: Annual CO2 Saved (tonnes)** | Decimal | ✅ | Quantified annual savings in tCO2e |

### AI INSTRUCTION for Section 5: RECOMMENDATION GENERATION

```
You are an environmental engineering expert. Based on:
- Total Emissions: [Field 1.1]
- Scope 1/2/3 breakdown: [Fields 1.2, 1.3, 1.4]
- Materials used: [Field 2.1]
- Processes: [Field 2.2]
- Industry: [Field 2.3]
- Budget: [Field 3.1]
- Timeline: [Field 3.2]
- Stakeholder priorities: [Field 3.4]
- Dominant Scope identified: [Field 4.1]

TASK: Generate exactly 5 actionable, ranked recommendations.

RANKING CRITERIA (in order of priority):
1. Address the dominant emission scope first (Scope 1, 2, or 3)
2. Highest CO2 reduction potential
3. Cost-effectiveness (ROI friendly)
4. Implementation feasibility (within timeline preference)
5. Alignment with budget category

FOR EACH RECOMMENDATION:

1. Query the knowledge base for specific alternatives matching materials/industry
2. Extract from knowledge base:
   - Reduction percentage
   - Cost category
   - Timeline
   - Implementation steps
   - Alternative product name
   
3. Calculate Annual CO2 Saved:
   - Reduction in that scope = (Scope emissions) × (Reduction % / 100)
   - If recommendation spans multiple initiatives, sum annual savings
   - Formula: (Total Emissions kg / 1000 to get tonnes) × (Scope % / 100) × (Reduction % / 100)

4. Format exactly as:
   
   Recommendation 1: {Title}
   Scope: {Scope 1/2/3}
   Reduction: {X}%
   Timeline: {N} months
   Cost: {Low/Medium/High}
   Implementation:
   • Step 1: {action}
   • Step 2: {action}
   • Step 3: {action}
   Alternative: {Specific product name from knowledge base}
   Annual Savings: {X} tCO2e
   Knowledge Base Source: {Reference document & section where data sourced}

5. Provide 2-3 sentence explanation of WHY this recommendation (context + urgency)

CONSTRAINT: At least 1 recommendation MUST address the dominant scope. 
           If budget is Low, prioritize low/medium cost items.
           If timeline is Urgent, focus on 0-3 month quick wins.

USE KNOWLEDGE BASE EXTENSIVELY - cite sources for credibility.
```

---

## SECTION 6: FINANCIAL IMPACT & CARBON CREDITS
**Purpose:** Calculate total emission reduction potential + revenue projections  
**LLM Generated:** Yes ✅

### Fields in Section 6:

#### Field 6.1: Total Annual CO2 Reduction (tonnes)
| Property | Value |
|----------|-------|
| **Field Name** | Combined Annual Reduction |
| **Field Type** | Decimal (read-only) |
| **Required** | No |
| **Filled By** | **AI** (calculated) |
| **Description** | Sum of annual CO2 saved across all 5 recommendations |
| **AI Instruction** | Sum Field 5.1.h through 5.5.h |

#### Field 6.2: Carbon Credit Revenue @ $10/tonne
| Property | Value |
|----------|-------|
| **Field Name** | Carbon Credit Value (Conservative) |
| **Field Type** | Decimal (currency, read-only) |
| **Required** | No |
| **Filled By** | **AI** (calculated) |
| **Description** | If reductions converted to carbon credits at $10/tonne |
| **AI Instruction** | = Field 6.1 × 10 |

#### Field 6.3: Carbon Credit Revenue @ $30/tonne
| Property | Value |
|----------|-------|
| **Field Name** | Carbon Credit Value (Realistic) |
| **Field Type** | Decimal (currency, read-only) |
| **Required** | No |
| **Filled By** | **AI** (calculated) |
| **Description** | If reductions converted to carbon credits at $30/tonne (market average) |
| **AI Instruction** | = Field 6.1 × 30 |

#### Field 6.4: Carbon Credit Revenue @ $50/tonne
| Property | Value |
|----------|-------|
| **Field Name** | Carbon Credit Value (Premium) |
| **Field Type** | Decimal (currency, read-only) |
| **Required** | No |
| **Filled By** | **AI** (calculated) |
| **Description** | If reductions qualify for premium carbon credits at $50/tonne |
| **AI Instruction** | = Field 6.1 × 50 |

#### Field 6.5: Market Carbon Price (Current)
| Property | Value |
|----------|-------|
| **Field Name** | Carbon Market Price (Real-time) |
| **Field Type** | Decimal (read-only) |
| **Required** | No |
| **Filled By** | **AI** (lookup) |
| **Description** | Current EU ETS carbon price (reference market price) |
| **AI Instruction** | Fetch current price from carbon market API or knowledge base (last known: €75-90/tonne Apr 2025) |

#### Field 6.6: Revenue @ Market Price
| Property | Value |
|----------|-------|
| **Field Name** | Carbon Credit Value (Market Rate) |
| **Field Type** | Decimal (currency, read-only) |
| **Required** | No |
| **Filled By** | **AI** (calculated) |
| **Description** | Revenue if reductions sold at current market carbon price |
| **AI Instruction** | = Field 6.1 × Field 6.5 |

#### Field 6.7: Implementation Cost Estimate
| Property | Value |
|----------|-------|
| **Field Name** | Total Capital Investment Required |
| **Field Type** | Text (estimated range) |
| **Required** | No |
| **Filled By** | **AI** (calculated) |
| **Description** | Sum of implementation costs across 5 recommendations |
| **AI Instruction** | See instruction below 👇 |

#### Field 6.8: Payback Analysis
| Property | Value |
|----------|-------|
| **Field Name** | Investment Payback Period |
| **Field Type** | Text (with breakdown) |
| **Required** | No |
| **Filled By** | **AI** (calculated) |
| **Description** | When does investment ROI break even |
| **AI Instruction** | See instruction below 👇 |

---

### AI INSTRUCTIONS for Section 6

**Instruction for Field 6.7: Total Capital Investment**

```
Based on the 5 recommendations (Field 5.1 through 5.5):

For each recommendation's cost category (Field 5.X.e):
- Low cost: Assume $25K average
- Medium cost: Assume $150K average
- High cost: Assume $300K average

Sum the cost estimates:
Total Capital = Sum of estimated costs for all 5 recommendations

Format as:
"Recommendation 1 (Low cost): ~$25K
 Recommendation 2 (Medium cost): ~$150K
 Recommendation 3 (Medium cost): ~$150K
 Recommendation 4 (Low cost): ~$25K
 Recommendation 5 (High cost): ~$300K
 ─────────────────────────────
 TOTAL ESTIMATED INVESTMENT: ~$650K"

Add disclaimer: "Costs are estimates based on industry benchmarks. Obtain detailed quotes 
from vendors for final investment decision."
```

**Instruction for Field 6.8: Payback Analysis**

```
Calculate payback period using two scenarios:

SCENARIO A: Emission Reductions as Revenue (Carbon Credits)
- Annual Savings (carbon credits): Field 6.1 tonnes × $30/tonne = $ annual revenue
- Payback Period A = Total Capital Investment / Annual Savings
- Example: $650K / $180K/year = 3.6 years

SCENARIO B: Operational Cost Savings (Energy Efficiency)
- Not all recommendations save money (e.g., renewable energy premiums)
- Estimate which recommendations generate cost savings (efficiency, fuel switching with biogas savings)
- Rough estimate: 40-60% of recommendations generate operational savings
- Assume $50-100K/year in operational cost reductions (conservative)
- Payback Period B = Total Capital Investment / Annual Cost Savings
- Example: $650K / $75K/year = 8.7 years

FORMAT OUTPUT:
"Payback Period (Carbon Credit Revenue @ $30/tonne): 3.6 years
 Payback Period (Operational Cost Savings): 8.7 years
 
 Most Likely Scenario: 4-5 year payback through combination of:
 • Energy efficiency cost reductions (~$40K/year)
 • Carbon credit revenue (~$180K/year when monetized)
 • Supply chain cost savings from material substitution (~$30K/year potential)
 
 RECOMMENDATION: Implement quick wins (0-3 months, payback <1 year) first. 
 These fund longer-payback strategic investments."
```

---

## SECTION 7: IMPLEMENTATION ROADMAP (AI-GENERATED)
**Purpose:** Prioritize recommendations into phased timeline  
**LLM Generated:** Yes ✅

### Fields in Section 7:

#### Field 7.1: Phase 1 (Months 0-3) - Quick Wins
| Property | Value |
|----------|-------|
| **Field Name** | Quick-Win Actions (0-3 months) |
| **Field Type** | Text (multi-line) |
| **Required** | No |
| **Filled By** | **AI** (generated) |
| **Description** | Fast-track recommendations with <3 month timeline & low cost |
| **AI Instruction** | Filter recommendations where timeline ≤ 3 AND cost = "Low" |

#### Field 7.2: Phase 2 (Months 3-12) - Medium-term
| Property | Value |
|----------|-------|
| **Field Name** | Medium-term Actions (3-12 months) |
| **Field Type** | Text (multi-line) |
| **Required** | No |
| **Filled By** | **AI** (generated) |
| **Description** | Mid-term recommendations with 3-12 month horizon |
| **AI Instruction** | Filter recommendations where 3 < timeline ≤ 12 |

#### Field 7.3: Phase 3 (Months 12+) - Strategic
| Property | Value |
|----------|-------|
| **Field Name** | Strategic Actions (12+ months) |
| **Field Type** | Text (multi-line) |
| **Required** | No |
| **Filled By** | **AI** (generated) |
| **Description** | Long-term transformative changes (12+ months, typically higher cost) |
| **AI Instruction** | Filter recommendations where timeline > 12 |

#### Field 7.4: Success Metrics & KPIs
| Property | Value |
|----------|-------|
| **Field Name** | Key Performance Indicators to Track |
| **Field Type** | Text (multi-line) |
| **Required** | No |
| **Filled By** | **AI** (generated) |
| **Description** | Metrics to monitor progress toward emission reduction goals |
| **AI Instruction** | See below 👇 |

---

### AI INSTRUCTION for Field 7.4: Success Metrics

```
Based on the recommendations and industry best practices, generate 5-7 KPIs to track progress:

For each KPI provide:
1. KPI Name (clear, measurable)
2. Baseline (current state, from Field 1.1)
3. Target (end-state after Year 1, Year 3, Year 5)
4. Frequency of measurement (monthly, quarterly, annually)
5. Data source (meter, supplier report, calculation)

TEMPLATE OUTPUT:

✓ KPI 1: Scope 1 Emissions Intensity
   Baseline: 6.5 kg CO2e per tonne product
   Year 1 Target: 5.8 kg CO2e per tonne (-11%)
   Year 3 Target: 4.2 kg CO2e per tonne (-35%)
   Frequency: Monthly (from energy meters)

✓ KPI 2: Scope 2 - Renewable Energy %
   Baseline: 0% renewable
   Year 1 Target: 30% renewable (PPA contract start)
   Year 3 Target: 75% renewable
   Frequency: Monthly (from utility invoices)

[Continue pattern for remaining KPIs]

INCLUDE AT LEAST:
- 1 KPI for each recommendation scope (1, 2, 3)
- 1 KPI for carbon intensity (per unit product)
- 1 KPI for cost/ROI tracking
- 1 KPI for renewable energy % or clean fuel %
```

---

## Part 3: App Settings & Configuration

### Knowledge Base Configuration

**Within the App:**

1. **Select Knowledge Bases to Connect:**
   - Select: "Industrial Carbon Reduction" (your uploaded KB with 4 documents)
   - Enable: Semantic search (allows fuzzy matching, not just exact keywords)
   - Set search priority: High (AI will reference KB first before generating new content)

2. **Citation Settings:**
   - Enable: Citation display (users see which KB document each recommendation comes from)
   - Include: Page/section reference from KB

### AI Model Selection

**Within the App:**

1. **Primary Model:** GPT-4 (recommended for complex reasoning)
   - Alternative: Claude 3.5 Sonnet (if available and preferred)

2. **Model Parameters:**
   - Temperature: 0.3 (more deterministic, less creative = better for carbon calculations)
   - Max Tokens: 8000 (sufficient for detailed recommendations)

3. **Response Format:** JSON (for structured output parsing by your frontend)

### Form Submission Settings

**Configure Form Behavior:**

1. **Submission Mode:** Two-stage
   - Stage 1: User submits input (Sections 1-3)
   - Stage 2: AI generates output (Sections 4-7)

2. **Processing Time:** Allow up to 30 seconds for AI response

3. **Error Handling:**
   - If AI fails: Display fallback message + suggest retrying
   - If validation fails (e.g., Scope percentages >100%): Show error, request correction

4. **Save Documents:** Enable
   - Users can save, edit, export each analysis as a document
   - Support export formats: PDF, JSON, CSV

---

## Part 4: Testing the App

### Test Case 1: Steel Mill (Similar to Case Study)
**Input:**
- Total Emissions: 650,000 kg CO2e/year
- Scope 1: 46.15%  (300K kg)
- Scope 2: 23.08%  (150K kg)
- Scope 3: 30.77%  (200K kg)
- Product Output: 100 tonnes/year
- Materials: Steel (virgin from blast furnace), natural gas
- Budget: Medium ($50-500K)
- Timeline: Near-term (3-12 months)

**Expected AI Output:**
- Dominant Scope: Scope 1 (direct combustion)
- Top Material: Steel (referenced as EAF alternative available)
- Recommendation 1: Fuel switching to biogas blend (70% reduction, 6-12 mo, medium cost)
- Recommendation 2: Burner efficiency upgrade (8-20% reduction, 2-6 mo, medium cost)
- Recommendation 3: Switch to EAF steel (78% Scope 3 reduction, 6-12 mo, medium cost)
- Total reduction potential: ~45%
- Carbon credit value @ $30/t: $87K-180K annually

---

## Part 5: Quality Assurance Checklist

Before launching the app, verify:

- [ ] All 7 sections created with correct field types
- [ ] Section 1-3 fields marked "User filled"
- [ ] Section 4-7 fields marked "AI generated"
- [ ] Knowledge base connected and searchable
- [ ] AI instructions copied exactly into each AI-generated field
- [ ] Test case 1 (Steel Mill) runs and produces reasonable output
- [ ] All calculations validated (carbon intensity, payback period, etc.)
- [ ] Citation links work and reference correct KB documents
- [ ] Form validation prevents invalid inputs (e.g., negative emissions, >100% scopes)
- [ ] Export functionality works (PDF, JSON)
- [ ] Mobile responsiveness tested
- [ ] Accessibility: Form labels clear, input hints provided

---

## Part 6: Next Steps (After Deployment)

Once app is live in BearCreekAI:

1. **Embed in AuraCarbon Web App** (Phase 3)
   - API endpoint to call app
   - Display output in "Recommendations Card"
   - Link to chat widget for follow-ups

2. **Test with Real Users**
   - Get feedback on recommendation quality
   - Refine AI instructions based on user questions
   - Update KB if new materials/techniques emerge

3. **Monitor & Iterate**
   - Track most common user queries
   - Add FAQ section to KB
   - Improve AI instructions based on real-world usage

---

*End of Phase 2: Agentic App Configuration*
*Ready to move to Phase 3: Chat Widget Embedding*
