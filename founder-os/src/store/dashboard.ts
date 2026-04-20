'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModuleKey, PersonaKey, Module, Message } from '@/lib/types'

const defaultModules: Record<ModuleKey, Module> = {
  pitchDeck: { key: 'pitchDeck', title: 'Pitch Deck', content: '', summary: '', loading: false },
  marketingKit: { key: 'marketingKit', title: 'Marketing Kit', content: '', summary: '', loading: false },
  investorMemo: { key: 'investorMemo', title: 'Investor Memo', content: '', summary: '', loading: false },
  financialModel: { key: 'financialModel', title: 'Financial Model', content: '', summary: '', loading: false },
}

interface DashboardStore {
  idea: string
  modules: Record<ModuleKey, Module>
  messages: Record<PersonaKey, Message[]>
  activePersona: PersonaKey
  cfoUnlocked: boolean
  cfoContext: string
  generating: boolean
  setIdea: (idea: string) => void
  setModule: (key: ModuleKey, patch: Partial<Module>) => void
  addMessage: (persona: PersonaKey, message: Message) => void
  setActivePersona: (persona: PersonaKey) => void
  unlockCFO: (context: string) => void
  setGenerating: (generating: boolean) => void
  reset: () => void
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      idea: '',
      modules: defaultModules,
      messages: { cfo: [], cmo: [], lawyer: [] },
      activePersona: 'cmo',
      cfoUnlocked: false,
      cfoContext: '',
      generating: false,

      setIdea: (idea) => set({ idea }),

      setModule: (key, patch) =>
        set((state) => ({
          modules: {
            ...state.modules,
            [key]: { ...state.modules[key], ...patch },
          },
        })),

      addMessage: (persona, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [persona]: [...state.messages[persona], message],
          },
        })),

      setActivePersona: (persona) => set({ activePersona: persona }),

      unlockCFO: (context) => set({ cfoUnlocked: true, cfoContext: context }),

      setGenerating: (generating) => set({ generating }),

      reset: () =>
        set({
          idea: '',
          modules: defaultModules,
          messages: { cfo: [], cmo: [], lawyer: [] },
          activePersona: 'cmo',
          cfoUnlocked: false,
          cfoContext: '',
          generating: false,
        }),
    }),
    {
      name: 'founder-os-store',
      partialize: (state) => ({
        idea: state.idea,
        cfoUnlocked: state.cfoUnlocked,
        cfoContext: state.cfoContext,
        modules: state.modules,
      }),
    }
  )
)
