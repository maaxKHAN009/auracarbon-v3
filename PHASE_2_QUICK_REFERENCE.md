# Phase 2: Quick Reference - Build the Agentic App in BearCreekAI

## 🎯 Your Checklist (Copy-Paste Ready)

### STEP 1: Create New App
- [ ] Log into BearCreekAI
- [ ] Navigate: Left sidebar → **Apps** → **New App**
- [ ] **App Name:** `Carbon Reduction Advisor`
- [ ] **Description:** 
  ```
  Analyzes industrial carbon emissions and generates tailored reduction 
  recommendations with implementation timelines, cost estimates, and financial 
  projections. Uses knowledge base with material substitutions, best practices, 
  case studies, and compliance guidelines.
  ```
- [ ] **Click: Create App**

---

### STEP 2: Connect Knowledge Base
- [ ] From App Settings → **Knowledge Bases**
- [ ] Select: `Industrial Carbon Reduction` (your uploaded KB with 4 PDFs)
- [ ] Enable: **Semantic Search** ✓
- [ ] Enable: **Citation Display** ✓
- [ ] Click: **Save**

---

### STEP 3: Create SECTION 1 - Emission Overview (User Input)

**Add Section:**
- [ ] Click: **+ Add Section**
- [ ] Section Title: `Emission Overview`
- [ ] Section Description: `Provide your baseline carbon emissions data`
- [ ] Toggle: **LLM Generated** = OFF (users fill this)

**Add Fields:**
- [ ] Field 1: `Total Current Emissions` | Type: Decimal | Required: Yes
  - Helper: "Enter total annual emissions in kg CO2e. Example: 650000"
  
- [ ] Field 2: `Scope 1 Direct Emissions (%)` | Type: Decimal | Required: Yes
  - Min: 0, Max: 100
  - Helper: "Direct combustion and process emissions. Example: 46.15"
  
- [ ] Field 3: `Scope 2 Indirect Energy (%)` | Type: Decimal | Required: Yes
  - Min: 0, Max: 100
  - Helper: "Purchased electricity and steam. Example: 23.08"
  
- [ ] Field 4: `Scope 3 Supply Chain (%)` | Type: Decimal | Required: Yes
  - Min: 0, Max: 100
  - Helper: "Raw materials, transport, waste. Example: 30.77"
  
- [ ] Field 5: `Annual Product Output` | Type: Decimal | Required: Yes
  - Min: 0.1, Max: 10000000
  - Helper: "Annual production volume in tonnes. Example: 100"

---

### STEP 4: Create SECTION 2 - Materials & Processes (User Input)

**Add Section:**
- [ ] Click: **+ Add Section**
- [ ] Section Title: `Materials & Processes`
- [ ] Section Description: `Describe your primary materials and processes`
- [ ] Toggle: **LLM Generated** = OFF (users fill this)

**Add Fields:**
- [ ] Field 1: `List of Primary Materials` | Type: Text (multi-line) | Required: Yes
  - Character limit: 1000
  - Helper: "One material per line. Example: Steel, Cement, Natural Gas"
  
- [ ] Field 2: `Manufacturing Processes` | Type: Text (multi-line) | Required: Yes
  - Character limit: 1000
  - Helper: "Main processes used. Example: Blast Furnace Heating, Kiln Operation"
  
- [ ] Field 3: `Industry Type` | Type: Text (short) | Required: Yes
  - Character limit: 200
  - Helper: "e.g., Steel, Cement, Chemical, Food, Automotive"

---

### STEP 5: Create SECTION 3 - Business Context (User Input)

**Add Section:**
- [ ] Click: **+ Add Section**
- [ ] Section Title: `Business Context`
- [ ] Section Description: `Help us understand your constraints and priorities`
- [ ] Toggle: **LLM Generated** = OFF (users fill this)

