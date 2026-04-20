'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useDashboardStore } from '@/store/dashboard'
import type { ModuleKey, GenerateResponse } from '@/lib/types'

export function IdeaForm() {
  const router = useRouter()
  const { setIdea, setModule, setGenerating } = useDashboardStore()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const moduleKeys: ModuleKey[] = ['pitchDeck', 'marketingKit', 'investorMemo', 'financialModel']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim().length < 10) {
      setError('Please describe your idea in at least a few sentences.')
      return
    }

    setError('')
    setLoading(true)
    setGenerating(true)
    setIdea(value.trim())

    // Pre-set loading state on all modules
    moduleKeys.forEach((key) => setModule(key, { loading: true, content: '', summary: '' }))

    router.push('/dashboard')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: value.trim() }),
      })

      if (!res.ok) throw new Error('Generation failed')

      const data: GenerateResponse = await res.json()

      setModule('pitchDeck', {
        content: data.pitchDeck,
        summary: data.summaries.pitchDeck,
        loading: false,
        updatedAt: Date.now(),
      })
      setModule('marketingKit', {
        content: data.marketingKit,
        summary: data.summaries.marketingKit,
        loading: false,
        updatedAt: Date.now(),
      })
      setModule('investorMemo', {
        content: data.investorMemo,
        summary: data.summaries.investorMemo,
        loading: false,
        updatedAt: Date.now(),
      })
      setModule('financialModel', {
        content: data.financialModel,
        summary: data.summaries.financialModel,
        loading: false,
        updatedAt: Date.now(),
      })
    } catch {
      moduleKeys.forEach((key) => setModule(key, { loading: false, content: '', summary: '' }))
      setError('Something went wrong generating your startup kit. Please try again.')
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe your startup idea... e.g. 'An AI-powered tool that helps indie founders write investor-ready pitch decks in under 10 minutes, by asking smart questions and using Claude to draft professional content.'"
          rows={5}
          disabled={loading}
          className="w-full resize-none rounded-xl border border-[#D9D0C3] bg-[#EDE8DF] px-4 py-3.5 text-sm text-[#1C1612] placeholder:text-[#8C7B6B]/60 focus:outline-none focus:ring-2 focus:ring-[#6B4C35]/30 transition-all duration-200 disabled:opacity-50"
        />
        <div className="absolute bottom-3 right-3 text-xs text-[#8C7B6B]/60">
          {value.length} chars
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600/80">{error}</p>
      )}

      <Button type="submit" size="lg" loading={loading} className="self-end">
        {loading ? 'Generating...' : 'Generate My Startup →'}
      </Button>
    </form>
  )
}
