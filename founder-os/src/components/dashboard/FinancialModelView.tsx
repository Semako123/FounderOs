'use client'

import { useMemo } from 'react'
import { useDashboardStore } from '@/store/dashboard'
import { parseContent } from '@/lib/pitchDeckUtils'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const C = {
  bg: '#FAF8F5',
  card: '#EDE8DF',
  border: '#D9D0C3',
  brown: '#6B4C35',
  brownLight: '#C4A882',
  text: '#1C1612',
  muted: '#8C7B6B',
  negative: '#B85C3A',
  area: '#C4A882',
}

const PIE_COLORS = [C.brown, C.brownLight, '#A07060', '#8C6A50', '#C4B090', '#D9C8A8']

const tooltipStyle: React.CSSProperties = {
  backgroundColor: '#2D1A0F',
  border: 'none',
  borderRadius: 8,
  fontSize: 12,
  color: '#F5ECD5',
  padding: '8px 12px',
}

function safeNum(v: unknown): number {
  if (typeof v === 'number') return isFinite(v) ? v : 0
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^0-9.-]/g, ''))
    return isFinite(n) ? n : 0
  }
  return 0
}

function fmtNum(n: unknown, compact = false): string {
  const num = safeNum(n)
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (compact || abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}₦${(abs / 1_000).toFixed(0)}K`
  return `${sign}₦${abs.toFixed(0)}`
}

interface MonthData {
  month: string
  active_users: number
  loans_issued: number
  gross_loan_volume: number
  gross_revenue: number
  defaults: number
  net_revenue: number
  operating_costs: number
  net_profit: number
}

interface FinancialModelData {
  monthly_data: MonthData[]
  unit_economics: {
    avg_loan_size: number
    service_fee_per_loan: number
    cost_per_loan: number
    net_margin_per_loan: number
    default_rate: number
    cac: number
    ltv: number
  }
  key_metrics: {
    total_y1_revenue: number
    operating_profit: number
    break_even_month: number
    ltv_cac_ratio: string
  }
  funding: {
    total_ask: string
    loan_capital_pool_percent: number
    operating_capital_percent: number
    breakdown: Array<{ category: string; percent: number }>
  }
  kpi_targets: Array<{ metric: string; definition: string; target: string }>
  risks: Array<{ risk: string; impact: 'high' | 'medium' | 'low'; mitigation: string }>
  phases: Array<{ name: string; months: string; goal: string; status: 'current' | 'upcoming' | 'completed' }>
}

function parseJsonModel(content: string): FinancialModelData | null {
  if (!content) return null
  try {
    const cleaned = content
      .replace(/^```json\s*/im, '')
      .replace(/^```\s*/im, '')
      .replace(/```\s*$/m, '')
      .trim()
    return JSON.parse(cleaned) as FinancialModelData
  } catch {
    return null
  }
}

function StatCard({ label, value, sub, accent = false }: {
  label: string; value: string; sub?: string; accent?: boolean
}) {
  return (
    <div className="rounded-xl border px-5 py-4 flex flex-col gap-1"
      style={{ backgroundColor: accent ? C.brown : C.card, borderColor: accent ? C.brown : C.border }}>
      <span className="text-xs uppercase tracking-widest font-medium"
        style={{ color: accent ? C.brownLight : C.muted }}>
        {label}
      </span>
      <span className="text-2xl font-bold leading-none tracking-tight"
        style={{ color: accent ? '#F5ECD5' : C.text }}>
        {value}
      </span>
      {sub && <span className="text-xs mt-0.5" style={{ color: accent ? C.brownLight : C.muted }}>{sub}</span>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-sm" style={{ backgroundColor: C.brown }} />
      <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: C.text }}>{children}</h2>
    </div>
  )
}

function ChartCard({ title, children, className = '' }: {
  title: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`rounded-xl border p-5 ${className}`}
      style={{ backgroundColor: C.card, borderColor: C.border }}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipStyle}>
      <div className="mb-1 font-semibold">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {fmtNum(p.value)}</div>
      ))}
    </div>
  )
}

