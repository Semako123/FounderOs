import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  const allowedTypes = ['text/plain', 'application/pdf', 'text/csv', 'application/json']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
    return NextResponse.json({ error: 'Unsupported file type. Please upload a .txt, .csv, or .pdf file.' }, { status: 400 })
  }

  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // For text-based files, decode directly
  let content = ''
  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.type === 'application/json') {
    content = new TextDecoder().decode(bytes)
  } else if (file.type === 'application/pdf') {
    // Extract readable text from PDF bytes by grabbing text streams
    const raw = new TextDecoder('latin1').decode(bytes)
    const textMatches = raw.match(/\(([^)]{2,200})\)/g) || []
    content = textMatches
      .map((m) => m.slice(1, -1))
      .filter((t) => /[a-zA-Z]{3,}/.test(t))
      .join(' ')
      .slice(0, 8000)

    if (!content.trim()) {
      content = '[PDF uploaded — text extraction limited. Key financial figures will be referenced in conversation.]'
    }
  }

  return NextResponse.json({ content: content.slice(0, 8000), filename: file.name })
}
