'use client'

import { useRef, useState } from 'react'
import { useDashboardStore } from '@/store/dashboard'

// Compact strip shown above the CFO input — attach is optional, not a gate.
export function CFOUploadStrip() {
  const { cfoUnlocked, cfoContext, unlockCFO } = useDashboardStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function processFile(file: File) {
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json() as { content?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      unlockCFO(data.content ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  if (cfoUnlocked && cfoContext) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-xs text-[#10b981] mb-2">
        <span>📎</span>
        <span className="flex-1 truncate">Financial document attached</span>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-[#10b981]/70 hover:text-[#10b981] transition-colors underline underline-offset-2"
        >
          Replace
        </button>
        <input ref={inputRef} type="file" accept=".txt,.csv,.pdf,application/json" onChange={handleInput} className="hidden" />
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#E8E0D0] border border-[#D9D0C3] text-xs text-[#8C7B6B] mb-2"
    >
      <span className="opacity-50">📎</span>
      <span className="flex-1">Attach a financial document for deeper analysis</span>
      {loading ? (
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-[#6B4C35] hover:text-[#1C1612] font-medium transition-colors underline underline-offset-2"
        >
          Attach
        </button>
      )}
      {error && <span className="text-red-500/80 ml-1">{error}</span>}
      <input ref={inputRef} type="file" accept=".txt,.csv,.pdf,application/json" onChange={handleInput} className="hidden" />
    </div>
  )
}