**Add Fields:**
- [ ] Field 1: `Available Budget` | Type: Dropdown | Required: Yes
  - Options: "Low (<$50K)" | "Medium ($50K-$500K)" | "High (>$500K)" | "Unrestricted"
  - Default: Medium
  
- [ ] Field 2: `Implementation Timeline` | Type: Dropdown | Required: Yes
  - Options: "Urgent (0-3 mo)" | "Near-term (3-12 mo)" | "Medium-term (1-2 yr)" | "Long-term (3+ yr)"
  - Default: Medium-term
  
- [ ] Field 3: `Compliance Deadline` | Type: Date | Required: NO
  - Helper: "E.g., 2026 for EU CBAM. Leave blank if none."
  
- [ ] Field 4: `Stakeholder Priorities` | Type: Text (multi-line) | Required: NO
  - Character limit: 500
  - Helper: "What matters most? Cost savings, customer requirements, compliance, brand?"

---

### STEP 6: Create SECTION 4 - Dominant Scope Analysis (AI-GENERATED)

**Add Section:**
- [ ] Click: **+ Add Section**
- [ ] Section Title: `Emission Analysis`
- [ ] Section Description: `AI identifies your primary emission driver`
- [ ] Toggle: **LLM Generated** = ON ✓

**Add Fields:**
- [ ] Field 1: `Dominant Emission Source` | Type: Text | **AI Generated** ✓
  
  **AI Instruction (COPY EXACTLY):**
  ```
  Analyze the Scope 1, 2, and 3 percentages from the user's submission.
  
  Determine which scope has the highest percentage:
  - Scope 1 highest → "Scope 1 (Direct Combustion)"
  - Scope 2 highest → "Scope 2 (Purchased Electricity/Steam)"
  - Scope 3 highest → "Scope 3 (Supply Chain Materials)"
  
  Provide 1-2 sentence explanation of why this scope dominates and what actions 
  would have highest impact. Example:
  "Scope 1 (Direct Combustion) at 46% - dominated by natural gas furnace heating. 
  Fuel switching and burner efficiency upgrades will have highest impact."
  
  Reference the knowledge base for specific strategies by scope.
  ```

- [ ] Field 2: `Carbon Intensity Ratio` | Type: Decimal | **AI Generated** ✓
  
  **AI Instruction:**
  ```
  Calculate carbon intensity as:
  (Total Emissions in kg / 1000 to convert to tonnes) / Annual Product Output
  
  Format as: "X.XX kg CO2e per tonne product"
  
  Add context: "Industry benchmark is Y for {industry}. Your facility is Z% 
  above/below average."
  ```

- [ ] Field 3: `Top High-Impact Materials` | Type: Text | **AI Generated** ✓
  
  **AI Instruction:**
  ```
  Based on the materials list from user input, rank top 2-3 materials by 
  likely carbon contribution.
  
  For each material:
  1. Match against Material Substitutions knowledge base document
  2. Identify recommended alternative + reduction % from KB
  3. Provide specific information
  
  Format as numbered list:
  "1. Steel (likely 46%): EAF recycled steel = 78% reduction potential
   2. Cement (likely 30%): Geopolymer cement = 91% reduction potential  
   3. Natural Gas (likely 18%): Biogas blending = 70% reduction potential"
  ```

---

### STEP 7: Create SECTION 5 - Five Recommendations (AI-GENERATED)

**Add Section:**
- [ ] Click: **+ Add Section**
- [ ] Section Title: `Five Tailored Recommendations`
- [ ] Section Description: `AI-generated carbon reduction strategies`
- [ ] Toggle: **LLM Generated** = ON ✓

**For EACH Recommendation (Repeat 5 times):**

Add 8 fields per recommendation:

- [ ] **5.1 Recommendation Title** | Type: Text | AI Generated
  - Helper: "E.g., Switch to recycled EAF steel"
  
- [ ] **5.2 Target Scope** | Type: Text | AI Generated
  - Constraint: "Scope 1" OR "Scope 2" OR "Scope 3"
  