function ImpactPill({ level }: { level: 'high' | 'medium' | 'low' }) {
  const cfg = {
    high: { bg: '#FDE8E1', text: '#B85C3A', label: 'High' },
    medium: { bg: '#FEF3E0', text: '#A07020', label: 'Medium' },
    low: { bg: '#E4F0E2', text: '#3A7A35', label: 'Low' },
  }[level]
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-24 rounded-xl" style={{ backgroundColor: C.card }} />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: C.card }} />
          ))}
        </div>
        <div className="h-64 rounded-xl" style={{ backgroundColor: C.card }} />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl" style={{ backgroundColor: C.card }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function FinancialModelView({ updated }: { updated?: boolean }) {
  const modules = useDashboardStore(s => s.modules)
  const mod = modules.financialModel
  const pitchContent = modules.pitchDeck?.content ?? ''

  const companyName = useMemo(() => {
    try {
      const slides = parseContent(pitchContent)
      return slides[0]?.title ?? 'Your Company'
    } catch {
      return 'Your Company'
    }
  }, [pitchContent])

  const data = useMemo(() => parseJsonModel(mod.content), [mod.content])

  if (mod.loading) return <LoadingSkeleton />

  if (!mod.content) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm italic" style={{ color: C.muted }}>Waiting for generation…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm italic" style={{ color: C.muted }}>
          Financial model format not recognized — try regenerating.
        </p>
      </div>
    )
  }

  const { monthly_data: rawMonthly, unit_economics: rawUE, key_metrics: rawKM, funding, kpi_targets, risks, phases } = data

  // Normalize all numeric fields — Alex may return strings like "₦2,800" or "3%"
  const monthly_data = rawMonthly.map(m => ({
    ...m,
    gross_loan_volume: safeNum(m.gross_loan_volume),
    gross_revenue: safeNum(m.gross_revenue),
    net_revenue: safeNum(m.net_revenue),
    operating_costs: safeNum(m.operating_costs),
    net_profit: safeNum(m.net_profit),
  }))

  const unit_economics = {
    avg_loan_size: safeNum(rawUE.avg_loan_size),
    service_fee_per_loan: safeNum(rawUE.service_fee_per_loan),
    cost_per_loan: safeNum(rawUE.cost_per_loan),
    net_margin_per_loan: safeNum(rawUE.net_margin_per_loan),
    default_rate: safeNum(rawUE.default_rate),
    cac: safeNum(rawUE.cac),
    ltv: safeNum(rawUE.ltv),
  }

  const key_metrics = {
    total_y1_revenue: safeNum(rawKM.total_y1_revenue),
    operating_profit: safeNum(rawKM.operating_profit),
    break_even_month: safeNum(rawKM.break_even_month),
    ltv_cac_ratio: rawKM.ltv_cac_ratio ?? '—',
  }

  const breakEvenMonth = key_metrics.break_even_month

  const cacLtvData = [
    { category: 'CAC', amount: unit_economics.cac },
    { category: 'LTV', amount: unit_economics.ltv },
  ]

  const opBreakdown = funding.breakdown.filter(b => b.category !== 'Loan Capital Pool')

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: C.bg }}>
      <div className="max-w-6xl mx-auto px-8 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="rounded-2xl border px-8 py-6 flex items-center justify-between"
          style={{ backgroundColor: '#2D1A0F', borderColor: '#4A2E1A' }}>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest font-medium" style={{ color: C.brownLight }}>
              Financial Model — Confidential
            </span>
            <span className="text-3xl font-bold tracking-tight" style={{ color: '#F5ECD5' }}>
              {companyName}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-widest" style={{ color: C.brownLight }}>Funding Ask</span>
              <span className="text-4xl font-bold leading-none" style={{ color: '#F5ECD5' }}>
                {funding.total_ask}
              </span>
            </div>
            {updated && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: C.brown, color: '#F5ECD5' }}>
                Updated
              </span>
            )}
            <span className="text-xs rounded-full border px-2.5 py-0.5 font-medium"
              style={{ color: C.brownLight, borderColor: '#4A2E1A' }}>
              For Discussion Purposes Only
            </span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total Y1 Revenue"
            value={fmtNum(key_metrics.total_y1_revenue)}
            sub="Cumulative 12-month"
            accent
          />
          <StatCard
            label="Operating Profit"
            value={fmtNum(key_metrics.operating_profit)}
            sub={key_metrics.operating_profit >= 0 ? 'Net positive' : 'Net negative'}
          />
          <StatCard
            label="Break-even Month"
            value={breakEvenMonth > 0 ? `M${breakEvenMonth}` : '—'}
            sub="First profitable month"
          />
          <StatCard
            label="LTV : CAC"
            value={key_metrics.ltv_cac_ratio}
            sub="Lifetime value to cost"
          />
        </div>

        {/* Monthly Net Revenue — full width */}
        <ChartCard title="Monthly Net Revenue Progression">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly_data} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.area} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={C.area} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                tickFormatter={v => fmtNum(v, true)} width={60} />
              <Tooltip content={<CustomTooltip />} />
              {breakEvenMonth > 0 && (
                <ReferenceLine x={`M${breakEvenMonth}`}
                  stroke={C.brown} strokeDasharray="4 2" strokeWidth={1.5}
                  label={{ value: 'Break-even', position: 'top', fontSize: 10, fill: C.brown }} />
              )}
              <Area type="monotone" dataKey="net_revenue" name="Net Revenue"
                stroke={C.brown} strokeWidth={2} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* P&L + Loan Volume */}
        <div className="grid grid-cols-2 gap-4">
          <ChartCard title="Monthly Profit & Loss">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly_data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmtNum(v, true)} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke={C.border} strokeWidth={1} />
                <Bar dataKey="net_profit" name="Net Profit/Loss" radius={[3, 3, 0, 0]}>
                  {monthly_data.map((entry, i) => (
                    <Cell key={i} fill={entry.net_profit >= 0 ? C.brown : C.negative} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Gross Loan Volume Growth">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly_data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.brownLight} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={C.brownLight} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmtNum(v, true)} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="gross_loan_volume" name="Loan Volume"
                  stroke={C.brownLight} strokeWidth={2} fill="url(#volGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* MRR Growth + CAC vs LTV */}
        <div className="grid grid-cols-2 gap-4">
          <ChartCard title="MRR Growth">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly_data} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmtNum(v, true)} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="net_revenue" name="MRR"
                  stroke={C.brown} strokeWidth={2.5}
                  dot={{ r: 3, fill: C.brown, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: C.brown }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="CAC vs LTV">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cacLtvData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmtNum(v, true)} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]}>
                  <Cell key="cac" fill={C.negative} />
                  <Cell key="ltv" fill={C.brown} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Unit Economics + Funding Allocation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border p-5" style={{ backgroundColor: C.card, borderColor: C.border }}>
            <SectionTitle>Unit Economics</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Avg Loan Size', value: fmtNum(unit_economics.avg_loan_size) },
                { label: 'Service Fee / Loan', value: fmtNum(unit_economics.service_fee_per_loan) },
                { label: 'Cost / Loan', value: fmtNum(unit_economics.cost_per_loan) },
                { label: 'Net Margin / Loan', value: fmtNum(unit_economics.net_margin_per_loan) },
                { label: 'Default Rate', value: `${unit_economics.default_rate}%` },
                { label: 'LTV : CAC', value: key_metrics.ltv_cac_ratio },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border px-3 py-3"
                  style={{ backgroundColor: C.bg, borderColor: C.border }}>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: C.muted }}>{label}</div>
                  <div className="text-lg font-bold" style={{ color: C.text }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-5" style={{ backgroundColor: C.card, borderColor: C.border }}>
            <SectionTitle>Funding Allocation</SectionTitle>
            <div className="flex items-center gap-4 mb-5">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={funding.breakdown} cx="50%" cy="50%"
                    innerRadius={40} outerRadius={62}
                    dataKey="percent" nameKey="category" strokeWidth={0}>
                    {funding.breakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`}
                    contentStyle={{ ...tooltipStyle, padding: '6px 10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 flex-1">
                {funding.breakdown.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs truncate" style={{ color: C.text }}>{item.category}</span>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color: C.text }}>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: C.muted }}>
                Operating Capital Breakdown
              </div>
              <div className="flex flex-col gap-1.5">
                {opBreakdown.map(({ category, percent }) => (
                  <div key={category} className="flex items-center gap-2">
                    <span className="text-xs w-32 shrink-0 truncate" style={{ color: C.muted }}>{category}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: C.border }}>
                      <div className="h-1.5 rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: C.brownLight }} />
                    </div>
                    <span className="text-xs w-7 text-right" style={{ color: C.text }}>{percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Targets */}
        <div className="rounded-xl border" style={{ backgroundColor: C.card, borderColor: C.border }}>
          <div className="px-5 pt-5 pb-3">
            <SectionTitle>Key Operating Metrics</SectionTitle>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Metric', 'Definition', 'Target'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kpi_targets.map(({ metric, definition, target }, i) => (
                <tr key={i}
                  style={{ borderBottom: i < kpi_targets.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: C.text }}>{metric}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: C.muted }}>{definition}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: C.brown }}>{target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Path to Profitability */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: C.card, borderColor: C.border }}>
          <SectionTitle>Path to Profitability</SectionTitle>
          <div className="relative mt-2">
            <div className="absolute top-4 left-0 right-0 h-px"
              style={{ backgroundColor: C.border, zIndex: 0 }} />
            <div className="grid grid-cols-4 gap-4 relative z-10">
              {phases.map(({ name, months, goal, status }, i) => {
                const active = status === 'completed' || status === 'current'
                return (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        backgroundColor: active ? C.brown : C.border,
                        color: active ? '#F5ECD5' : C.muted,
                      }}>
                      {i + 1}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: C.text }}>{name}</div>
                    <div className="text-xs font-medium" style={{ color: C.brown }}>{months}</div>
                    <div className="text-xs leading-relaxed" style={{ color: C.muted }}>{goal}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Risk Matrix */}
        <div className="rounded-xl border" style={{ backgroundColor: C.card, borderColor: C.border }}>
          <div className="px-5 pt-5 pb-3">
            <SectionTitle>Risk Matrix</SectionTitle>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Risk', 'Impact', 'Mitigation'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-xs uppercase tracking-wider font-medium"
                    style={{ color: C.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risks.map(({ risk, impact, mitigation }, i) => (
                <tr key={i}
                  style={{ borderBottom: i < risks.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <td className="px-5 py-3 text-sm font-medium max-w-xs" style={{ color: C.text }}>{risk}</td>
                  <td className="px-5 py-3"><ImpactPill level={impact} /></td>
                  <td className="px-5 py-3 text-xs" style={{ color: C.muted }}>{mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
