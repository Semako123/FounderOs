export type ModuleKey = 'pitchDeck' | 'marketingKit' | 'investorMemo' | 'financialModel'
export type PersonaKey = 'cfo' | 'cmo' | 'lawyer'

export interface Module {
  key: ModuleKey
  title: string
  content: string
  loading: boolean
  updatedAt?: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  persona?: PersonaKey
}

export interface GenerateResponse {
  pitchDeck: string
  marketingKit: string
  investorMemo: string
  financialModel: string
}

export interface ChatRequest {
  persona: PersonaKey
  messages: Message[]
  cfoContext?: string
}

export interface ModuleUpdate {
  module: ModuleKey
  content: string
}
