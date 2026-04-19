'use client'

import { useEffect, useRef, useState } from 'react'
import { useDashboardStore } from '@/store/dashboard'
import { personas } from '@/lib/personas'
import { PersonaSelector } from './PersonaSelector'
import { MessageBubble } from './MessageBubble'
import { CFOUpload } from './CFOUpload'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ModuleKey } from '@/lib/types'

interface ChatPanelProps {
  onModuleUpdate: (key: ModuleKey, content: string) => void
}

export function ChatPanel({ onModuleUpdate }: ChatPanelProps) {
  const {
    activePersona,
    messages,
    addMessage,
    cfoUnlocked,
    cfoContext,
    idea,
  } = useDashboardStore()

  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const persona = personas[activePersona]
  const currentMessages = messages[activePersona]
  const isLocked = activePersona === 'cfo' && !cfoUnlocked

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, streamingText])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || streaming) return

    const userMessage = { role: 'user' as const, content: trimmed, persona: activePersona }
    addMessage(activePersona, userMessage)
    setInput('')
    setStreaming(true)
    setStreamingText('')

    const contextMessages = [...currentMessages, userMessage]

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: activePersona,
          messages: contextMessages,
          ...(activePersona === 'cfo' && cfoContext ? { cfoContext } : {}),
          ...(idea ? { idea } : {}),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Chat failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'text') {
              fullText += data.text
              setStreamingText(fullText)
            } else if (data.type === 'module_update') {
              onModuleUpdate(data.module as ModuleKey, data.content)
            } else if (data.type === 'done') {
              addMessage(activePersona, { role: 'assistant', content: fullText, persona: activePersona })
              setStreamingText('')
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }
    } catch {
      addMessage(activePersona, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        persona: activePersona,
      })
      setStreamingText('')
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: `${persona.color}20`, color: persona.color }}
          >
            {persona.avatar}
          </div>
          <span className="text-xs font-medium text-white/80">{persona.name}</span>
          <span className="text-xs text-white/25">· {persona.role}</span>
        </div>
        <PersonaSelector />
      </div>

      {/* Messages or locked state */}
      {isLocked ? (
        <CFOUpload />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
            {currentMessages.length === 0 && !streaming && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${persona.color}15` }}
                >
                  {persona.avatar}
                </div>
                <p className="text-xs text-white/30">
                  {`Ask ${persona.name} anything about your startup`}
                </p>
              </div>
            )}

            {currentMessages.map((msg, i) => (
              <MessageBubble key={i} message={msg} activePersona={activePersona} />
            ))}

            {streaming && streamingText && (
              <MessageBubble
                message={{ role: 'assistant', content: streamingText }}
                activePersona={activePersona}
              />
            )}

            {streaming && !streamingText && (
              <div className="flex gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: `${persona.color}20`, color: persona.color }}
                >
                  {persona.avatar}
                </div>
                <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.05]">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-white/30 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/[0.05] shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${persona.name} something...`}
                rows={1}
                disabled={streaming}
                className="flex-1 resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 disabled:opacity-50"
                style={{ maxHeight: '80px' }}
              />
              <Button
                size="sm"
                loading={streaming}
                disabled={!input.trim()}
                onClick={sendMessage}
                className="shrink-0"
              >
                Send
              </Button>
            </div>
            <p className="text-[10px] text-white/15 mt-1.5">Enter to send · Shift+Enter for newline</p>
          </div>
        </>
      )}
    </Card>
  )
}
