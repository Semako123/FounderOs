'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useDashboardStore } from '@/store/dashboard'

export function CFOUpload() {
  const { unlockCFO } = useDashboardStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function processFile(file: File) {
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')
      unlockCFO(data.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4 py-8 text-center">
      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xl">
        🔒
      </div>
      <div>
        <p className="text-sm font-medium text-white/80">CFO is locked</p>
        <p className="text-xs text-white/30 mt-1">Upload a financial document to unlock Alex (CFO)</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full border rounded-xl p-6 transition-all duration-200 cursor-pointer ${
          dragging
            ? 'border-indigo-500/60 bg-indigo-500/5'
            : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-xs text-white/30">Drop a .txt, .csv, or .pdf file here</p>
        <p className="text-xs text-white/20 mt-1">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.csv,.pdf,application/json"
          onChange={handleInput}
          className="hidden"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Processing document...
        </div>
      )}

      {error && <p className="text-xs text-red-400/70">{error}</p>}

      <Button
        variant="outline"
        size="sm"
        loading={loading}
        onClick={() => inputRef.current?.click()}
      >
        Upload Financial Document
      </Button>
    </div>
  )
}
