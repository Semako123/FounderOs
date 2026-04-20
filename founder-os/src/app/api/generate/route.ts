import { NextRequest, NextResponse } from 'next/server'
import anthropic from '@/lib/anthropic'
import {
  getPitchDeckPrompt,
  getMarketingKitPrompt,
  getInvestorMemoPrompt,
  getFinancialModelPrompt,
  getSummaryPrompt,
} from '@/lib/prompts'

export async function POST(req: NextRequest) {
  const { idea } = await req.json()

  if (!idea || typeof idea !== 'string' || idea.trim().length < 10) {
    return NextResponse.json({ error: 'A valid idea is required.' }, { status: 400 })
  }

  const trimmedIdea = idea.trim()

  // All 4 modules run fully in parallel. Each chains content → summary internally
  // so there are no sequential batches. Promise.allSettled means one failure
  // can't block the others — we always respond.
  const results = await Promise.allSettled([
    generateModule(getPitchDeckPrompt(trimmedIdea)),
    generateModule(getMarketingKitPrompt(trimmedIdea)),
    generateModule(getInvestorMemoPrompt(trimmedIdea)),
    generateModule(getFinancialModelPrompt(trimmedIdea)),
  ])

  const [pitchDeckResult, marketingKitResult, investorMemoResult, financialModelResult] =
    results.map((r) => (r.status === 'fulfilled' ? r.value : { content: '', summary: '' }))

  return NextResponse.json({
    pitchDeck: pitchDeckResult.content,
    marketingKit: marketingKitResult.content,
    investorMemo: investorMemoResult.content,
    financialModel: financialModelResult.content,
    summaries: {
      pitchDeck: pitchDeckResult.summary,
      marketingKit: marketingKitResult.summary,
      investorMemo: investorMemoResult.summary,
      financialModel: financialModelResult.summary,
    },
  })
}

// Generates content then immediately summarises it. Summary failure never
// blocks content delivery — it just returns an empty string.
async function generateModule(prompt: string): Promise<{ content: string; summary: string }> {
  const content = await generateContent(prompt)
  if (!content) return { content: '', summary: '' }

  let summary = ''
  try {
    summary = await generateSummary(content)
  } catch {
    // non-fatal — personas will still have the startup idea for context
  }

  return { content, summary }
}

async function generateContent(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = message.content[0]
  return block.type === 'text' ? block.text.trim() : ''
}

async function generateSummary(content: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: getSummaryPrompt(content) }],
  })
  const block = message.content[0]
  return block.type === 'text' ? block.text.trim() : ''
}
