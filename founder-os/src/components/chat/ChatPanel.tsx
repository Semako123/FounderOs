'use client'

import { useEffect, useRef, useState } from 'react'
import { useDashboardStore } from '@/store/dashboard'
import { personas } from '@/lib/personas'
import { PersonaSelector } from './PersonaSelector'
import { MessageBubble } from './MessageBubble'
import { CFOUploadStrip } from './CFOUpload'
import { Button } from '@/components/ui/Button'
import type { ModuleKey, PersonaKey, ChatResponse } from '@/lib/types'

const moduleTitles: Record<ModuleKey, string> = {
  pitchDeck: 'Pitch Deck',
  marketingKit: 'Marketing Kit',
  investorMemo: 'Investor Memo',
  financialModel: 'Financial Model',
}

// Each persona's primary domain module for context injection
const personaModuleMap: Record<PersonaKey, ModuleKey> = {
  cfo: 'financialModel',
  cmo: 'marketingKit',
  lawyer: 'investorMemo',
}

// Build context from actual module content so personas have exact values
// (e.g. real hex codes, not prose descriptions from the summary).
function buildModuleContext(moduleKey: ModuleKey, content: string, summary: string): string {
  if (!content) return summary

  if (moduleKey === 'marketingKit') {
    try {
      const d = JSON.parse(content) as {
        tagline?: string
        brandVoice?: string[]
        brandColors?: Array<{ name: string; hex: string }>
        campusPitch?: string
        instagramPosts?: Array<{ caption: string; hashtags: string }>
        twitterPosts?: string[]
        adCopies?: Array<{ headline: string; body: string; cta: string }>
        emailSubjectLines?: string[]
      }
      const lines: string[] = []
      if (d.tagline) lines.push(`Tagline: "${d.tagline}"`)
      if (d.brandVoice?.length) lines.push(`Brand Voice: ${d.brandVoice.join(', ')}`)
      if (d.brandColors?.length)
        lines.push(`Brand Colors: ${d.brandColors.map((c) => `${c.name} ${c.hex}`).join(', ')}`)
      if (d.campusPitch) lines.push(`Campus Pitch: "${d.campusPitch.slice(0, 150)}"`)
      if (d.instagramPosts?.length) {
        lines.push(`Instagram Posts (${d.instagramPosts.length}):`)
        d.instagramPosts.forEach((p, i) =>
          lines.push(`  ${i + 1}. "${p.caption}" ${p.hashtags}`)
        )
      }
      if (d.twitterPosts?.length) {
        lines.push(`Twitter/X Posts: ${d.twitterPosts.slice(0, 3).map((t) => `"${t}"`).join(' | ')}`)
      }
      if (d.adCopies?.length) {
        lines.push(`Ad Copies: ${d.adCopies.map((a) => `"${a.headline}" — ${a.body}`).join(' | ')}`)
      }
      if (d.emailSubjectLines?.length) {
        lines.push(`Email Subject Lines: ${d.emailSubjectLines.slice(0, 3).join(' | ')}`)
      }
      return lines.length ? lines.join('\n') : summary
    } catch {
      return summary
    }
  }

  if (moduleKey === 'pitchDeck') {
    try {
      const d = JSON.parse(content) as { slides?: Array<{ title: string; bullets?: string[] }> }
      return (d.slides ?? [])
        .map((s) => `${s.title}: ${(s.bullets ?? []).slice(0, 2).join('; ')}`)
        .join('\n')
    } catch {
      return summary
    }
  }

  if (moduleKey === 'financialModel') {
    try {
      const d = JSON.parse(content) as {
        key_metrics?: { total_y1_revenue?: number; operating_profit?: number; break_even_month?: number; ltv_cac_ratio?: string }
        unit_economics?: { avg_loan_size?: number; default_rate?: number; cac?: number; ltv?: number }
        funding?: { total_ask?: string }
      }
      const lines: string[] = []
      const km = d.key_metrics
      const ue = d.unit_economics
      if (km?.total_y1_revenue) lines.push(`Total Y1 Revenue: ₦${(km.total_y1_revenue / 1_000_000).toFixed(1)}M`)
      if (km?.operating_profit !== undefined) lines.push(`Operating Profit: ₦${(km.operating_profit / 1_000_000).toFixed(1)}M`)
      if (km?.break_even_month) lines.push(`Break-even: Month ${km.break_even_month}`)
      if (km?.ltv_cac_ratio) lines.push(`LTV:CAC Ratio: ${km.ltv_cac_ratio}`)
      if (ue?.avg_loan_size) lines.push(`Avg Loan Size: ₦${ue.avg_loan_size.toLocaleString()}`)
      if (ue?.default_rate !== undefined) lines.push(`Default Rate: ${ue.default_rate}%`)
      if (ue?.cac) lines.push(`CAC: ₦${ue.cac.toLocaleString()}`)
      if (ue?.ltv) lines.push(`LTV: ₦${ue.ltv.toLocaleString()}`)
      if (d.funding?.total_ask) lines.push(`Funding Ask: ${d.funding.total_ask}`)
      return lines.length ? lines.join('\n') : summary
    } catch {
      return summary
    }
  }

  // Markdown modules — send first 800 chars of actual content
  return content.length <= 800 ? content : `${content.slice(0, 800)}...`
}

