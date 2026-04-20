'use client'

import { useState } from 'react'
import { useDashboardStore } from '@/store/dashboard'

interface MarketingKitData {
  tagline: string
  brandVoice: string[]
  brandColors: { name: string; hex: string }[]
  instagramPosts: { caption: string; hashtags: string }[]
  twitterPosts: string[]
  adCopies: { headline: string; body: string; cta: string }[]
  emailSubjectLines: string[]
  campusPitch: string
}

function parseKit(content: string): MarketingKitData | null {
  // Direct parse
  try { return JSON.parse(content.trim()) } catch {}
  // Strip markdown code fences then parse
  try {
    const stripped = content
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim()
    return JSON.parse(stripped)
  } catch {}
  // Extract the outermost JSON object
  try {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start !== -1 && end > start) return JSON.parse(content.slice(start, end + 1))
  } catch {}
  return null
}

function CopyButton({
  text,
  label = 'Copy',
  variant = 'light',
}: {
  text: string
  label?: string
  variant?: 'light' | 'dark'
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const base = 'shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 active:scale-95 cursor-pointer'
  const styles =
    variant === 'dark'
      ? copied
        ? `${base} bg-[#C45C2A] text-[#FAF8F5]`
        : `${base} bg-white/10 text-[#C4A882] hover:bg-white/20`
      : copied
        ? `${base} bg-[#6B4C35] text-[#FAF8F5]`
        : `${base} bg-[#D9D0C3]/60 text-[#6B4C35] hover:bg-[#C4A882]/50`

  return (
    <button onClick={handleCopy} className={styles}>
      {copied ? 'Copied!' : label}
    </button>
  )
}

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button onClick={handleCopy} className="flex flex-col items-center gap-2 group cursor-pointer">
      <div
        className="w-14 h-14 rounded-full shadow-md ring-2 ring-white/20 transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: hex }}
      />
      <span className="font-mono text-[10px] leading-tight text-[#6B4C35] group-hover:text-[#1C1612] transition-colors">
        {copied ? 'Copied!' : hex}
      </span>
      <span className="text-[9px] text-[#8C7B6B]/70 leading-none">{name}</span>
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium mb-3">
      {children}
    </p>
  )
}

const VOICE_PILL = [
  'bg-[#C45C2A] text-[#FAF8F5]',
  'bg-[#D4A853] text-[#1C1612]',
  'bg-[#2A4A3A] text-[#EDE8DF]',
  'bg-[#1C1612] text-[#EDE8DF]',
]

