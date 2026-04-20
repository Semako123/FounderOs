import type { PitchSlide, PitchDeckData, SlideType } from './types'

const HEADING_TO_TYPE: [string, SlideType][] = [
  ['problem', 'problem'],
  ['solution', 'solution'],
  ['market', 'market'],
  ['business model', 'businessModel'],
  ['business', 'businessModel'],
  ['traction', 'traction'],
  ['milestone', 'traction'],
  ['team', 'team'],
  ['ask', 'ask'],
  ['raise', 'ask'],
  ['fund', 'ask'],
]

export function parseContent(content: string): PitchSlide[] {
  if (!content?.trim()) return []

  // Direct JSON parse
  try {
    const data = JSON.parse(content) as PitchDeckData
    if (Array.isArray(data.slides) && data.slides.length > 0) return data.slides
  } catch {}

  // Extract JSON object from mixed text
  try {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start !== -1 && end > start) {
      const data = JSON.parse(content.slice(start, end + 1)) as PitchDeckData
      if (Array.isArray(data.slides) && data.slides.length > 0) return data.slides
    }
  } catch {}

  // Markdown fallback
  return markdownToSlides(content)
}

export function slidesToContent(slides: PitchSlide[]): string {
  return JSON.stringify({ slides })
}

function detectType(heading: string): SlideType {
  const lower = heading.toLowerCase()
  for (const [keyword, type] of HEADING_TO_TYPE) {
    if (lower.includes(keyword)) return type
  }
  return 'problem'
}

export function markdownToSlides(markdown: string): PitchSlide[] {
  const lines = markdown.split('\n')
  const slides: PitchSlide[] = []
  let current: Partial<PitchSlide> | null = null
  let idCounter = 0

  const flush = () => {
    if (current?.title) slides.push(current as PitchSlide)
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('# ')) {
      flush()
      const title = trimmed.slice(2).trim()
      idCounter++
      current = { id: String(idCounter), type: detectType(title), title, bullets: [] }
    } else if (current && (trimmed.startsWith('- ') || trimmed.startsWith('* '))) {
      current.bullets = current.bullets ?? []
      current.bullets.push(trimmed.slice(2).trim())
    } else if (current && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
      if (!current.subtitle) current.subtitle = trimmed
    }
  }
  flush()

  if (slides.length > 0 && slides[0].type === 'problem') {
    slides[0] = { ...slides[0], type: 'title', tagline: slides[0].subtitle }
  }

  return slides
}
