import { NextRequest, NextResponse } from 'next/server'
import anthropic from '@/lib/anthropic'
import {
  getPitchDeckPrompt,
  getMarketingKitPrompt,
  getInvestorMemoPrompt,
  getFinancialModelPrompt,
} from '@/lib/prompts'

export async function POST(req: NextRequest) {
  const { idea } = await req.json()

  if (!idea || typeof idea !== 'string' || idea.trim().length < 10) {
    return NextResponse.json({ error: 'A valid idea is required.' }, { status: 400 })
  }

  const trimmedIdea = idea.trim()

  const [pitchDeck, marketingKit, investorMemo, financialModel] = await Promise.all([
    generateModule(getPitchDeckPrompt(trimmedIdea)),
    generateModule(getMarketingKitPrompt(trimmedIdea)),
    generateModule(getInvestorMemoPrompt(trimmedIdea)),
    generateModule(getFinancialModelPrompt(trimmedIdea)),
  ])

  return NextResponse.json({ pitchDeck, marketingKit, investorMemo, financialModel })
}

async function generateModule(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content[0]
  return block.type === 'text' ? block.text : ''
}
