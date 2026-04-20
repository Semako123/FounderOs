'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDashboardStore } from '@/store/dashboard'
import { parseContent, slidesToContent } from '@/lib/pitchDeckUtils'
import type { PitchSlide, SlideType } from '@/lib/types'

interface SlideStyle {
  bg: string
  heading: string
  accent: string
  text: string
  muted: string
}

const SLIDE_STYLES: Record<SlideType, SlideStyle> = {
  title:         { bg: '#3D2314', heading: '#F5ECD5', accent: '#C4A882', text: '#E8D5B7', muted: '#9A7A5A' },
  problem:       { bg: '#FAF8F5', heading: '#8B2500', accent: '#8B2500', text: '#2D1A0F', muted: '#7A6555' },
  solution:      { bg: '#F5FAF7', heading: '#1A4731', accent: '#2D7A4F', text: '#1C1612', muted: '#5A7A6A' },
  market:        { bg: '#F5F8FC', heading: '#0F2D5A', accent: '#1E5FA8', text: '#1C1612', muted: '#4A6A8A' },
  businessModel: { bg: '#EDE8DF', heading: '#3D2314', accent: '#6B4C35', text: '#1C1612', muted: '#8C7B6B' },
  traction:      { bg: '#FBF6EA', heading: '#7B4A00', accent: '#B87A20', text: '#1C1612', muted: '#8C7A4A' },
  team:          { bg: '#F8F5F0', heading: '#1C1612', accent: '#6B4C35', text: '#2D1A0F', muted: '#8C7B6B' },
  ask:           { bg: '#1C1612', heading: '#F5ECD5', accent: '#C4A882', text: '#E8D5B7', muted: '#6A5A4A' },
}

