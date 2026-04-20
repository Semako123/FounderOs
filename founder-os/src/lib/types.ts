export type ModuleKey = 'pitchDeck' | 'marketingKit' | 'investorMemo' | 'financialModel'

export type SlideType = 'title' | 'problem' | 'solution' | 'market' | 'businessModel' | 'traction' | 'team' | 'ask'

export interface PitchSlide {
  id: string
  type: SlideType
  title: string
  subtitle?: string
  tagline?: string
  bullets?: string[]
}

export interface PitchDeckData {
  slides: PitchSlide[]
}

export type PersonaKey = 'cfo' | 'cmo' | 'lawyer'
export type ViewKey = 'pitchDeck' | 'marketingKit' | 'investorMemo' | 'financialModel' | 'coFounders'

export interface Module {
  key: ModuleKey
  title: string
  content: string
  summary: string
  loading: boolean
  updatedAt?: number
}

export interface ModuleSummaries {
  pitchDeck: string
  marketingKit: string
  investorMemo: string
  financialModel: string
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
  summaries: ModuleSummaries
}

export interface ChatContext {
  startupIdea: string
  moduleSummary: string
}

export interface ChatRequest {
  persona: PersonaKey
  messages: Message[]
  context: ChatContext
  cfoContext?: string
}

export interface ChatResponse {
  response: string
  module_update?: {
    target: ModuleKey
    content: unknown
  }
}
