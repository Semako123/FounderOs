'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import type { Module } from '@/lib/types'

const MODULE_ICONS: Record<string, string> = {
  pitchDeck: '◈',
  marketingKit: '◉',
  investorMemo: '◎',
  financialModel: '▣',
}

function SkeletonLine({ width = 'w-full' }: { width?: string }) {
  return <div className={`h-3 rounded-full bg-white/[0.06] animate-pulse ${width}`} />
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown renderer for headers, bold, lists, and tables
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="text-sm font-semibold text-white mt-4 mb-1.5 first:mt-0">{line.slice(2)}</h2>)
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="text-xs font-semibold text-white/80 uppercase tracking-wide mt-3 mb-1 first:mt-0">{line.slice(3)}</h3>)
    } else if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-xs font-medium text-white/70 mt-2 mb-1">{line.slice(4)}</h4>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
          <span className="text-indigo-400 mt-0.5 shrink-0">·</span>
          <span dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />
        </div>
      )
    } else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)?.[1]
      elements.push(
        <div key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
          <span className="text-indigo-400 shrink-0 w-4">{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: renderInline(line.replace(/^\d+\. /, '')) }} />
        </div>
      )
    } else if (line.startsWith('|')) {
      // Table
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!lines[i].match(/^\|[-| ]+\|$/)) tableLines.push(lines[i])
        i++
      }
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-2">
          <table className="w-full text-xs border-collapse">
            {tableLines.map((row, ri) => (
              <tr key={ri} className={ri === 0 ? 'border-b border-white/10' : ''}>
                {row.split('|').filter(Boolean).map((cell, ci) => (
                  ri === 0
                    ? <th key={ci} className="px-2 py-1.5 text-left text-white/50 font-medium">{cell.trim()}</th>
                    : <td key={ci} className="px-2 py-1.5 text-white/60">{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </table>
        </div>
      )
      continue
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />)
    } else {
      elements.push(
        <p key={i} className="text-xs text-white/60 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderInline(line) }}
        />
      )
    }
    i++
  }

  return <div className="flex flex-col gap-0.5">{elements}</div>
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/80 font-medium">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="font-mono text-indigo-300 text-[10px] bg-indigo-500/10 px-1 py-0.5 rounded">$1</code>')
}

interface ModuleCardProps {
  module: Module
  updated?: boolean
}

export function ModuleCard({ module, updated }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const icon = MODULE_ICONS[module.key] || '◈'

  return (
    <Card glow={updated} className={`flex flex-col transition-all duration-300 ${expanded ? 'row-span-2' : ''}`}>
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-indigo-400 text-sm">{icon}</span>
          <span className="text-xs font-medium text-white/80">{module.title}</span>
          {updated && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          )}
        </div>
        <span className="text-white/20 text-xs select-none">{expanded ? '−' : '+'}</span>
      </div>

      <div className={`px-4 py-3 overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[600px] overflow-y-auto' : 'max-h-32'}`}>
        {module.loading ? (
          <div className="flex flex-col gap-2.5 py-1">
            <SkeletonLine />
            <SkeletonLine width="w-4/5" />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-3/4" />
            <SkeletonLine width="w-5/6" />
          </div>
        ) : module.content ? (
          <MarkdownContent content={module.content} />
        ) : (
          <p className="text-xs text-white/20 italic">Waiting for generation...</p>
        )}
      </div>

      {!module.loading && module.content && !expanded && (
        <div className="px-4 pb-3 pt-0">
          <div className="h-6 bg-gradient-to-t from-[#0a0a0a] to-transparent -mt-6 pointer-events-none" />
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-indigo-400/60 hover:text-indigo-400 transition-colors"
          >
            View full content →
          </button>
        </div>
      )}
    </Card>
  )
}
