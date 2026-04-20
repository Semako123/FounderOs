'use client'

import type { ViewKey } from '@/lib/types'

interface SidebarProps {
  activeView: ViewKey
  onViewChange: (view: ViewKey) => void
  idea: string
  onReset: () => void
}

const NAV_ITEMS: { key: ViewKey; label: string; icon: string }[] = [
  { key: 'pitchDeck',      label: 'Pitch Deck',      icon: '◈' },
  { key: 'marketingKit',   label: 'Marketing Kit',   icon: '◉' },
  { key: 'investorMemo',   label: 'Investor Memo',   icon: '◎' },
  { key: 'financialModel', label: 'Financial Model', icon: '▣' },
  { key: 'coFounders',     label: 'Co-Founders',     icon: '◭' },
]

export function Sidebar({ activeView, onViewChange, idea, onReset }: SidebarProps) {
  return (
    <aside className="w-[220px] shrink-0 h-screen flex flex-col bg-[#EDE8DF] border-r border-[#D9D0C3]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#D9D0C3]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6B4C35] flex items-center justify-center text-xs font-bold text-white">
            F
          </div>
          <span className="text-sm font-semibold text-[#1C1612]">FounderOS</span>
        </div>
        {idea && (
          <p className="text-[11px] text-[#8C7B6B] mt-2.5 leading-relaxed line-clamp-2">{idea}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon }, index) => {
          const isActive = activeView === key
          const isCoFounders = key === 'coFounders'

          return (
            <div key={key}>
              {isCoFounders && (
                <div className="h-px bg-[#D9D0C3] my-2" />
              )}
              <button
                onClick={() => onViewChange(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-[#6B4C35] text-white'
                    : 'text-[#8C7B6B] hover:bg-[#E8E0D0] hover:text-[#1C1612]'
                }`}
              >
                <span className={`text-base leading-none ${isActive ? 'text-white' : 'text-[#6B4C35]'}`}>
                  {icon}
                </span>
                <span className="font-medium">{label}</span>
              </button>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#D9D0C3]">
        <button
          onClick={onReset}
          className="text-xs text-[#8C7B6B] hover:text-[#6B4C35] transition-colors"
        >
          ← New idea
        </button>
      </div>
    </aside>
  )
}
