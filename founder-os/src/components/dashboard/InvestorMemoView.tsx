'use client'

import { useRef, useState } from 'react'
import { useDashboardStore } from '@/store/dashboard'

interface Section {
  title: string
  rawContent: string
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function getCompanyInfo(pitchContent: string): { name: string; tagline: string } {
  const tryParse = (s: string) => { try { return JSON.parse(s) } catch { return null } }
  let data = tryParse(pitchContent)
  if (!data) {
    const start = pitchContent.indexOf('{')
    const end = pitchContent.lastIndexOf('}')
    if (start !== -1 && end > start) data = tryParse(pitchContent.slice(start, end + 1))
  }
  const slide = data?.slides?.[0]
  return { name: slide?.title ?? 'Company Name', tagline: slide?.subtitle ?? '' }
}

function parseSections(content: string): Section[] {
  if (!content?.trim()) return []
  const lines = content.split('\n')
  const sections: Section[] = []
  let current: Section | null = null
  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (current) sections.push(current)
      current = { title: line.slice(2).trim(), rawContent: '' }
    } else if (current) {
      current.rawContent += line + '\n'
    }
  }
  if (current) sections.push(current)
  return sections
}

function extractFundingAsk(sections: Section[]): string | null {
  const combined = sections.map(s => s.rawContent).join(' ')
  const patterns = [
    /\$[\d,.]+\s*(?:million|M)\b/gi,
    /raising\s+\$[\d,.]+/gi,
    /seek(?:ing)?\s+\$[\d,.]+/gi,
    /\$[\d,.]+\s*(?:pre-seed|seed)/gi,
  ]
  for (const p of patterns) {
    const m = combined.match(p)
    if (m) return m[0]
  }
  return null
}

function extractStage(content: string): string {
  const lower = content.toLowerCase()
  if (lower.includes('pre-seed') || lower.includes('preseed')) return 'Pre-Seed'
  if (lower.includes('series b')) return 'Series B'
  if (lower.includes('series a')) return 'Series A'
  if (lower.includes('seed')) return 'Seed'
  return 'Early Stage'
}

function extractCountry(content: string): string {
  const countries = ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Egypt', 'Rwanda', 'Ethiopia', 'Senegal', 'Uganda', 'Tanzania']
  for (const c of countries) {
    if (content.includes(c)) return c
  }
  return ''
}

// ── Inline renderer ────────────────────────────────────────────────────────────

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

// ── Section content renderer ───────────────────────────────────────────────────

interface RenderedLine {
  type: 'paragraph' | 'bullet' | 'table' | 'h2' | 'h3' | 'empty'
  content?: string
  tableRows?: string[][]
}

function parseLines(raw: string): RenderedLine[] {
  const lines = raw.split('\n')
  const result: RenderedLine[] = []
  let i = 0
  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (!trimmed) { result.push({ type: 'empty' }); i++; continue }
    if (trimmed.startsWith('## ')) { result.push({ type: 'h2', content: trimmed.slice(3) }); i++; continue }
    if (trimmed.startsWith('### ')) { result.push({ type: 'h3', content: trimmed.slice(4) }); i++; continue }
    if (trimmed.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      const rows = tableLines
        .filter(l => !l.match(/^\|[-| :]+\|$/))
        .map(l => l.split('|').filter(Boolean).map(c => c.trim()))
      result.push({ type: 'table', tableRows: rows })
      continue
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      result.push({ type: 'bullet', content: trimmed.slice(2) }); i++; continue
    }
    result.push({ type: 'paragraph', content: trimmed }); i++
  }
  return result
}

