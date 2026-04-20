'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardStore } from '@/store/dashboard'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ModulePageView } from '@/components/dashboard/ModuleCard'
import { PitchDeckView } from '@/components/dashboard/PitchDeckView'
import { MarketingKitView } from '@/components/dashboard/MarketingKitView'
import { InvestorMemoView } from '@/components/dashboard/InvestorMemoView'
import { FinancialModelView } from '@/components/dashboard/FinancialModelView'
import { ChatPanel } from '@/components/chat/ChatPanel'
import type { ModuleKey, ViewKey } from '@/lib/types'

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    const sv = source[key]
    const tv = target[key]
    if (sv !== null && typeof sv === 'object' && !Array.isArray(sv) &&
        tv !== null && typeof tv === 'object' && !Array.isArray(tv)) {
      result[key] = deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>)
    } else {
      result[key] = sv
    }
  }
  return result
}

export default function Dashboard() {
  const router = useRouter()
  const { idea, setModule, reset } = useDashboardStore()
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<ModuleKey>>(new Set())
  const [hydrated, setHydrated] = useState(false)
  const [activeView, setActiveView] = useState<ViewKey>('pitchDeck')

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && !idea) {
      router.replace('/')
    }
  }, [hydrated, idea, router])

  const handleModuleUpdate = useCallback(
    (key: ModuleKey, content: string | object) => {
      let contentStr: string
      if (typeof content === 'object' && content !== null) {
        // Merge into existing JSON so a partial AI update (e.g. only brandColors)
        // doesn't wipe out the rest of the module.
        try {
          const existing = JSON.parse(
            useDashboardStore.getState().modules[key].content || '{}'
          ) as Record<string, unknown>
          contentStr = JSON.stringify(deepMerge(existing, content as Record<string, unknown>))
        } catch {
          contentStr = JSON.stringify(content)
        }
      } else {
        contentStr = content as string
      }
      setModule(key, { content: contentStr, updatedAt: Date.now() })
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
    <div className="h-screen flex overflow-hidden bg-[#FAF8F5]">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        idea={idea}
        onReset={() => { reset(); router.push('/') }}
      />

      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {activeView === 'coFounders' ? (
          <div className="flex-1 overflow-y-auto">
            <ChatPanel onModuleUpdate={handleModuleUpdate} />
          </div>
        ) : activeView === 'pitchDeck' ? (
          <PitchDeckView updated={recentlyUpdated.has('pitchDeck')} />
        ) : activeView === 'marketingKit' ? (
          <div className="flex-1 overflow-y-auto">
            <MarketingKitView updated={recentlyUpdated.has('marketingKit')} />
          </div>
        ) : activeView === 'investorMemo' ? (
          <div className="flex-1 overflow-y-auto">
            <InvestorMemoView updated={recentlyUpdated.has('investorMemo')} />
          </div>
        ) : activeView === 'financialModel' ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <FinancialModelView updated={recentlyUpdated.has('financialModel')} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ModulePageView
              moduleKey={activeView}
              recentlyUpdated={recentlyUpdated}
            />
          </div>
        )}
      </main>
    </div>
  )
}
