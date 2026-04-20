import type { Message, PersonaKey } from '@/lib/types'
import { personas } from '@/lib/personas'

interface MessageBubbleProps {
  message: Message
  activePersona: PersonaKey
}

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let listItems: string[] = []

  const flushList = (key: string) => {
    if (!listItems.length) return
    nodes.push(
      <ul key={key} className="list-disc list-outside pl-4 space-y-0.5 my-1">
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    )
    listItems = []
  }

  lines.forEach((line, i) => {
    const listMatch = line.match(/^[-*]\s+(.+)/)
    if (listMatch) {
      listItems.push(listMatch[1])
      return
    }
    flushList(`list-${i}`)

    if (!line.trim()) {
      nodes.push(<div key={i} className="h-2" />)
      return
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const cls = level === 1 ? 'font-bold text-sm mt-1' : level === 2 ? 'font-semibold mt-1' : 'font-semibold'
      nodes.push(<p key={i} className={cls}>{renderInline(headingMatch[2])}</p>)
      return
    }

    nodes.push(<p key={i}>{renderInline(line)}</p>)
  })
  flushList('list-end')

  return nodes
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-[#1C1612]">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-black/10 rounded px-0.5 font-mono text-[11px]">{part.slice(1, -1)}</code>
    return part
  })
}

export function MessageBubble({ message, activePersona }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const persona = personas[activePersona]

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: `${persona.color}20`, color: persona.color }}
        >
          {persona.avatar}
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed space-y-0.5 ${
          isUser
            ? 'bg-[#6B4C35]/15 text-[#1C1612] rounded-tr-sm border border-[#6B4C35]/20'
            : 'bg-[#E8E0D0] text-[#8C7B6B] rounded-tl-sm border border-[#D9D0C3]'
        }`}
      >
        {isUser ? message.content : renderMarkdown(message.content)}
      </div>
    </div>
  )
}