function SlideView({
  slide,
  editable,
  onUpdate,
}: {
  slide: PitchSlide
  editable?: boolean
  onUpdate?: (patch: Partial<PitchSlide>) => void
}) {
  const s = SLIDE_STYLES[slide.type] ?? SLIDE_STYLES.problem
  const bullets = slide.bullets ?? []

  const editableProps = (
    field: keyof PitchSlide,
    bulletIdx?: number,
  ): React.HTMLAttributes<HTMLElement> => {
    if (!editable) return {}
    return {
      contentEditable: true,
      suppressContentEditableWarning: true,
      className: 'outline-none cursor-text hover:bg-black/5 rounded px-0.5 -mx-0.5 transition-colors font-normal antialiased',
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        if (!onUpdate) return
        const val = e.currentTarget.textContent ?? ''
        if (bulletIdx !== undefined) {
          const next = [...(slide.bullets ?? [])]
          next[bulletIdx] = val
          onUpdate({ bullets: next })
        } else {
          onUpdate({ [field]: val })
        }
      },
    }
  }

  // Shared slide header used by most types
  const slideHeader = (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 20, marginBottom: 24, borderBottom: `1px solid ${s.accent}30` }}>
      <div style={{ width: 5, height: 42, backgroundColor: s.accent, borderRadius: 3, flexShrink: 0, marginTop: 3 }} />
      <div style={{ fontSize: 34, fontWeight: 800, color: s.heading, lineHeight: 1.1, letterSpacing: '-0.01em' }}
        {...editableProps('title')}>
        {slide.title}
      </div>
    </div>
  )

  // ── TITLE ──────────────────────────────────────────────────────────────────
  if (slide.type === 'title') {
    return (
      <div className="select-text" style={{
        width: '100%', height: '100%',
        backgroundColor: s.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '10% 14%', boxSizing: 'border-box', textAlign: 'center', position: 'relative',
        background: `radial-gradient(ellipse at 25% 75%, rgba(196,168,130,0.09) 0%, transparent 55%),
                     radial-gradient(ellipse at 75% 25%, rgba(196,168,130,0.06) 0%, transparent 55%),
                     ${s.bg}`,
      }}>
        <div style={{ position: 'absolute', top: 28, right: 36, fontSize: 11, letterSpacing: '0.18em', color: s.muted, textTransform: 'uppercase' }}>
          Confidential
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, color: s.heading, lineHeight: 1.05, letterSpacing: '-0.02em' }}
          {...editableProps('title')}>
          {slide.title}
        </div>
        <div style={{ width: 72, height: 3, backgroundColor: s.accent, margin: '22px auto 24px', borderRadius: 2 }} />
        {slide.subtitle && (
          <div style={{ fontSize: 22, fontWeight: 500, color: s.accent, lineHeight: 1.45, maxWidth: '68%' }}
            {...editableProps('subtitle')}>
            {slide.subtitle}
          </div>
        )}
        {slide.tagline && (
          <div style={{ fontSize: 14, color: s.text, lineHeight: 1.7, maxWidth: '52%', marginTop: 14, opacity: 0.75 }}
            {...editableProps('tagline')}>
            {slide.tagline}
          </div>
        )}
      </div>
    )
  }

  // ── PROBLEM ────────────────────────────────────────────────────────────────
  if (slide.type === 'problem') {
    return (
      <div className="select-text" style={{
        width: '100%', height: '100%', backgroundColor: s.bg,
        display: 'flex', flexDirection: 'column',
        padding: '6% 8%', boxSizing: 'border-box',
      }}>
        {slideHeader}
        <div style={{ flex: 1, display: 'flex', gap: '7%', alignItems: 'stretch', minHeight: 0 }}>
          {/* Left: problem statement */}
          <div style={{ flex: '0 0 42%', display: 'flex', alignItems: 'center', borderRight: `1px solid ${s.accent}20`, paddingRight: '6%' }}>
            <div style={{ fontSize: 19, fontWeight: 500, color: s.text, lineHeight: 1.65 }}
              {...editableProps('subtitle')}>
              {slide.subtitle || 'Describe the core problem here.'}
            </div>
          </div>
          {/* Right: numbered pain points */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
            {bullets.slice(0, 4).map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                  backgroundColor: s.accent, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 14, color: s.text, lineHeight: 1.6, flex: 1 }}
                  {...editableProps('bullets', i)}>
                  {b}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── SOLUTION ───────────────────────────────────────────────────────────────
  if (slide.type === 'solution') {
    return (
      <div className="select-text" style={{
        width: '100%', height: '100%', backgroundColor: s.bg,
        display: 'flex', flexDirection: 'column',
        padding: '6% 8%', boxSizing: 'border-box',
      }}>
        {slideHeader}
        {slide.subtitle && (
          <div style={{ fontSize: 15, color: s.muted, marginBottom: 22, lineHeight: 1.5 }}
            {...editableProps('subtitle')}>
            {slide.subtitle}
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', gap: 18, alignItems: 'stretch', minHeight: 0 }}>
          {bullets.slice(0, 3).map((b, i) => {
            const colonIdx = b.indexOf(':')
            const hasLabel = colonIdx > 0 && colonIdx < 40
            const label = hasLabel ? b.slice(0, colonIdx).trim() : `Feature ${i + 1}`
            const desc = hasLabel ? b.slice(colonIdx + 1).trim() : b
            return (
              <div key={i} style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 10, border: `1px solid ${s.accent}22`,
                padding: '22px 20px',
                display: 'flex', flexDirection: 'column', gap: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  backgroundColor: s.accent, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.heading, lineHeight: 1.3 }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, color: s.muted, lineHeight: 1.65, flex: 1 }}
                  {...editableProps('bullets', i)}>
                  {desc}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── MARKET ─────────────────────────────────────────────────────────────────
  if (slide.type === 'market') {
    const parseMarket = (b: string) => {
      const colonIdx = b.indexOf(':')
      if (colonIdx === -1) return { label: '', value: b, desc: '' }
      const label = b.slice(0, colonIdx).trim()
      const rest = b.slice(colonIdx + 1).trim()
      const dashIdx = rest.indexOf(' - ')
      if (dashIdx !== -1) return { label, value: rest.slice(0, dashIdx).trim(), desc: rest.slice(dashIdx + 3).trim() }
      const spaceIdx = rest.search(/\s/)
      if (spaceIdx !== -1) return { label, value: rest.slice(0, spaceIdx).trim(), desc: rest.slice(spaceIdx + 1).trim() }
      return { label, value: rest, desc: '' }
    }

    return (
      <div className="select-text" style={{
        width: '100%', height: '100%', backgroundColor: s.bg,
        display: 'flex', flexDirection: 'column',
        padding: '6% 8%', boxSizing: 'border-box',
      }}>
        {slideHeader}
        {slide.subtitle && (
          <div style={{ fontSize: 14, color: s.muted, marginBottom: 20 }}
            {...editableProps('subtitle')}>
            {slide.subtitle}
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 0 }}>
          {bullets.slice(0, 3).map((b, i) => {
            const { label, value, desc } = parseMarket(b)
            return (
              <div key={i} style={{
                flex: 1, textAlign: 'center', padding: '0 24px',
                borderRight: i < Math.min(bullets.length, 3) - 1 ? `1px solid ${s.accent}25` : 'none',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  {label || `Metric ${i + 1}`}
                </div>
                <div style={{ fontSize: 58, fontWeight: 800, color: s.heading, lineHeight: 1, letterSpacing: '-0.02em' }}
                  {...editableProps('bullets', i)}>
                  {value}
                </div>
                {desc && (
                  <div style={{ fontSize: 12, color: s.muted, marginTop: 12, lineHeight: 1.5, maxWidth: 200, margin: '12px auto 0' }}>
                    {desc}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── BUSINESS MODEL ─────────────────────────────────────────────────────────
  if (slide.type === 'businessModel') {
    return (
      <div className="select-text" style={{
        width: '100%', height: '100%', backgroundColor: s.bg,
        display: 'flex', flexDirection: 'column',
        padding: '6% 8%', boxSizing: 'border-box',
      }}>
        {slideHeader}
        {slide.subtitle && (
          <div style={{ fontSize: 14, color: s.muted, marginBottom: 22 }}
            {...editableProps('subtitle')}>
            {slide.subtitle}
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', gap: 18, alignItems: 'stretch', minHeight: 0 }}>
          {bullets.slice(0, 3).map((b, i) => {
            const colonIdx = b.indexOf(':')
            const hasLabel = colonIdx > 0 && colonIdx < 40
            const streamTitle = hasLabel ? b.slice(0, colonIdx).trim() : b
            const streamDesc = hasLabel ? b.slice(colonIdx + 1).trim() : ''
            return (
              <div key={i} style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 10, border: `1px solid ${s.accent}25`,
                borderTop: `4px solid ${s.accent}`,
                padding: '24px 20px',
                display: 'flex', flexDirection: 'column', gap: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.heading, lineHeight: 1.3 }}
                  {...editableProps('bullets', i)}>
                  {streamTitle}
                </div>
                {streamDesc && (
                  <div style={{ fontSize: 13, color: s.text, lineHeight: 1.65, opacity: 0.85, flex: 1 }}>
                    {streamDesc}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── TRACTION ───────────────────────────────────────────────────────────────
  if (slide.type === 'traction') {
    const statBullets = bullets.slice(0, Math.min(3, bullets.length))
    const listBullets = bullets.slice(statBullets.length)

    const parseStat = (b: string) => {
      const colonIdx = b.indexOf(':')
      if (colonIdx !== -1) return { label: b.slice(0, colonIdx).trim(), value: b.slice(colonIdx + 1).trim() }
      const spaceIdx = b.search(/\s/)
      if (spaceIdx !== -1) return { value: b.slice(0, spaceIdx).trim(), label: b.slice(spaceIdx + 1).trim() }
      return { label: '', value: b }
    }

    return (
      <div className="select-text" style={{
        width: '100%', height: '100%', backgroundColor: s.bg,
        display: 'flex', flexDirection: 'column',
        padding: '6% 8%', boxSizing: 'border-box',
      }}>
        {slideHeader}
        <div style={{ display: 'flex', gap: 0, marginBottom: listBullets.length > 0 ? 24 : 0, borderBottom: listBullets.length > 0 ? `1px solid ${s.accent}20` : 'none', paddingBottom: listBullets.length > 0 ? 24 : 0 }}>
          {statBullets.map((b, i) => {
            const { label, value } = parseStat(b)
            return (
              <div key={i} style={{
                flex: 1, textAlign: 'center', padding: '0 20px',
                borderRight: i < statBullets.length - 1 ? `1px solid ${s.accent}25` : 'none',
              }}>
                <div style={{ fontSize: 48, fontWeight: 600, color: s.heading, lineHeight: 1, letterSpacing: '-0.01em' }}
                  {...editableProps('bullets', i)}>
                  {value}
                </div>
                <div style={{ fontSize: 12, color: s.muted, marginTop: 8, letterSpacing: '0.04em' }}>
                  {label}
                </div>
              </div>
            )
          })}
        </div>
        {listBullets.length > 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
            {listBullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: s.accent, marginTop: 8, flexShrink: 0, opacity: 0.6 }} />
                <div style={{ fontSize: 13, color: s.text, lineHeight: 1.65, fontWeight: 400, opacity: 0.85 }}
                  {...editableProps('bullets', statBullets.length + i)}>
                  {b}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── TEAM ───────────────────────────────────────────────────────────────────
  if (slide.type === 'team') {
    return (
      <div className="select-text" style={{
        width: '100%', height: '100%', backgroundColor: s.bg,
        display: 'flex', flexDirection: 'column',
        padding: '6% 8%', boxSizing: 'border-box',
      }}>
        {slideHeader}
        {slide.subtitle && (
          <div style={{ fontSize: 14, color: s.muted, marginBottom: 20 }}
            {...editableProps('subtitle')}>
            {slide.subtitle}
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', gap: 18, alignItems: 'stretch', flexWrap: 'wrap', minHeight: 0 }}>
          {bullets.slice(0, 4).map((b, i) => {
            const sep = b.includes(' - ') ? ' - ' : b.includes(': ') ? ': ' : b.includes(',') ? ', ' : null
            const name = sep ? b.slice(0, b.indexOf(sep)).trim() : b
            const role = sep ? b.slice(b.indexOf(sep) + sep.length).trim() : ''
            return (
              <div key={i} style={{
                flex: '1 1 calc(25% - 14px)', minWidth: 140,
                backgroundColor: '#fff',
                borderRadius: 10, border: `1px solid ${s.accent}22`,
                borderTop: `3px solid ${s.accent}`,
                padding: '20px 18px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  backgroundColor: s.accent + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 4,
                }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: s.accent }}>
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.heading, lineHeight: 1.2 }}
                  {...editableProps('bullets', i)}>
                  {name}
                </div>
                {role && (
                  <div style={{ fontSize: 12, color: s.muted, lineHeight: 1.5 }}>
                    {role}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── ASK ────────────────────────────────────────────────────────────────────
  if (slide.type === 'ask') {
    const breakdown = bullets
    return (
      <div className="select-text" style={{
        width: '100%', height: '100%',
        backgroundColor: s.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '10% 14%', boxSizing: 'border-box', textAlign: 'center',
        background: `radial-gradient(ellipse at 50% 50%, rgba(196,168,130,0.07) 0%, transparent 65%), ${s.bg}`,
      }}>
        <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: s.muted, marginBottom: 18 }}>
          Fundraising Ask
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, color: s.heading, lineHeight: 1, letterSpacing: '-0.02em' }}
          {...editableProps('title')}>
          {slide.title}
        </div>
        {slide.subtitle && (
          <div style={{ fontSize: 20, color: s.accent, marginTop: 12, fontWeight: 500 }}
            {...editableProps('subtitle')}>
            {slide.subtitle}
          </div>
        )}
        <div style={{ width: 56, height: 2, backgroundColor: s.accent, margin: '24px auto', opacity: 0.6 }} />
        {breakdown.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', width: '100%', maxWidth: 380 }}>
            {breakdown.map((b, i) => {
              const colonIdx = b.indexOf(':')
              const label = colonIdx !== -1 ? b.slice(0, colonIdx).trim() : b
              const value = colonIdx !== -1 ? b.slice(colonIdx + 1).trim() : ''
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  paddingBottom: 10, borderBottom: `1px solid ${s.accent}18`,
                }}>
                  <span style={{ fontSize: 13, color: s.text, opacity: 0.85 }}
                    {...editableProps('bullets', i)}>
                    {label}
                  </span>
                  {value && (
                    <span style={{ fontSize: 13, color: s.accent, fontWeight: 600 }}>
                      {value}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── FALLBACK ───────────────────────────────────────────────────────────────
  return (
    <div className="select-text" style={{
      width: '100%', height: '100%', backgroundColor: s.bg,
      display: 'flex', flexDirection: 'column',
      padding: '6% 8%', boxSizing: 'border-box',
    }}>
      {slideHeader}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        {slide.subtitle && (
          <div style={{ fontSize: 16, color: s.muted, fontWeight: 500 }}
            {...editableProps('subtitle')}>
            {slide.subtitle}
          </div>
        )}
        {bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.accent, minWidth: 24, marginTop: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 14, color: s.text, lineHeight: 1.6, flex: 1 }}
              {...editableProps('bullets', i)}>
              {b}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Thumbnail({ slide, active, index, onClick }: {
  slide: PitchSlide
  active: boolean
  index: number
  onClick: () => void
}) {
  const s = SLIDE_STYLES[slide.type] ?? SLIDE_STYLES.problem
  return (
    <button
      onClick={onClick}
      title={slide.title}
      className={`shrink-0 overflow-hidden rounded transition-all duration-150 ${
        active
          ? 'ring-2 ring-[#6B4C35] shadow-md opacity-100'
          : 'opacity-50 hover:opacity-80 hover:shadow-sm'
      }`}
      style={{ width: 96, height: 54, backgroundColor: s.bg, display: 'flex', flexDirection: 'column', padding: '6px 8px', gap: 3 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 3, height: 10, backgroundColor: s.accent, borderRadius: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 6, fontWeight: 800, color: s.heading, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1 }}>
          {slide.title}
        </div>
      </div>
      <div style={{ fontSize: 5, color: s.muted, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {slide.subtitle || slide.bullets?.[0] || ''}
      </div>
      <div style={{ marginTop: 'auto', fontSize: 5, fontWeight: 600, color: s.accent, letterSpacing: '0.05em' }}>
        {String(index + 1).padStart(2, '0')}
      </div>
    </button>
  )
}

const GENERATION_STEPS = [
  { label: 'Defining the core problem…',        detail: 'Identifying pain points investors care about' },
  { label: 'Crafting your solution narrative…', detail: 'Shaping how you solve it uniquely' },
  { label: 'Sizing the market opportunity…',    detail: 'TAM, SAM, SOM calculations' },
  { label: 'Building the business model…',      detail: 'Revenue streams and unit economics' },
  { label: 'Preparing the investment ask…',     detail: 'Use of funds and milestone roadmap' },
  { label: 'Polishing the pitch deck…',         detail: 'Formatting slides for investor readiness' },
]

const SLIDE_PREVIEWS = [
  { bg: '#3D2314', lines: ['#C4A882', '#C4A882', '#9A7A5A'], accent: '#C4A882' },
  { bg: '#FAF8F5', lines: ['#8B2500', '#2D1A0F', '#7A6555'], accent: '#8B2500' },
  { bg: '#F5FAF7', lines: ['#1A4731', '#1C1612', '#5A7A6A'], accent: '#2D7A4F' },
  { bg: '#F5F8FC', lines: ['#0F2D5A', '#1C1612', '#4A6A8A'], accent: '#1E5FA8' },
  { bg: '#EDE8DF', lines: ['#3D2314', '#1C1612', '#8C7B6B'], accent: '#6B4C35' },
  { bg: '#FBF6EA', lines: ['#7B4A00', '#1C1612', '#8C7A4A'], accent: '#B87A20' },
  { bg: '#F8F5F0', lines: ['#1C1612', '#2D1A0F', '#8C7B6B'], accent: '#6B4C35' },
  { bg: '#1C1612', lines: ['#F5ECD5', '#E8D5B7', '#6A5A4A'], accent: '#C4A882' },
]

function LoadingSkeleton() {
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(3)
  const [cursorOn, setCursorOn] = useState(true)
  const [stepVisible, setStepVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setStepVisible(false)
      setTimeout(() => {
        setStepIdx((i) => (i + 1) % GENERATION_STEPS.length)
        setStepVisible(true)
      }, 300)
    }, 2600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCursorOn((c) => !c), 520)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setProgress((p) => Math.min(p + 0.55, 88)), 250)
    return () => clearInterval(t)
  }, [])

  const step = GENERATION_STEPS[stepIdx]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="h-[3px] bg-[#D9D0C3] shrink-0">
        <div
          className="h-full bg-[#6B4C35] transition-all duration-300 ease-out rounded-r-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#D9D0C3] bg-[#EDE8DF]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#1C1612]">Pitch Deck</span>
          <span className="flex items-center gap-1.5 text-xs text-[#6B4C35]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B4C35] animate-pulse inline-block" />
            Generating
          </span>
        </div>
        <div className="h-7 w-24 rounded-lg bg-[#D9D0C3]/50 animate-pulse" />
      </div>

      {/* Main area */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-[#F5F2EE] px-16 py-6 gap-5">

        {/* Mock slide */}
        <div
          className="rounded-xl overflow-hidden shadow-2xl w-full relative"
          style={{
            maxWidth: 'min(100%, calc((100vh - 220px) * 16 / 9))',
            aspectRatio: '16 / 9',
            background: '#3D2314',
          }}
        >
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 25% 75%, rgba(196,168,130,0.09) 0%, transparent 55%), radial-gradient(ellipse at 75% 25%, rgba(196,168,130,0.06) 0%, transparent 55%)',
          }} />

          {/* Confidential label */}
          <div style={{
            position: 'absolute', top: '5%', right: '6%',
            fontSize: 'clamp(7px, 1.1vw, 11px)', letterSpacing: '0.18em',
            color: '#9A7A5A', textTransform: 'uppercase', fontWeight: 600,
          }}>
            Confidential
          </div>

          {/* Center content */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '10% 14%', textAlign: 'center',
          }}>
            {/* Title with blinking cursor */}
            <div style={{ fontSize: 'clamp(18px, 5vw, 64px)', fontWeight: 800, color: '#F5ECD5', lineHeight: 1.05, letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
              Your Startup
              <span style={{ color: '#C4A882', opacity: cursorOn ? 1 : 0, transition: 'opacity 0.08s' }}>|</span>
            </div>

            {/* Animated accent bar */}
            <div style={{
              height: 3, backgroundColor: '#C4A882', margin: '4% auto 4.5%', borderRadius: 2,
              animation: 'draw-line 1.2s ease-out forwards',
            }} />

            {/* Subtitle lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2%', alignItems: 'center', width: '68%', zIndex: 1 }}>
              {[['75%', 0], ['58%', 0.35], ['40%', 0.7]].map(([w, delay], i) => (
                <div key={i} style={{
                  height: 'clamp(5px, 1.3vw, 13px)', width: String(w),
                  backgroundColor: '#C4A882', borderRadius: 3,
                  animation: `bar-pulse 2.4s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Step message */}
        <div
          className="text-center transition-all duration-300"
          style={{ opacity: stepVisible ? 1 : 0, transform: stepVisible ? 'translateY(0)' : 'translateY(4px)' }}
        >
          <p className="text-sm font-semibold text-[#3D2314]">{step.label}</p>
          <p className="text-xs text-[#8C7B6B] mt-0.5">{step.detail}</p>
        </div>
      </div>

      {/* Thumbnail strip — staggered skeletons matching real slide colors */}
      <div className="shrink-0 h-[88px] border-t border-[#D9D0C3] bg-[#EDE8DF] flex items-center gap-2 px-4 overflow-x-hidden">
        {SLIDE_PREVIEWS.map((s, i) => (
          <div
            key={i}
            className="shrink-0 w-24 h-[54px] rounded overflow-hidden flex flex-col"
            style={{ backgroundColor: s.bg, padding: '6px 8px', gap: 3, opacity: 0.55, animation: `bar-pulse 2.4s ease-in-out infinite`, animationDelay: `${i * 180}ms` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 3, height: 10, backgroundColor: s.accent, borderRadius: 1, flexShrink: 0 }} />
              <div style={{ height: 5, width: '55%', backgroundColor: s.lines[0], borderRadius: 2, opacity: 0.6 }} />
            </div>
            <div style={{ height: 4, width: '80%', backgroundColor: s.lines[1], borderRadius: 2, opacity: 0.25 }} />
            <div style={{ height: 4, width: '60%', backgroundColor: s.lines[1], borderRadius: 2, opacity: 0.18 }} />
            <div style={{ marginTop: 'auto', height: 4, width: '25%', backgroundColor: s.accent, borderRadius: 2, opacity: 0.5 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface PitchDeckViewProps {
  updated?: boolean
}

export function PitchDeckView({ updated }: PitchDeckViewProps) {
  const { modules, setModule } = useDashboardStore()
  const module = modules.pitchDeck

  const [slides, setSlides] = useState<PitchSlide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [extVersion, setExtVersion] = useState(0)
  const [exporting, setExporting] = useState(false)
  const prevContentRef = useRef('')
  const hiddenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (module.content && module.content !== prevContentRef.current) {
      prevContentRef.current = module.content
      const parsed = parseContent(module.content)
      setSlides(parsed)
      setExtVersion((v) => v + 1)
      setCurrentIndex(0)
    }
  }, [module.content])

  const handleSlideUpdate = useCallback(
    (id: string, patch: Partial<PitchSlide>) => {
      setSlides((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
        const content = slidesToContent(next)
        prevContentRef.current = content
        setModule('pitchDeck', { content, updatedAt: Date.now() })
        return next
      })
    },
    [setModule],
  )

  const total = slides.length
  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1))
  const next = () => setCurrentIndex((i) => Math.min(total - 1, i + 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  async function handleExportPDF() {
    if (!slides.length || !hiddenRef.current) return
    setExporting(true)
    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      const els = hiddenRef.current.querySelectorAll<HTMLElement>('[data-pdf-slide]')
      if (!els.length) return

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] })

      for (let i = 0; i < els.length; i++) {
        const canvas = await html2canvas(els[i], {
          scale: 1,
          width: 1280,
          height: 720,
          useCORS: true,
          logging: false,
        })
        const img = canvas.toDataURL('image/jpeg', 0.92)
        if (i > 0) pdf.addPage()
        pdf.addImage(img, 'JPEG', 0, 0, 1280, 720)
      }

      pdf.save('pitch-deck.pdf')
    } finally {
      setExporting(false)
    }
  }

  if (module.loading) return <LoadingSkeleton />

  if (!slides.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-[#8C7B6B] italic">Waiting for generation...</p>
      </div>
    )
  }

  const currentSlide = slides[currentIndex]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-[#D9D0C3] bg-[#EDE8DF]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#1C1612]">Pitch Deck</span>
          {updated && (
            <span className="flex items-center gap-1.5 text-xs text-[#6B4C35]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B4C35] animate-pulse inline-block" />
              Updated by co-founder
            </span>
          )}
          <span className="text-xs text-[#8C7B6B]">Slide {currentIndex + 1} of {total}</span>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#6B4C35] text-white hover:bg-[#5A3D2A] disabled:opacity-50 transition-colors"
        >
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {/* Slide area */}
      <div className="flex-1 min-h-0 flex items-center justify-center bg-[#F5F2EE] px-16 py-8 relative">
        {/* Prev */}
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/90 border border-[#D9D0C3] shadow flex items-center justify-center text-[#6B4C35] text-lg hover:bg-white disabled:opacity-25 transition-all select-none"
        >
          ←
        </button>

        {/* Slide */}
        <div
          className="rounded-xl overflow-hidden shadow-2xl"
          style={{
            width: '100%',
            maxWidth: 'min(100%, calc((100vh - 200px) * 16 / 9))',
            aspectRatio: '16 / 9',
          }}
        >
          <SlideView
            key={`${extVersion}-${currentSlide.id}`}
            slide={currentSlide}
            editable
            onUpdate={(patch) => handleSlideUpdate(currentSlide.id, patch)}
          />
        </div>

        {/* Next */}
        <button
          onClick={next}
          disabled={currentIndex === total - 1}
          className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/90 border border-[#D9D0C3] shadow flex items-center justify-center text-[#6B4C35] text-lg hover:bg-white disabled:opacity-25 transition-all select-none"
        >
          →
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="shrink-0 h-[88px] border-t border-[#D9D0C3] bg-[#EDE8DF] flex items-center gap-2 px-4 overflow-x-auto">
        {slides.map((slide, i) => (
          <Thumbnail
            key={slide.id}
            slide={slide}
            active={i === currentIndex}
            index={i}
            onClick={() => setCurrentIndex(i)}
          />
        ))}
      </div>

      {/* Hidden slides for PDF capture */}
      <div
        ref={hiddenRef}
        style={{ position: 'fixed', left: -9999, top: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        {slides.map((slide) => (
          <div key={slide.id} data-pdf-slide style={{ width: 1280, height: 720 }}>
            <SlideView slide={slide} />
          </div>
        ))}
      </div>
    </div>
  )
}