function LoadingSkeleton() {
  return (
    <div className="px-6 py-8 max-w-[1200px] mx-auto space-y-5 animate-pulse">
      <div className="h-8 w-40 rounded-full bg-[#D9D0C3]/50" />
      <div className="h-52 rounded-3xl bg-[#D9D0C3]/50" />
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4 h-28 rounded-2xl bg-[#D9D0C3]/50" />
        <div className="col-span-8 h-28 rounded-2xl bg-[#D9D0C3]/50" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-[#D9D0C3]/50" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 rounded-2xl bg-[#D9D0C3]/50" />
        <div className="h-32 rounded-2xl bg-[#D9D0C3]/50" />
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5 h-72 rounded-2xl bg-[#D9D0C3]/50" />
        <div className="col-span-7 h-72 rounded-2xl bg-[#D9D0C3]/50" />
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7 h-52 rounded-2xl bg-[#D9D0C3]/50" />
        <div className="col-span-5 h-52 rounded-2xl bg-[#D9D0C3]/50" />
      </div>
    </div>
  )
}

function IGCard({
  post,
  dark = false,
  accentA,
  accentB,
}: {
  post: { caption: string; hashtags: string }
  dark?: boolean
  accentA: string
  accentB: string
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col ${
        dark ? 'bg-[#1C1612]' : 'bg-[#EDE8DF] border border-[#D9D0C3]'
      }`}
    >
      <div
        className="h-1.5"
        style={{ background: `linear-gradient(to right, ${accentA}, ${accentB})` }}
      />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#FAF8F5] text-[11px] font-bold"
              style={{ backgroundColor: accentA }}
            >
              B
            </div>
            <span className={`text-xs font-medium ${dark ? 'text-[#EDE8DF]' : 'text-[#1C1612]'}`}>
              yourbrand
            </span>
          </div>
          <CopyButton
            text={`${post.caption}\n\n${post.hashtags}`}
            variant={dark ? 'dark' : 'light'}
          />
        </div>
        <p className={`text-sm leading-relaxed ${dark ? 'text-[#D9D0C3]' : 'text-[#1C1612]'}`}>
          {post.caption}
        </p>
        <p className={`text-xs font-mono ${dark ? 'text-[#C4A882]/60' : 'text-[#6B4C35]/60'}`}>
          {post.hashtags}
        </p>
      </div>
    </div>
  )
}

export function MarketingKitView({ updated }: { updated?: boolean }) {
  const module = useDashboardStore((s) => s.modules.marketingKit)

  if (module.loading) return <LoadingSkeleton />

  if (!module.content) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[#8C7B6B] italic">
        Waiting for generation...
      </div>
    )
  }

  const data = parseKit(module.content)

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl text-[#6B4C35]">◉</span>
          <h1 className="text-xl font-semibold text-[#1C1612]">Marketing Kit</h1>
        </div>
        <div className="rounded-2xl bg-[#EDE8DF] border border-[#D9D0C3] px-8 py-7">
          <pre className="text-sm text-[#6B4C35] whitespace-pre-wrap font-sans leading-relaxed">
            {module.content}
          </pre>
        </div>
      </div>
    )
  }

  const ig = Array.isArray(data.instagramPosts) ? data.instagramPosts : []
  const tweets = Array.isArray(data.twitterPosts) ? data.twitterPosts : []
  const ads = Array.isArray(data.adCopies) ? data.adCopies : []
  const subjects = Array.isArray(data.emailSubjectLines) ? data.emailSubjectLines : []
  const voice = Array.isArray(data.brandVoice) ? data.brandVoice.slice(0, 4) : []
  const colors = Array.isArray(data.brandColors) ? data.brandColors : []

  return (
    <div className="px-6 py-8 max-w-[1200px] mx-auto space-y-5 pb-12">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <span className="text-xl text-[#6B4C35]">◉</span>
        <div>
          <h1 className="text-xl font-semibold text-[#1C1612]">Marketing Kit</h1>
          {updated && (
            <p className="text-xs text-[#6B4C35] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B4C35] animate-pulse inline-block" />
              Updated by your co-founder
            </p>
          )}
        </div>
      </div>

      {/* ── 1. TAGLINE HERO ── */}
      <div className="relative rounded-3xl bg-[#1C1612] overflow-hidden px-10 py-14 min-h-[200px] flex items-center">
        {/* Decorative rings */}
        <div className="absolute -right-20 -top-20 w-[340px] h-[340px] rounded-full border border-[#6B4C35]/25 pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-[230px] h-[230px] rounded-full border border-[#C45C2A]/20 pointer-events-none" />
        <div className="absolute right-36 bottom-8 w-[90px] h-[90px] rounded-full border border-[#D4A853]/20 pointer-events-none" />
        <div className="absolute left-[52%] -bottom-14 w-[180px] h-[180px] rounded-full border border-[#6B4C35]/12 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-[9px] uppercase tracking-[0.35em] text-[#6B4C35] font-medium mb-4">
            Brand Tagline
          </p>
          <h2 className="text-4xl font-bold text-[#FAF8F5] leading-snug">
            {data.tagline}
          </h2>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <CopyButton text={data.tagline} variant="dark" />
        </div>
      </div>

      {/* ── 2. BRAND VOICE + COLORS ── */}
      <div className="grid grid-cols-12 gap-5">
        {/* Brand Voice — narrower */}
        <div className="col-span-4 rounded-2xl bg-[#EDE8DF] border border-[#D9D0C3] p-6">
          <Label>Brand Voice</Label>
          <div className="flex flex-wrap gap-2.5 mt-1">
            {voice.map((word, i) => (
              <span
                key={i}
                className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide ${VOICE_PILL[i % VOICE_PILL.length]}`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Brand Colors — wider */}
        <div className="col-span-8 rounded-2xl bg-[#EDE8DF] border border-[#D9D0C3] p-6">
          <Label>Brand Colors — click to copy hex</Label>
          <div className="flex gap-8 flex-wrap mt-1">
            {colors.map((c, i) => (
              <ColorSwatch key={i} name={c.name} hex={c.hex} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. INSTAGRAM ── */}
      <div>
        <Label>Instagram Posts</Label>

        {/* Row 1: posts 1-2 (light) + post 3 (dark) */}
        <div className="grid grid-cols-3 gap-4">
          {ig[0] && (
            <IGCard post={ig[0]} accentA="#C45C2A" accentB="#D4A853" />
          )}
          {ig[1] && (
            <IGCard post={ig[1]} accentA="#D4A853" accentB="#6B4C35" />
          )}
          {ig[2] && (
            <IGCard post={ig[2]} dark accentA="#2A4A3A" accentB="#C45C2A" />
          )}
        </div>

        {/* Row 2: posts 4-5 (wider, 2 col) */}
        {ig.length > 3 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {ig[3] && (
              <IGCard post={ig[3]} accentA="#6B4C35" accentB="#D4A853" />
            )}
            {ig[4] && (
              <IGCard post={ig[4]} accentA="#D4A853" accentB="#C45C2A" />
            )}
          </div>
        )}
      </div>

      {/* ── 4. TWITTER + ADS ── */}
      <div className="grid grid-cols-12 gap-5">
        {/* Twitter — narrower */}
        <div className="col-span-5 rounded-2xl bg-[#EDE8DF] border border-[#D9D0C3] p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-black text-[#1C1612] leading-none">𝕏</span>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
              Twitter / X Posts
            </p>
          </div>
          <div className="flex flex-col divide-y divide-[#D9D0C3]">
            {tweets.map((tweet, i) => (
              <div
                key={i}
                className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
              >
                <p className="text-sm text-[#1C1612] leading-relaxed flex-1">{tweet}</p>
                <CopyButton text={tweet} />
              </div>
            ))}
          </div>
        </div>

        {/* Ad Copies — wider */}
        <div className="col-span-7 flex flex-col gap-3">
          <Label>Ad Copies</Label>
          {ads.map((ad, i) => {
            const isDark = i < 2
            const bg =
              i === 0
                ? 'bg-[#1C1612]'
                : i === 1
                  ? 'bg-[#6B4C35]/85'
                  : 'bg-[#EDE8DF] border border-[#D9D0C3]'
            const ctaBg =
              i === 0
                ? 'bg-[#C45C2A] text-[#FAF8F5]'
                : i === 1
                  ? 'bg-[#FAF8F5]/90 text-[#6B4C35]'
                  : 'bg-[#6B4C35] text-[#FAF8F5]'

            return (
              <div key={i} className={`rounded-2xl p-5 flex flex-col gap-3 ${bg}`}>
                <div className="flex items-start justify-between gap-3">
                  <h4
                    className={`font-bold text-sm leading-snug flex-1 ${
                      isDark ? 'text-[#FAF8F5]' : 'text-[#1C1612]'
                    }`}
                  >
                    {ad.headline}
                  </h4>
                  <CopyButton
                    text={`${ad.headline}\n\n${ad.body}\n\nCTA: ${ad.cta}`}
                    variant={isDark ? 'dark' : 'light'}
                  />
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? 'text-[#C4A882]' : 'text-[#6B4C35]'
                  }`}
                >
                  {ad.body}
                </p>
                <div>
                  <span className={`text-xs px-3.5 py-1.5 rounded-full font-semibold inline-block ${ctaBg}`}>
                    {ad.cta}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 5. EMAIL SUBJECTS + CAMPUS PITCH ── */}
      <div className="grid grid-cols-12 gap-5">
        {/* Email Subject Lines — wider */}
        <div className="col-span-7 rounded-2xl bg-[#EDE8DF] border border-[#D9D0C3] p-6">
          <Label>Email Subject Lines</Label>
          <div className="flex flex-col gap-2">
            {subjects.map((subject, i) => (
              <div
                key={i}
                className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] border border-transparent hover:border-[#D9D0C3] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[10px] text-[#C4A882] shrink-0 w-5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-[#1C1612] truncate">{subject}</span>
                </div>
                <CopyButton text={subject} />
              </div>
            ))}
          </div>
        </div>

        {/* Campus Pitch — narrower, dark */}
        <div className="col-span-5 rounded-2xl bg-[#1C1612] p-6 flex flex-col relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full border border-[#6B4C35]/20 pointer-events-none" />
          <div className="absolute -right-5 -bottom-5 w-28 h-28 rounded-full border border-[#C45C2A]/15 pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#C45C2A] text-base leading-none">◎</span>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#8C7B6B] font-medium">
                30-Second Campus Pitch
              </p>
            </div>
            <p className="text-[#EDE8DF] text-sm leading-relaxed flex-1">
              {data.campusPitch}
            </p>
            <div className="mt-5 flex justify-end">
              <CopyButton text={data.campusPitch} label="Copy Pitch" variant="dark" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