function SectionContent({ rawContent }: { rawContent: string }) {
  const lines = parseLines(rawContent)
  return (
    <div>
      {lines.map((line, i) => {
        if (line.type === 'empty') return <div key={i} style={{ height: 6 }} />

        if (line.type === 'h2') return (
          <p key={i} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B4C35', margin: '18px 0 8px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {line.content}
          </p>
        )

        if (line.type === 'h3') return (
          <p key={i} style={{ fontSize: 12, fontWeight: 600, color: '#5A4030', margin: '12px 0 6px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {line.content}
          </p>
        )

        if (line.type === 'bullet') return (
          <div key={i} style={{ display: 'flex', gap: 10, margin: '5px 0', alignItems: 'flex-start' }}>
            <span style={{ color: '#6B4C35', fontWeight: 700, fontSize: 16, lineHeight: 1.5, flexShrink: 0, marginTop: -1 }}>·</span>
            <p
              style={{ fontSize: 14, color: '#2D2318', lineHeight: 1.75, margin: 0 }}
              dangerouslySetInnerHTML={{ __html: renderInline(line.content ?? '') }}
            />
          </div>
        )

        if (line.type === 'table' && line.tableRows && line.tableRows.length > 0) return (
          <div key={i} style={{ margin: '16px 0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #C4A882', backgroundColor: '#FAF8F5' }}>
                  {line.tableRows[0].map((cell, ci) => (
                    <th key={ci} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#1C1612', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {line.tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid #EDE8DF', backgroundColor: ri % 2 === 0 ? '#FFFFFF' : '#FDFCFA' }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '10px 16px', color: '#2D2318', lineHeight: 1.55, fontSize: 13 }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

        return (
          <p
            key={i}
            style={{ fontSize: 14, color: '#2D2318', lineHeight: 1.8, margin: '6px 0' }}
            dangerouslySetInnerHTML={{ __html: renderInline(line.content ?? '') }}
          />
        )
      })}
    </div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ minHeight: '100%', backgroundColor: '#F0EDE8', padding: '40px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <div className="h-9 w-28 rounded-lg bg-[#D9D0C3]/60 animate-pulse" />
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', backgroundColor: '#FFFFFF', boxShadow: '0 4px 40px rgba(0,0,0,0.10)', padding: '64px 72px' }}>
        <div className="flex flex-col gap-4">
          <div className="h-9 w-2/5 rounded bg-[#E8E0D0]/80 animate-pulse" />
          <div className="h-5 w-3/5 rounded bg-[#E8E0D0]/60 animate-pulse" />
          <div className="h-px w-full bg-[#D9D0C3] mt-4 mb-6" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2 mt-4">
              <div className="h-3 w-1/4 rounded bg-[#D9D0C3]/60 animate-pulse" />
              <div className="h-px w-full bg-[#EDE8DF]" />
              <div className="h-4 w-full rounded bg-[#E8E0D0]/50 animate-pulse mt-1" />
              <div className="h-4 w-5/6 rounded bg-[#E8E0D0]/50 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-[#E8E0D0]/50 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────────

interface InvestorMemoViewProps {
  updated?: boolean
}

export function InvestorMemoView({ updated }: InvestorMemoViewProps) {
  const modules = useDashboardStore(s => s.modules)
  const module = modules.investorMemo
  const pitchContent = modules.pitchDeck.content ?? ''

  const [exporting, setExporting] = useState(false)
  const documentRef = useRef<HTMLDivElement>(null)

  const { name: companyName, tagline } = getCompanyInfo(pitchContent)
  const sections = parseSections(module.content ?? '')
  const fundingAsk = extractFundingAsk(sections)
  const stage = extractStage(module.content ?? '')
  const country = extractCountry(module.content ?? '')
  const today = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  async function handleExportPDF() {
    if (!documentRef.current) return
    setExporting(true)
    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const ratio = pageW / canvas.width
      const totalH = canvas.height * ratio

      let yOffset = 0
      while (yOffset < totalH) {
        if (yOffset > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, pageW, totalH)
        yOffset += pageH
      }

      pdf.save(`${companyName.replace(/\s+/g, '-').toLowerCase()}-investor-memo.pdf`)
    } finally {
      setExporting(false)
    }
  }

  if (module.loading) return <LoadingSkeleton />

  if (!module.content) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-[#8C7B6B] italic">Waiting for generation...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#F0EDE8', padding: '40px 24px 80px' }}>
      {/* Toolbar */}
      <div style={{ maxWidth: 800, margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#8C7B6B', fontFamily: 'system-ui, sans-serif' }}>Investor Memo</span>
          {updated && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B4C35', fontFamily: 'system-ui, sans-serif' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6B4C35', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Updated by co-founder
            </span>
          )}
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          style={{
            padding: '9px 20px', fontSize: 13, fontWeight: 600,
            backgroundColor: '#1C1612', color: '#F5ECD5',
            border: 'none', borderRadius: 8, cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.6 : 1, letterSpacing: '0.01em',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transition: 'opacity 0.15s',
          }}
        >
          {exporting ? 'Exporting…' : '↓ Export PDF'}
        </button>
      </div>

      {/* Document paper */}
      <div
        ref={documentRef}
        style={{
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 48px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.06)',
          padding: '64px 72px 72px',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* ── Document Header ── */}
        <div style={{ borderBottom: '3px solid #1C1612', paddingBottom: 28, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{
                fontSize: 38, fontWeight: 800, color: '#1C1612', margin: 0,
                letterSpacing: '-0.025em', lineHeight: 1.1,
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                {companyName}
              </h1>
              {tagline && (
                <p style={{ fontSize: 15, color: '#6B4C35', margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
                  {tagline}
                </p>
              )}
            </div>
            <div style={{ flexShrink: 0, marginLeft: 32, marginTop: 4 }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: '#8C7B6B',
                border: '1px solid #C4A882', padding: '5px 12px',
                borderRadius: 3, fontFamily: 'system-ui, sans-serif',
              }}>
                Confidential
              </div>
            </div>
          </div>

          {/* Metadata strip */}
          <div style={{ display: 'flex', gap: 0, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              ['Stage', stage],
              country ? ['Country', country] : null,
              ['Date', today],
              ['Document', 'Investor Memo'],
            ].filter(Boolean).map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <span style={{ fontSize: 11, color: '#8C7B6B', fontFamily: 'system-ui, sans-serif' }}>
                  {(item as string[])[0]}:{' '}
                  <strong style={{ color: '#1C1612', fontWeight: 600 }}>{(item as string[])[1]}</strong>
                </span>
                {i < arr.length - 1 && (
                  <span style={{ fontSize: 11, color: '#C4A882', margin: '0 16px' }}>|</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Funding Ask callout (prominent) ── */}
        {fundingAsk && (
          <div style={{
            textAlign: 'center', padding: '28px 0 30px',
            margin: '0 0 44px',
            borderTop: '1px solid #EDE8DF', borderBottom: '1px solid #EDE8DF',
            backgroundColor: '#FDFCFA',
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: '#8C7B6B', margin: '0 0 12px',
              fontFamily: 'system-ui, sans-serif',
            }}>
              Funding Ask
            </p>
            <p style={{
              fontSize: 56, fontWeight: 800, color: '#1C1612', margin: 0,
              letterSpacing: '-0.03em', lineHeight: 1,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              {fundingAsk}
            </p>
          </div>
        )}

        {/* ── Sections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {sections.map((section, i) => {
            const isExec = section.title.toLowerCase().includes('executive') || section.title.toLowerCase().includes('summary')
            return (
              <div key={i}>
                {isExec ? (
                  /* Executive Summary — highlighted block */
                  <div style={{
                    backgroundColor: '#F7F3EC',
                    border: '1px solid #DACCB4',
                    borderLeft: '4px solid #6B4C35',
                    padding: '24px 28px',
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <h2 style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
                      textTransform: 'uppercase', color: '#6B4C35',
                      margin: '0 0 16px', fontFamily: 'system-ui, sans-serif',
                    }}>
                      {section.title}
                    </h2>
                    <SectionContent rawContent={section.rawContent} />
                  </div>
                ) : (
                  /* Standard document section */
                  <div>
                    <h2 style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
                      textTransform: 'uppercase', color: '#6B4C35',
                      margin: '0 0 14px', paddingBottom: 12,
                      borderBottom: '1px solid #EDE8DF',
                      fontFamily: 'system-ui, sans-serif',
                    }}>
                      {section.title}
                    </h2>
                    <SectionContent rawContent={section.rawContent} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Document Footer ── */}
        <div style={{
          marginTop: 64, paddingTop: 20,
          borderTop: '2px solid #1C1612',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <span style={{ fontSize: 11, color: '#8C7B6B', fontStyle: 'italic' }}>
            {companyName} — Confidential &amp; Proprietary
          </span>
          <span style={{ fontSize: 11, color: '#8C7B6B' }}>{today}</span>
        </div>
      </div>
    </div>
  )
}
