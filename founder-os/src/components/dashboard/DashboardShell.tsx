'use client'

import { useDashboardStore } from '@/store/dashboard'
import { ModuleCard } from './ModuleCard'
import type { ModuleKey } from '@/lib/types'

const MODULE_ORDER: ModuleKey[] = ['pitchDeck', 'marketingKit', 'investorMemo', 'financialModel']

interface DashboardShellProps {
  recentlyUpdated: Set<ModuleKey>
}

export function DashboardShell({ recentlyUpdated }: DashboardShellProps) {
  const modules = useDashboardStore((s) => s.modules)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {MODULE_ORDER.map((key) => (
        <ModuleCard
          key={key}
          module={modules[key]}
          updated={recentlyUpdated.has(key)}
        />
      ))}
    </div>
  )
}
