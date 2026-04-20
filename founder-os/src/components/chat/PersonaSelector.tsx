'use client'

import { useDashboardStore } from '@/store/dashboard'
import { personas } from '@/lib/personas'
import type { PersonaKey } from '@/lib/types'

const PERSONA_ORDER: PersonaKey[] = ['cmo', 'lawyer', 'cfo']

export function PersonaSelector() {
  const { activePersona, setActivePersona, cfoUnlocked } = useDashboardStore()

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-[#E8E0D0] border border-[#D9D0C3] shrink-0">
      {PERSONA_ORDER.map((key) => {
        const persona = personas[key]
        const isLocked = key === 'cfo' && !cfoUnlocked
        const isActive = activePersona === key

        return (
          <button
            key={key}
            onClick={() => setActivePersona(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white shadow-sm text-[#1C1612]'
                : 'text-[#8C7B6B] hover:text-[#1C1612]'
            }`}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                backgroundColor: isActive ? `${persona.color}20` : 'transparent',
                color: isActive ? persona.color : 'currentColor',
              }}
            >
              {isLocked ? '🔒' : persona.avatar}
            </span>
            <span>{isLocked ? 'CFO' : persona.name}</span>
          </button>
        )
      })}
    </div>
  )
}