interface ChatPanelProps {
  onModuleUpdate: (key: ModuleKey, content: string | object) => void
}

export function ChatPanel({ onModuleUpdate }: ChatPanelProps) {
  const { activePersona, messages, addMessage, cfoUnlocked, cfoContext, idea, modules } =
    useDashboardStore()

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const persona = personas[activePersona]
  const currentMessages = messages[activePersona]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, isLoading])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage = { role: 'user' as const, content: trimmed, persona: activePersona }
    addMessage(activePersona, userMessage)
    setInput('')
    setIsLoading(true)

    // Last 6 messages including the new one
    const contextMessages = [...currentMessages, userMessage].slice(-6)

    // Build context from actual module content (not prose summary) so personas
    // have exact values like hex codes to answer specific questions correctly.
    const domainModule = modules[personaModuleMap[activePersona]]
    const moduleSummary = buildModuleContext(
      personaModuleMap[activePersona],
      domainModule?.content ?? '',
      domainModule?.summary ?? ''
    )
    const context = { startupIdea: idea, moduleSummary }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: activePersona,
          messages: contextMessages,
          context,
          ...(activePersona === 'cfo' && cfoContext ? { cfoContext } : {}),
        }),
      })

      if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)

      const data = (await res.json()) as ChatResponse

      addMessage(activePersona, {
        role: 'assistant',
        content: data.response,
        persona: activePersona,
      })

      if (data.module_update?.target && data.module_update.content != null) {
        onModuleUpdate(data.module_update.target, data.module_update.content as string | object)
        showToast(
          `${persona.name} updated your ${moduleTitles[data.module_update.target] ?? data.module_update.target}.`
        )
      }
    } catch {
      addMessage(activePersona, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        persona: activePersona,
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-8 py-10 max-w-3xl mx-auto relative">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-[#1C1612] text-white text-sm shadow-lg">
          {toast}
        </div>
      )}

      {/* Page heading */}
      <div className="mb-6 shrink-0">
        <h1 className="text-xl font-semibold text-[#1C1612]">Co-Founders</h1>
        <p className="text-sm text-[#8C7B6B] mt-1">Chat with your AI co-founders</p>
      </div>

      {/* Persona tabs */}
      <div className="mb-4 shrink-0">
        <PersonaSelector />
      </div>

      {/* Active persona display */}
      <div className="flex items-center gap-2.5 mb-5 shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: `${persona.color}20`, color: persona.color }}
        >
          {persona.avatar}
        </div>
        <span className="text-sm font-medium text-[#1C1612]">{persona.name}</span>
        <span className="text-sm text-[#8C7B6B]">· {persona.role}</span>
      </div>

      {/* Messages */}
      <>
          <div className="flex-1 rounded-2xl bg-[#EDE8DF] border border-[#D9D0C3] overflow-y-auto px-5 py-5 flex flex-col gap-3 min-h-[400px]">
            {currentMessages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-16">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${persona.color}15` }}
                >
                  {persona.avatar}
                </div>
                <p className="text-xs text-[#8C7B6B]">
                  {`Ask ${persona.name} anything about your startup`}
                </p>
              </div>
            )}

            {currentMessages.map((msg, i) => (
              <MessageBubble key={i} message={msg} activePersona={activePersona} />
            ))}

            {/* Loading indicator while waiting for response */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: `${persona.color}20`, color: persona.color }}
                >
                  {persona.avatar}
                </div>
                <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#E8E0D0] border border-[#D9D0C3]">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-[#8C7B6B]/40 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="mt-3 shrink-0">
            {activePersona === 'cfo' && <CFOUploadStrip />}
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${persona.name} something...`}
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none rounded-xl border border-[#D9D0C3] bg-[#E8E0D0] px-3 py-2.5 text-sm text-[#1C1612] placeholder:text-[#8C7B6B]/60 focus:outline-none focus:ring-2 focus:ring-[#6B4C35]/25 transition-all duration-200 disabled:opacity-50"
                style={{ maxHeight: '80px' }}
              />
              <Button
                size="sm"
                loading={isLoading}
                disabled={!input.trim()}
                onClick={sendMessage}
                className="shrink-0"
              >
                Send
              </Button>
            </div>
            <p className="text-[10px] text-[#8C7B6B]/60 mt-1.5">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
      </>
    </div>
  )
}
