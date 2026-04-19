import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ children, className = '', glow, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm ${glow ? 'ring-1 ring-indigo-500/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
