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
            ? 'bg-[#6B4C35]/15 text-[#1C1612] rounded-tr-sm border border-[#6B4C35]/20'
            : 'bg-[#E8E0D0] text-[#8C7B6B] rounded-tl-sm border border-[#D9D0C3]'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
