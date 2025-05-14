'use server'

import { streamText } from 'ai'
import { gemini } from '@/lib/gemini' 
import { openai } from '@/lib/openai'
import { createStreamableValue } from 'ai/rsc'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const chat = async (messages: Message[]) => {
  const stream = createStreamableValue();

  (async () => {
    const { textStream } = streamText({
      model: gemini('gemini-1.5-flash'),
      messages: messages,
    })

    for await (const text of textStream) {
      stream.update(text)
    }

    stream.done()
  })()

  return {
    messages: messages,
    newMessage: stream.value
  }
}