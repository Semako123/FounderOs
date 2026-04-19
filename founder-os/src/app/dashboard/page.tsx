'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardStore } from '@/store/dashboard'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ChatPanel } from '@/components/chat/ChatPanel'
import type { ModuleKey } from '@/lib/types'

export default function Dashboard() {
  const router = useRouter()
  const { idea, setModule, reset } = useDashboardStore()
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<ModuleKey>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && !idea) {
      router.replace('/')
    }
  }, [hydrated, idea, router])

  const handleModuleUpdate = useCallback(
    (key: ModuleKey, content: string) => {
      setModule(key, { content, updatedAt: Date.now() })
      setRecentlyUpdated((prev) => new Set([...prev, key]))
      setTimeout(() => {
        setRecentlyUpdated((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }, 3000)
    },
    [setModule]
  )

  if (!hydrated) return null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="border-b border-white/[0.05] px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-bold">F</div>
          <span className="text-xs font-semibold text-white/70">FounderOS</span>
        </div>
        <div className="flex items-center gap-3">
          {idea && (
            <p className="text-xs text-white/25 max-w-xs truncate hidden sm:block">
              {idea}
            </p>
          )}
          <button
            onClick={() => { reset(); router.push('/') }}
            className="text-xs text-white/25 hover:text-white/50 transition-colors"
          >
            New idea →
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 sm:p-6 min-h-0 overflow-hidden">
        {/* Left: Module grid */}
        <div className="flex-1 min-w-0">
          <DashboardShell recentlyUpdated={recentlyUpdated} />
        </div>

        {/* Right: Chat panel */}
        <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 h-[500px] lg:h-auto">
          <ChatPanel onModuleUpdate={handleModuleUpdate} />
        </div>
      </div>
    </div>
  )
}
