'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardStore } from '@/store/dashboard'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ChatPanel } from '@/components/chat/ChatPanel'
import type { ModuleKey } from '@/lib/types'

type MobileTab = 'modules' | 'chat'

export default function Dashboard() {
  const router = useRouter()
  const { idea, setModule, reset } = useDashboardStore()
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<ModuleKey>>(new Set())
  const [hydrated, setHydrated] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>('modules')

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
      // Switch to modules tab on mobile so user sees the update
      setMobileTab('modules')
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
    <div className="h-screen flex flex-col overflow-hidden">
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

      {/* Mobile tabs */}
      <div className="flex lg:hidden border-b border-white/[0.05] shrink-0">
        {(['modules', 'chat'] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${
              mobileTab === tab
                ? 'text-white border-b border-indigo-500'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            {tab === 'modules' ? 'Startup Kit' : 'AI Co-Founders'}
            {tab === 'modules' && recentlyUpdated.size > 0 && (
              <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row gap-4 p-4 sm:p-6">
        {/* Module grid — hidden on mobile when chat tab active */}
        <div className={`flex-1 min-w-0 overflow-y-auto ${mobileTab === 'chat' ? 'hidden lg:block' : ''}`}>
          <DashboardShell recentlyUpdated={recentlyUpdated} />
        </div>

        {/* Chat panel — hidden on mobile when modules tab active */}
        <div className={`w-full lg:w-[340px] xl:w-[380px] shrink-0 ${mobileTab === 'modules' ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <ChatPanel onModuleUpdate={handleModuleUpdate} />
        </div>
      </div>
    </div>
  )
}