- [ ] **5.3 Estimated Reduction %** | Type: Decimal | AI Generated
  - Range: 0-100
  
- [ ] **5.4 Timeline (months)** | Type: Whole Number | AI Generated
  - Range: 1-60
  
- [ ] **5.5 Cost Category** | Type: Text | AI Generated
  - Options: "Low" or "Medium" or "High"
  
- [ ] **5.6 Implementation Roadmap** | Type: Text (multi-line) | AI Generated
  - 3-5 step guide
  
- [ ] **5.7 Alternative Product** | Type: Text | AI Generated
  - Specific name (e.g., "EAF Steel", "Geopolymer Cement")
  
- [ ] **5.8 Annual CO2 Saved (tCO2e)** | Type: Decimal | AI Generated

**AI Instruction for All 5 Recommendations (COPY EXACTLY):**

```
You are an environmental engineering expert analyzing industrial carbon emissions.

CONTEXT from user input:
- Total Emissions: [Field 1.1 kg CO2e/year]
- Scope 1/2/3 breakdown: [Fields 1.2, 1.3, 1.4 percentages]
- Materials: [Field 2.1]
- Processes: [Field 2.2]
- Industry: [Field 2.3]
- Budget: [Field 3.1]
- Timeline Preference: [Field 3.2]
- Dominant Scope: [Field 4.1 AI output]

TASK: Generate exactly 5 specific, ranked recommendations.

RANKING PRIORITY:
1. Address the dominant scope FIRST (from Field 4.1)
2. Highest CO2 reduction % potential
3. Cost-effectiveness (ROI friendly)
4. Feasible within stated timeline (Field 3.2)
5. Fits budget category (Field 3.1)

FOR EACH RECOMMENDATION:

Step 1: Query knowledge base for materials/industry/scope matches
Step 2: Extract specific data:
   - Reduction percentage
   - Cost category
   - Implementation timeline
   - Implementation steps (3-5 bullet points)
   - Alternative product name
   
Step 3: Calculate Annual CO2 Saved (tCO2e):
   Formula: (Total Emissions kg / 1000) × (Scope % / 100) × (Reduction % / 100)
   Example: (650,000 kg / 1000) × (0.4615) × (0.78) = 186.7 tCO2e/year

Step 4: Format output for each field:
   - 5.X.a Title: "{Action Target} → {Alternative}"
   - 5.X.b Scope: One of "Scope 1", "Scope 2", "Scope 3"
   - 5.X.c Reduction: Integer 0-100
   - 5.X.d Timeline: Integer months
   - 5.X.e Cost: "Low", "Medium", or "High"
   - 5.X.f Implementation: 3-5 bullet points of actionable steps
   - 5.X.g Alternative: Specific product name from KB
   - 5.X.h Savings: Decimal in tCO2e

Step 5: Include 2-3 sentence explanation WHY this recommendation
        (context + urgency + business case)

Step 6: CITE KNOWLEDGE BASE SOURCE:
   "Source: {Document Name} - {Section Name}"
   Examples:
   - "Source: Material Substitutions - Steel Alternatives"
   - "Source: Scope Best Practices - Scope 1 Strategies"
   - "Source: Case Studies - Steel Mill 58% Reduction"

CONSTRAINTS:
✓ At least 1 recommendation MUST address Field 4.1 dominant scope
✓ If budget = Low: Prioritize recommendations with "Low" or "Medium" cost
✓ If timeline = Urgent: Prioritize recommendations ≤ 3 months
✓ Total recommended CO2 reduction = sum of all 5 should be 30-70% of baseline
✓ Avoid repeating same recommendation (diversify across different strategies)

USE KNOWLEDGE BASE EXTENSIVELY AND CITE SOURCES FOR CREDIBILITY.
```

---

### STEP 8: Create SECTION 6 - Financial Impact (AI-GENERATED)

