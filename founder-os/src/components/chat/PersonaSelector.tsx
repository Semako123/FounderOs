'use client'

import { useDashboardStore } from '@/store/dashboard'
import { personas } from '@/lib/personas'
import type { PersonaKey } from '@/lib/types'

const PERSONA_ORDER: PersonaKey[] = ['cmo', 'lawyer', 'cfo']

export function PersonaSelector() {
  const { activePersona, setActivePersona, cfoUnlocked } = useDashboardStore()

  return (
    <div className="flex gap-1">
      {PERSONA_ORDER.map((key) => {
        const persona = personas[key]
        const isLocked = key === 'cfo' && !cfoUnlocked
        const isActive = activePersona === key

        return (
          <button
            key={key}
            onClick={() => setActivePersona(key)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/[0.08] text-white'
                : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{
                backgroundColor: isActive ? `${persona.color}30` : 'transparent',
                color: isActive ? persona.color : 'currentColor',
              }}
            >
              {isLocked ? '🔒' : persona.avatar}
            </span>
            <span>{persona.role}</span>
          </button>
        )
      })}
    </div>
  )
}
