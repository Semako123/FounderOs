export function getPitchDeckPrompt(idea: string): string {
  return `Generate an 8-slide investor-ready pitch deck for this startup idea:

"${idea}"

Return ONLY a valid JSON object — no markdown fences, no preamble, no explanation. Use this exact structure:
{"slides":[{"id":"1","type":"title","title":"[Company Name]","subtitle":"[One-line tagline]","tagline":"[One sentence: what you do and for whom]"},{"id":"2","type":"problem","title":"The Problem","bullets":["[Problem point 1]","[Problem point 2]","[Problem point 3]"]},{"id":"3","type":"solution","title":"Our Solution","bullets":["[Solution point 1]","[Solution point 2]","[Solution point 3]"]},{"id":"4","type":"market","title":"Market Opportunity","bullets":["TAM: $[X]B — [description]","SAM: $[X]B — [description]","SOM: $[X]M — [description]"]},{"id":"5","type":"businessModel","title":"Business Model","bullets":["[Revenue stream 1]","[Revenue stream 2]","[Key pricing detail]"]},{"id":"6","type":"traction","title":"Traction & Milestones","bullets":["[Current traction or assumption]","[Upcoming milestone 1]","[Upcoming milestone 2]"]},{"id":"7","type":"team","title":"The Team","bullets":["[Founder/CEO]: [Background]","[Co-founder/CTO]: [Background]","[Advisor or open role]"]},{"id":"8","type":"ask","title":"The Ask","subtitle":"Raising $[X]","bullets":["[Use of funds 1]","[Use of funds 2]","Expected runway: [X] months"]}]}

Be specific and realistic. Replace all placeholders with actual content tailored to the idea.`
}

export function getMarketingKitPrompt(idea: string): string {
  return `Create a complete marketing kit for this startup idea:

"${idea}"

Return ONLY a valid JSON object — no markdown fences, no preamble, no explanation. Use this exact structure:
{
  "tagline": "[One punchy, memorable brand tagline — 5 to 10 words max]",
  "brandVoice": ["[Tone word 1]", "[Tone word 2]", "[Tone word 3]"],
  "brandColors": [
    {"name": "Primary", "hex": "#XXXXXX"},
    {"name": "Secondary", "hex": "#XXXXXX"},
    {"name": "Accent", "hex": "#XXXXXX"},
    {"name": "Background", "hex": "#XXXXXX"}
  ],
  "instagramPosts": [
    {"caption": "[Post caption, 2-3 sentences, engaging and brand-aligned]", "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5"},
    {"caption": "[Post caption]", "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5"},
    {"caption": "[Post caption]", "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5"},
    {"caption": "[Post caption]", "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5"},
    {"caption": "[Post caption]", "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5"}
  ],
  "twitterPosts": [
    "[Tweet 1 — under 280 chars, punchy, shareable]",
    "[Tweet 2]",
    "[Tweet 3]",
    "[Tweet 4]",
    "[Tweet 5]"
  ],
  "adCopies": [
    {"headline": "[Short bold headline]", "body": "[2-sentence ad body — benefit-led, direct]", "cta": "[CTA button label, 2-4 words]"},
    {"headline": "[Short bold headline]", "body": "[2-sentence ad body]", "cta": "[CTA label]"},
    {"headline": "[Short bold headline]", "body": "[2-sentence ad body]", "cta": "[CTA label]"}
  ],
  "emailSubjectLines": [
    "[Subject line 1 — curiosity or value hook]",
    "[Subject line 2]",
    "[Subject line 3]",
    "[Subject line 4]",
    "[Subject line 5]"
  ],
  "campusPitch": "[A natural, confident 30-second campus pitch — 60 to 80 words. First-person, conversational, ending with a clear hook or ask.]"
}

Be creative, specific, and bold. Every element should feel like it belongs to a premium African startup brand.`
}

export function getInvestorMemoPrompt(idea: string): string {
  return `Write a 1-page investor memo for this startup idea:

"${idea}"

Format as markdown with these sections:
# Executive Summary
# The Problem & Why Now
# Solution & Differentiation
# Market Size (TAM / SAM / SOM)
# Revenue Model
# Competitive Landscape
# Key Risks & Mitigants
# Investment Thesis

Write with the precision and confidence of a seasoned founder. Be direct about risks — investors respect honesty.`
}

export function getFinancialModelPrompt(idea: string): string {
  return `Create a detailed 12-month financial model for this startup idea:

"${idea}"

Return ONLY a valid JSON object — no markdown fences, no preamble, no explanation. All monetary values must be raw integers (no currency symbols embedded in numbers). Use exactly this structure:

{"monthly_data":[{"month":"M1","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M2","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M3","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M4","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M5","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M6","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M7","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M8","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M9","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M10","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M11","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number},{"month":"M12","active_users":number,"loans_issued":number,"gross_loan_volume":number,"gross_revenue":number,"defaults":number,"net_revenue":number,"operating_costs":number,"net_profit":number}],"unit_economics":{"avg_loan_size":number,"service_fee_per_loan":number,"cost_per_loan":number,"net_margin_per_loan":number,"default_rate":number,"cac":number,"ltv":number},"key_metrics":{"total_y1_revenue":number,"operating_profit":number,"break_even_month":number,"ltv_cac_ratio":"X.X:1"},"funding":{"total_ask":"₦XX,XXX,XXX","loan_capital_pool_percent":number,"operating_capital_percent":number,"breakdown":[{"category":"Loan Capital Pool","percent":number},{"category":"Product & Engineering","percent":number},{"category":"Sales & Marketing","percent":number},{"category":"Operations","percent":number},{"category":"Legal & Compliance","percent":number},{"category":"G&A","percent":number}]},"kpi_targets":[{"metric":"string","definition":"string","target":"string"},{"metric":"string","definition":"string","target":"string"},{"metric":"string","definition":"string","target":"string"},{"metric":"string","definition":"string","target":"string"},{"metric":"string","definition":"string","target":"string"}],"risks":[{"risk":"string","impact":"high","mitigation":"string"},{"risk":"string","impact":"high","mitigation":"string"},{"risk":"string","impact":"medium","mitigation":"string"},{"risk":"string","impact":"medium","mitigation":"string"},{"risk":"string","impact":"low","mitigation":"string"}],"phases":[{"name":"string","months":"M1 – M3","goal":"string","status":"current"},{"name":"string","months":"M4 – M6","goal":"string","status":"upcoming"},{"name":"string","months":"M7 – M9","goal":"string","status":"upcoming"},{"name":"string","months":"M10 – M12","goal":"string","status":"upcoming"}]}

Rules:
- monthly_data must have exactly 12 entries showing realistic growth from early losses to approaching or hitting profitability
- net_profit = net_revenue - operating_costs for each month
- total_y1_revenue = sum of all 12 net_revenue values
- operating_profit = sum of all 12 net_profit values
- break_even_month = first month number (1–12) when net_profit >= 0, or 0 if never reached
- default_rate is a percentage (e.g. 5 means 5%)
- breakdown percentages must sum to 100
- Be specific and realistic for this startup idea`
}

export function getSummaryPrompt(content: string): string {
  return `Summarize the following startup module content in 150 words or less. Write as plain prose — no headers, no bullet points. Cover only the most important facts a co-founder would need as working context:

${content}`
}