**Add Section:**
- [ ] Click: **+ Add Section**
- [ ] Section Title: `Financial Impact & Carbon Credits`
- [ ] Section Description: `Economic analysis of recommended actions`
- [ ] Toggle: **LLM Generated** = ON ✓

**Add Fields:**

- [ ] **6.1 Total Annual Reduction** | Type: Decimal | AI Generated
  **AI Instruction:** `Sum all values from Field 5.8 (Annual CO2 Saved)`

- [ ] **6.2 Revenue @ $10/tonne** | Type: Currency | AI Generated
  **AI Instruction:** `= Field 6.1 × $10`

- [ ] **6.3 Revenue @ $30/tonne** | Type: Currency | AI Generated
  **AI Instruction:** `= Field 6.1 × $30`

- [ ] **6.4 Revenue @ $50/tonne** | Type: Currency | AI Generated
  **AI Instruction:** `= Field 6.1 × $50`

- [ ] **6.5 Market Carbon Price** | Type: Decimal | AI Generated
  **AI Instruction:** `Current EU ETS price: €75-90/tonne (as of April 2025). Update quarterly.`

- [ ] **6.6 Revenue @ Market Price** | Type: Currency | AI Generated
  **AI Instruction:** `= Field 6.1 × Field 6.5`

- [ ] **6.7 Total Investment Required** | Type: Text | AI Generated
  **AI Instruction:**
  ```
  Estimate cost for each recommendation:
  - Low cost recommendation: ~$25K
  - Medium cost recommendation: ~$150K
  - High cost recommendation: ~$300K
  
  Sum all recommendations and format as:
  "Recommendation 1 (Low): ~$25K
   Recommendation 2 (Medium): ~$150K
   ...
   TOTAL INVESTMENT: ~$650K
   
   Disclaimer: Costs are estimates. Obtain vendor quotes for final decisions."
  ```

- [ ] **6.8 Payback Period** | Type: Text | AI Generated
  **AI Instruction:**
  ```
  Calculate two scenarios:
  
  A) Payback from Carbon Credit Revenue:
     Annual savings = Field 6.1 tonnes × $30/tonne = $ revenue
     Payback = Total Investment / Annual revenue
  
  B) Payback from Operational Savings:
     Estimate 40-60% of recommendations generate operational cost savings
     Conservative estimate: $50-70K/year in energy/fuel cost reductions
     Payback = Total Investment / Annual operational savings
  
  Format as:
  "Carbon Credit Payback (@ $30/tonne): X.X years
   Operational Cost Payback: Y.Y years
   Most Likely Scenario: Z-Z years (blended)
   
   Recommendation: Implement quick wins first (payback <1 year) which fund 
   longer-payback strategic investments."
  ```

---

### STEP 9: Create SECTION 7 - Implementation Roadmap (AI-GENERATED)

**Add Section:**
- [ ] Click: **+ Add Section**
- [ ] Section Title: `Implementation Roadmap`
- [ ] Section Description: `Phased timeline for execution`
- [ ] Toggle: **LLM Generated** = ON ✓

**Add Fields:**

- [ ] **7.1 Quick Wins (0-3 months)** | Type: Text | AI Generated
  **AI Instruction:**
  ```
  Filter recommendations from Section 5 where:
  - Timeline ≤ 3 months AND
  - Cost = "Low"
  
  Format as prioritized list with timeline.
  ```

- [ ] **7.2 Medium-term (3-12 months)** | Type: Text | AI Generated
  **AI Instruction:**
  ```
  Filter recommendations where:
  - Timeline between 3-12 months
  
  Format as prioritized list.
  ```

- [ ] **7.3 Strategic (12+ months)** | Type: Text | AI Generated
  **AI Instruction:**
  ```
  Filter recommendations where:
  - Timeline > 12 months
  
  These are typically larger investments or require supplier relationships.
  ```

