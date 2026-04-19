import type { Message, PersonaKey } from '@/lib/types'
import { personas } from '@/lib/personas'

interface MessageBubbleProps {
  message: Message
  activePersona: PersonaKey
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
        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? 'bg-indigo-600/20 text-white/80 rounded-tr-sm'
            : 'bg-white/[0.04] text-white/70 rounded-tl-sm border border-white/[0.05]'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
