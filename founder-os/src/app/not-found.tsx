import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-4xl">◈</p>
      <h1 className="text-lg font-semibold text-[#1C1612]">Page not found</h1>
      <Link href="/" className="text-sm text-[#6B4C35] hover:text-[#7D5A40] transition-colors">
        Back to FounderOS →
      </Link>
    </main>
  )
}
