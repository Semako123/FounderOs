export function getPitchDeckPrompt(idea: string): string {
  return `Generate a concise, investor-ready pitch deck outline for this startup idea:

"${idea}"

Format as markdown with these sections:
# Problem
# Solution
# Market Opportunity
# Business Model
# Traction & Milestones
# Team (placeholder)
# The Ask

Be specific, compelling, and realistic. Use bullet points within sections. Keep it tight — this is a summary deck, not an essay.`
}

export function getMarketingKitPrompt(idea: string): string {
  return `Create a complete marketing kit for this startup idea:

"${idea}"

Format as markdown with these sections:
# Brand Positioning Statement
# Target Customer Persona
# Key Messages (3 core messages)
# Tagline Options (3 variations)
# Content Pillars (for social/content marketing)
# Launch Channel Strategy
# Sample Launch Tweet

Be creative but grounded. Make the messaging feel premium and differentiated.`
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
  return `Create a high-level financial model outline for this startup idea:

"${idea}"

Format as markdown with these sections:
# Revenue Assumptions
# Pricing Model
# Year 1 Projections (monthly breakdown as table)
# Key Metrics to Track (CAC, LTV, Churn, MRR)
# Funding Requirements & Use of Funds
# Path to Profitability

Use realistic, conservative estimates. Show your assumptions clearly. Include a simple markdown table for the monthly projections.`
}
