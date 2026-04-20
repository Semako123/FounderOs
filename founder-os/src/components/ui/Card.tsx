import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ children, className = '', glow, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[#D9D0C3] bg-[#EDE8DF] shadow-sm ${glow ? 'ring-2 ring-[#C4A882]/50' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