- [ ] **7.4 Success Metrics (KPIs)** | Type: Text | AI Generated
  **AI Instruction:**
  ```
  Generate 5-7 Key Performance Indicators for tracking progress:
  
  For each KPI provide:
  - KPI Name
  - Baseline (current)
  - Target (Year 1, Year 3, Year 5)
  - Frequency (monthly/quarterly/annually)
  - Data source
  
  Example format:
  "✓ KPI 1: Scope 1 Emissions Intensity
     Baseline: 6.5 kg CO2e per tonne
     Year 1 Target: 5.8 kg CO2e (-11%)
     Year 3 Target: 4.2 kg CO2e (-35%)
     Frequency: Monthly
     Source: Energy meters + production reports"
  
  MUST INCLUDE:
  - 1 KPI per scope (1, 2, 3)
  - 1 KPI for carbon intensity
  - 1 KPI for cost/ROI
  - 1 KPI for renewable % or clean fuel %
  ```

---

### STEP 10: Configure App Settings

**AI Model:**
- [ ] Select: **GPT-4** (or Claude 3.5 if preferred)
- [ ] Temperature: **0.3** (deterministic for calculations)
- [ ] Max Tokens: **8000**
- [ ] Response Format: **JSON** (for structured output)

**Form Settings:**
- [ ] Enable: **Save as Document** ✓
- [ ] Export Formats: PDF, JSON, CSV
- [ ] Submission Time Limit: 30 seconds

**Advanced:**
- [ ] Enable: **Citation Display** ✓ (show KB sources)
- [ ] Enable: **Validation** ✓ (prevent invalid inputs)

---

### STEP 11: TEST THE APP

**Test with Steel Mill Case Study:**

**Input Section 1:**
- Total Emissions: `650000`
- Scope 1: `46.15`
- Scope 2: `23.08`
- Scope 3: `30.77`
- Product Output: `100`

**Input Section 2:**
- Materials: `Steel (virgin), Natural Gas`
- Processes: `Blast Furnace Melting, Furnace Heating`
- Industry: `Steel Manufacturing`

**Input Section 3:**
- Budget: `Medium`
- Timeline: `Near-term`
- Compliance: (leave blank)
- Priorities: `Cost savings and customer demand for low-carbon steel`

**Expected Output:**
- [ ] Dominant Scope identified as "Scope 1" ✓
- [ ] 5 recommendations generated ✓
- [ ] Steel recommendation includes "EAF Steel" alternative ✓
- [ ] Total reduction 30-70% ✓
- [ ] Carbon credit revenue calculated ✓
- [ ] Payback period 3-5 years ✓
- [ ] KB sources cited ✓

---

### STEP 12: PUBLISH & DEPLOY

- [ ] Click: **Publish App**
- [ ] Share access with team
- [ ] Get API endpoint for Phase 3 (chat widget embedding)

---

## 📝 Notes for BearCreekAI Platform

**If BearCreekAI interface differs slightly:**
- "Decimal Number" might be called "Number" or "Numeric"
- "Text (multi-line)" might be called "Long Text" or "Textarea"
- "Dropdown" might be called "Select" or "Multiple Choice"
- Toggle "LLM Generated" might be under "Advanced Options" or "AI Settings"

**If you get stuck:**
- Check BearCreekAI documentation on App Builder
- Reference the full config guide (PHASE_2_AGENTIC_APP_CONFIG.md)
- Test with simple 2-section app first, then expand

---

## 🎯 Success Criteria

App is ready when:
1. ✅ All 7 sections created
2. ✅ User input sections (1-3) accept data without errors
3. ✅ AI-generated sections (4-7) produce output >95% accuracy
4. ✅ Steel mill test case produces expected recommendations
5. ✅ KB citations appear in output
6. ✅ Financial calculations correct (payback, carbon credits)
7. ✅ Export to PDF works
8. ✅ App is published and accessible

---

**Next: Phase 3 - Embed Chat Widget into AuraCarbon Web App** 🚀
