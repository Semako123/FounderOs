import { NextRequest, NextResponse } from 'next/server'
import anthropic from '@/lib/anthropic'
import { buildSystemPrompt } from '@/lib/personas'
import type { PersonaKey, Message, ChatContext, ChatResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { persona, messages, context, cfoContext } = await req.json() as {
    persona: PersonaKey
    messages: Message[]
    context: ChatContext
    cfoContext?: string
  }

  if (!persona || !['cfo', 'cmo', 'lawyer'].includes(persona)) {
    return NextResponse.json({ error: 'Invalid persona' }, { status: 400 })
  }

  // Context is always injected — no isFirstMessage gating
  const systemPrompt = buildSystemPrompt(
    persona,
    context ?? { startupIdea: '', moduleSummary: '' },
    cfoContext
  )

  // Keep only the last 6 messages, always starting from a user turn
  let recentMessages = messages.slice(-6)
  while (recentMessages.length > 0 && recentMessages[0].role !== 'user') {
    recentMessages = recentMessages.slice(1)
  }

  const anthropicMessages = recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: anthropicMessages,
  })

  const rawText = message.content[0]?.type === 'text' ? message.content[0].text : ''

  const parsed = extractJson(rawText)
  return NextResponse.json(parsed)
}

function extractJson(raw: string): ChatResponse {
  const cleaned = raw
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/```\s*$/m, '')
    .trim()

  // Depth-tracking finder — handles nested objects correctly unlike a greedy regex.
  const jsonStr = findOutermostObject(cleaned)
  if (!jsonStr) return { response: raw.trim() }

  try {
    const obj = JSON.parse(jsonStr) as ChatResponse
    if (typeof obj.response === 'string') return obj
  } catch {
    // JSON is malformed (most often: unescaped quotes/braces in the response field).
    // Try to salvage: extract the response string and module_update block separately.
    return salvageParse(jsonStr, raw)
  }

  return { response: raw.trim() }
}

// Walk character-by-character tracking brace depth so we find the true boundary
// of the outermost JSON object, not just the last } in the string.
function findOutermostObject(text: string): string | null {
  let depth = 0
  let start = -1
  let inString = false
  let escape = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue

    if (ch === '{') {
      if (depth === 0) start = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && start !== -1) return text.slice(start, i + 1)
    }
  }
  return null
}

// When JSON.parse fails, try to recover the response text and module_update independently.
function salvageParse(jsonStr: string, raw: string): ChatResponse {
  // Extract the response field value with a regex that handles escaped chars
  const responseMatch = jsonStr.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  const responseText = responseMatch ? responseMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : raw.trim()

  // Try to find and parse the module_update object
  const muIdx = jsonStr.indexOf('"module_update"')
  if (muIdx === -1) return { response: responseText }

  const muStart = jsonStr.indexOf('{', muIdx)
  if (muStart === -1) return { response: responseText }

  const muStr = findOutermostObject(jsonStr.slice(muStart))
  if (!muStr) return { response: responseText }

  try {
    const mu = JSON.parse(muStr) as { target?: string; content?: unknown }
    if (mu.target && mu.content !== undefined) {
      return { response: responseText, module_update: { target: mu.target as import('@/lib/types').ModuleKey, content: mu.content } }
    }
  } catch { /* module_update is also malformed — skip it */ }

  return { response: responseText }
}
