import { NextRequest } from 'next/server'
import anthropic from '@/lib/anthropic'
import { personas } from '@/lib/personas'
import type { PersonaKey, Message } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { persona, messages, cfoContext } = await req.json() as {
    persona: PersonaKey
    messages: Message[]
    cfoContext?: string
  }

  if (!persona || !personas[persona]) {
    return new Response('Invalid persona', { status: 400 })
  }

  const personaDef = personas[persona]
  let systemPrompt = personaDef.systemPrompt

  if (persona === 'cfo' && cfoContext) {
    systemPrompt += `\n\n## Financial Document Context\nThe founder has uploaded this financial document for your analysis:\n\n${cfoContext}`
  }

  const anthropicMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const moduleUpdates: string[] = []
      let buffer = ''

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: anthropicMessages,
        stream: true,
      })

      for await (const event of response) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          buffer += event.delta.text

          // Extract and collect module_update tags, stream clean text
          let processed = buffer
          const tagRegex = /<module_update>([\s\S]*?)<\/module_update>/g
          const updates: string[] = []
          processed = processed.replace(tagRegex, (_, content) => {
            updates.push(content)
            return ''
          })

          // If the buffer has a partial opening tag, don't flush that part yet
          const partialTagStart = processed.lastIndexOf('<module_update>')
          const hasPartialClose = partialTagStart !== -1 && !processed.includes('</module_update>', partialTagStart)

          let toFlush: string
          if (hasPartialClose) {
            toFlush = processed.slice(0, partialTagStart)
            buffer = processed.slice(partialTagStart)
          } else {
            toFlush = processed
            buffer = ''
          }

          moduleUpdates.push(...updates)

          if (toFlush) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: toFlush })}\n\n`))
          }
        }
      }

      // Flush remaining buffer
      if (buffer) {
        const cleanBuffer = buffer.replace(/<module_update>[\s\S]*?<\/module_update>/g, '')
        if (cleanBuffer) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: cleanBuffer })}\n\n`))
        }
      }

      // Send module updates as final events
      for (const update of moduleUpdates) {
        try {
          const parsed = JSON.parse(update)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'module_update', ...parsed })}\n\n`))
        } catch {
          // ignore malformed update tags
        }
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
